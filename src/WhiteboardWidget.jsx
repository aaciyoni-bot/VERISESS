import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Download, Trash2, ShieldCheck } from 'lucide-react';

export default function WhiteboardWidget() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen'); // 'pen' או 'eraser'

  // אתחול הקנבס ברגע שהקומפוננטה נטענת
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    
    // התאמת הקנבס לרזולוציה של המסך (למניעת טשטוש)
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    
    // סטייל לתצוגה
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `400px`;

    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // מילוי רקע לבן התחלתי
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;

    // מאזין לשינוי גודל חלון כדי לעדכן מידות
    const handleResize = () => {
      // בפרודקשן נשמור את התמונה לפני ה-Resize ונחזיר אחריה
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // עדכון כלי הציור כאשר המשתמש משנה הגדרות
  useEffect(() => {
    if (contextRef.current) {
      if (tool === 'eraser') {
        contextRef.current.strokeStyle = '#ffffff'; // מוחק על ידי צביעה בלבן
        contextRef.current.lineWidth = lineWidth * 5; // מחק רחב יותר
      } else {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;
      }
    }
  }, [color, lineWidth, tool]);

  // התחלת ציור (לחיצה ראשונה)
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // סיום ציור (עזיבת העכבר)
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // פעולת הציור עצמה
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // עזר לחישוב קואורדינטות (תומך בעכבר ובמגע/סמארטפון)
  const getCoordinates = (event) => {
    if (event.touches && event.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: event.nativeEvent ? event.nativeEvent.offsetX : event.offsetX,
      offsetY: event.nativeEvent ? event.nativeEvent.offsetY : event.offsetY
    };
  };

  // מחיקת הלוח
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  // הורדת הלוח כתמונה
  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'VeriSess_Whiteboard.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm" ref={wrapperRef} dir="rtl">
      
      {/* Header - מידע וכלים */}
      <div className="bg-blue-900 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h2 className="font-bold text-sm">לוח משותף מאובטח</h2>
        </div>
        <div className="text-xs bg-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          סנכרון חי (Live)
        </div>
      </div>

      {/* סרגל הכלים (Toolbar) */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          
          {/* בחירת צבע */}
          <div className="flex gap-1.5">
            {['#000000', '#EF4444', '#3B82F6', '#10B981'].map(c => (
              <button 
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c && tool === 'pen' ? 'border-gray-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
                title={`צבע ${c}`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* כלי עט / מחק */}
          <button 
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors ${tool === 'pen' ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <PenTool className="w-4 h-4" /> עט
          </button>
          
          <button 
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors ${tool === 'eraser' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <Eraser className="w-4 h-4" /> מחק
          </button>
        </div>

        {/* פעולות מחיקה והורדה */}
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadWhiteboard}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
            title="שמור תמונה למחשב"
          >
            <Download className="w-4 h-4" /> שמור
          </button>
          <button 
            onClick={clearCanvas}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
            title="נקה את כל הלוח"
          >
            <Trash2 className="w-4 h-4" /> נקה
          </button>
        </div>
      </div>

      {/* אזור הציור (Canvas) */}
      <div className="flex-1 relative cursor-crosshair touch-none bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchMove={draw}
          className="w-full h-full absolute inset-0 z-10"
        />
        {/* שכבת סימן מים (Watermark) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none z-0 overflow-hidden">
          <span className="text-4xl font-black text-gray-900 rotate-[-30deg]">VeriSess Secure</span>
        </div>
      </div>
      
      {/* Footer מידע */}
      <div className="bg-gray-100 p-1.5 text-center text-[10px] text-gray-500 border-t border-gray-200">
        המידע לא נשמר על שרתי החברה בתום השיחה מטעמי פרטיות.
      </div>
    </div>
  );
}
