import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Save } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
  width?: number;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSave,
  onClear,
  width = 600,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Signez dans la zone ci-dessus
        </p>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasDrawn}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>

          <button
            type="button"
            onClick={saveSignature}
            disabled={!hasDrawn}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};