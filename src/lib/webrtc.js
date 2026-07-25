// =========================================================
// VeriSess — מנוע וידאו 1-על-1 אמיתי (WebRTC + Firestore signaling)
// =========================================================
// ללא שירות חיצוני בתשלום: peer-to-peer עם שרתי STUN ציבוריים של Google.
// הסיגנלינג (offer/answer/ICE) עובר דרך Firestore:
//   artifacts/{appId}/public/data/rooms/{roomId}
//     .offer / .answer
//     /callerCandidates/*  /calleeCandidates/*
// הראשון שנכנס = caller (יוצר offer); השני = callee (יוצר answer).
//
// הערה: STUN בלבד מספיק לרוב הרשתות. מאחורי NAT סימטרי/פיירוול קפדני
// ייתכן שיידרש שרת TURN (בתשלום) — נוסיף בהמשך אם צריך.

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc,
} from 'firebase/firestore';
import { db, appId } from '../firebase.js';

const RTC_CONFIG = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
};

export function useWebRTC({ roomId, active = true }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('idle');   // idle|connecting|connected|disconnected|failed|no-media
  const [role, setRole] = useState(null);          // caller|callee
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const unsubsRef = useRef([]);

  useEffect(() => {
    if (!active || !roomId || !db) return;
    let cancelled = false;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    const remote = new MediaStream();
    setRemoteStream(remote);
    setStatus('connecting');

    pc.addEventListener('track', (event) => {
      event.streams[0]?.getTracks().forEach((t) => remote.addTrack(t));
    });
    pc.addEventListener('connectionstatechange', () => {
      if (!cancelled) setStatus(pc.connectionState);
    });

    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    const callerCands = collection(roomRef, 'callerCandidates');
    const calleeCands = collection(roomRef, 'calleeCandidates');

    (async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.error('[VeriSess] גישה למצלמה נכשלה:', err?.name || err);
        if (!cancelled) setStatus('no-media');
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      localStreamRef.current = stream;
      setLocalStream(stream);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      let snap;
      try { snap = await getDoc(roomRef); } catch (e) { console.error(e); }
      const isCaller = !snap || !snap.exists() || !snap.data()?.offer;
      setRole(isCaller ? 'caller' : 'callee');

      if (isCaller) {
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) addDoc(callerCands, e.candidate.toJSON()).catch(() => {});
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp }, createdAt: Date.now() });

        unsubsRef.current.push(onSnapshot(roomRef, (d) => {
          const data = d.data();
          if (data?.answer && pc.signalingState !== 'stable' && !pc.currentRemoteDescription) {
            pc.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(() => {});
          }
        }));
        unsubsRef.current.push(onSnapshot(calleeCands, (s) => {
          s.docChanges().forEach((c) => {
            if (c.type === 'added') pc.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {});
          });
        }));
      } else {
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) addDoc(calleeCands, e.candidate.toJSON()).catch(() => {});
        });
        await pc.setRemoteDescription(new RTCSessionDescription(snap.data().offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

        unsubsRef.current.push(onSnapshot(callerCands, (s) => {
          s.docChanges().forEach((c) => {
            if (c.type === 'added') pc.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {});
          });
        }));
      }
    })();

    return () => {
      cancelled = true;
      unsubsRef.current.forEach((u) => { try { u(); } catch { /* noop */ } });
      unsubsRef.current = [];
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
      try { pc.close(); } catch { /* noop */ }
    };
  }, [roomId, active]);

  const toggleTrack = useCallback((kind) => {
    const s = localStreamRef.current;
    if (!s) return false;
    const tracks = kind === 'video' ? s.getVideoTracks() : s.getAudioTracks();
    let enabled = true;
    tracks.forEach((t) => { t.enabled = !t.enabled; enabled = t.enabled; });
    return enabled;
  }, []);

  return { localStream, remoteStream, status, role, toggleTrack };
}
