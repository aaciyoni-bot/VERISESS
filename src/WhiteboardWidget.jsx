import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Trash2 } from 'lucide-react';

export default function WhiteboardWidget() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = 400 * dpr; 
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `400px`;

      const context = canvas.getContext('2d');
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      contextRef.current = context;
    };
    setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? 12 : 3;
    }
  }, [color, tool]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden" ref={wrapperRef}>
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['#000000', '#EF4444', '#3B82F6', '#10B981'].map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button onClick={() => setTool('pen')} className={`p-1.5 rounded-md ${tool === 'pen' ? 'bg-teal-100 text-teal-700' : 'text-gray-600'}`}><PenTool className="w-4 h-4" /></button>
          <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-md ${tool === 'eraser' ? 'bg-gray-200 text-gray-800' : 'text-gray-600'}`}><Eraser className="w-4 h-4" /></button>
        </div>
        <button onClick={clearCanvas} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 relative cursor-crosshair touch-none bg-white">
        <canvas
          ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchMove={draw}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
