
import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorState, StickerElement } from '../types';
import { AlertCircle } from 'lucide-react';

interface CanvasEditorProps {
  state: EditorState;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<StickerElement>) => void;
  onUpdateState: (updates: Partial<EditorState>) => void;
}

export interface CanvasEditorHandle {
  getLayerData: (layer: 'background' | 'full') => string;
}

const SOCIAL_ICONS = {
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.44-.645-1.44-1.44s.645-1.44 1.44-1.44z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
};

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({ state, onSelect, onUpdate, onUpdateState }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    state.elements.forEach(el => {
      if (el.type === 'image' && el.src && !images[el.id]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = el.src;
        img.onload = () => setImages(prev => ({ ...prev, [el.id]: img }));
      }
    });
  }, [state.elements, images]);

  const drawElement = (ctx: CanvasRenderingContext2D, el: StickerElement, isForSilhouette: boolean = false) => {
    const img = images[el.id];
    ctx.save();
    ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
    ctx.rotate((el.rotation * Math.PI) / 180);
    ctx.translate(-(el.width / 2), -(el.height / 2));

    if (el.type === 'image' && img) {
      if (isForSilhouette) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = el.width; tempCanvas.height = el.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, el.width, el.height);
          tempCtx.globalCompositeOperation = 'source-in';
          tempCtx.fillStyle = '#000000';
          tempCtx.fillRect(0, 0, el.width, el.height);
          ctx.drawImage(tempCanvas, 0, 0);
        }
      } else {
        ctx.drawImage(img, 0, 0, el.width, el.height);
      }
    } else if (el.type === 'text') {
      const fontSize = el.fontSize || 24;
      ctx.font = `bold ${fontSize}px ${el.fontFamily || 'Inter'}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      let textX = 0;
      if (el.isSocial) {
        ctx.save();
        ctx.translate(fontSize * 0.6, el.height / 2);
        const s = fontSize * 0.9 / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fillStyle = el.useOfficialColor ? (el.isSocial === 'whatsapp' ? '#25D366' : '#E1306C') : (el.socialColor || el.fill || '#000000');
        if (isForSilhouette) ctx.fillStyle = '#000000';
        ctx.fill(new Path2D(SOCIAL_ICONS[el.isSocial]));
        ctx.restore();
        textX = fontSize * 1.4;
      }
      ctx.fillStyle = isForSilhouette ? '#000000' : (el.fill || '#000000');
      ctx.fillText(el.content || '', textX, el.height / 2);
    }
    ctx.restore();
  };

  const fillInternalHoles = (ctx: CanvasRenderingContext2D, sz: number) => {
    const imageData = ctx.getImageData(0, 0, sz, sz);
    const data = imageData.data;
    const width = sz;
    const height = sz;

    const visited = new Uint8Array(width * height);
    const stack: [number, number][] = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = y * width + x;
      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || data[idx * 4 + 3] > 10) continue;
      visited[idx] = 1;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    for (let i = 0; i < width * height; i++) {
      if (visited[i] === 0) data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const drawProfessionalSilhouette = (ctx: CanvasRenderingContext2D, b: number, color: string) => {
    const sz = state.canvasSize;
    const sil = document.createElement('canvas');
    sil.width = sil.height = sz;
    const sCtx = sil.getContext('2d');
    if (!sCtx) return;
    state.elements.forEach(el => drawElement(sCtx, el, true));
    
    const rbCanvas = document.createElement('canvas');
    rbCanvas.width = rbCanvas.height = sz;
    const rbCtx = rbCanvas.getContext('2d');
    if (!rbCtx) return;

    const steps = Math.max(200, b * 10);
    for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        rbCtx.drawImage(sil, Math.cos(a) * b, Math.sin(a) * b);
    }
    rbCtx.drawImage(sil, 0, 0);
    fillInternalHoles(rbCtx, sz);

    const finalMask = document.createElement('canvas');
    finalMask.width = finalMask.height = sz;
    const fmCtx = finalMask.getContext('2d');
    if (!fmCtx) return;

    const smoothingRadius = 0.8; 
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = blurCanvas.height = sz;
    const bCtx = blurCanvas.getContext('2d');
    if (bCtx) {
        bCtx.filter = `blur(${smoothingRadius}px)`;
        bCtx.drawImage(rbCanvas, 0, 0);
        const idata = bCtx.getImageData(0, 0, sz, sz);
        const data = idata.data;
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha < 127) data[i + 3] = 0;
            else if (alpha > 132) data[i + 3] = 255;
            else data[i + 3] = (alpha - 127) * 51; 
        }
        fmCtx.putImageData(idata, 0, 0);
    }

    ctx.save();
    const cl = document.createElement('canvas');
    cl.width = cl.height = sz;
    const clCtx = cl.getContext('2d');
    if (clCtx) {
        clCtx.fillStyle = color;
        clCtx.fillRect(0, 0, sz, sz);
        clCtx.globalCompositeOperation = 'destination-in';
        clCtx.drawImage(finalMask, 0, 0);
        ctx.drawImage(cl, 0, 0);
    }
    ctx.restore();
    return finalMask;
  };

  const renderToCanvas = (ctx: CanvasRenderingContext2D, mode: 'background' | 'full') => {
    const sz = state.canvasSize;
    ctx.clearRect(0, 0, sz, sz);
    
    const c = sz / 2;
    const b = state.borderWidth;

    if (state.step === 'preview' || mode === 'background') {
      if (state.stickerMode === 'special') {
        const mask = drawProfessionalSilhouette(ctx, b, state.borderColor);
        if (state.showPinkCutLine && mask) {
            ctx.save();
            const stroke = document.createElement('canvas');
            stroke.width = stroke.height = sz;
            const sCtx = stroke.getContext('2d');
            if (sCtx) {
                sCtx.drawImage(mask, -0.8, 0); sCtx.drawImage(mask, 0.8, 0);
                sCtx.drawImage(mask, 0, -0.8); sCtx.drawImage(mask, 0, 0.8);
                sCtx.globalCompositeOperation = 'destination-out';
                sCtx.drawImage(mask, 0, 0);
                const pink = document.createElement('canvas');
                pink.width = pink.height = sz;
                const pCtx = pink.getContext('2d');
                if (pCtx) {
                    pCtx.fillStyle = '#FF1493'; pCtx.fillRect(0, 0, sz, sz);
                    pCtx.globalCompositeOperation = 'destination-in';
                    pCtx.drawImage(stroke, 0, 0);
                    ctx.drawImage(pink, 0, 0);
                }
            }
            ctx.restore();
        }
      } else {
        ctx.beginPath();
        if (state.stickerMode === 'round') ctx.arc(c, c, 240 + b, 0, Math.PI * 2);
        else if (state.stickerMode === 'square') ctx.roundRect(c - (240 + b), c - (240 + b), 480 + b*2, 480 + b*2, state.cornerRadius);
        else if (state.stickerMode === 'rect') ctx.roundRect(c - (270 + b), c - (115 + b), 540 + b*2, 230 + b*2, state.cornerRadius);
        ctx.fillStyle = state.borderColor;
        ctx.fill();
        if (state.showPinkCutLine) {
          ctx.save(); ctx.strokeStyle = '#FF1493'; ctx.lineWidth = 1; ctx.setLineDash([4, 2]); ctx.stroke(); ctx.restore();
        }
      }
    }

    if (mode === 'full') {
      state.elements.forEach(el => drawElement(ctx, el));
    }
  };

  useImperativeHandle(ref, () => ({
    getLayerData: (layer: 'background' | 'full') => {
      const temp = document.createElement('canvas');
      temp.width = temp.height = state.canvasSize;
      const tCtx = temp.getContext('2d');
      if (tCtx) {
        renderToCanvas(tCtx, layer);
        return temp.toDataURL('image/png', 1.0);
      }
      return '';
    }
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderToCanvas(ctx, 'full');

    if (state.selectedId && state.step === 'edit') {
      const el = state.elements.find(e => e.id === state.selectedId);
      if (el) {
        ctx.save();
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate(el.rotation * Math.PI / 180);
        ctx.translate(-el.width / 2, -el.height / 2);
        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.strokeRect(-2, -2, el.width + 4, el.height + 4);
        ctx.restore();
      }
    }
  }, [state, images]);

  useEffect(() => draw(), [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (state.step === 'preview') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (state.canvasSize / rect.width);
    const y = (e.clientY - rect.top) * (state.canvasSize / rect.height);
    let hitId: string | null = null;
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const el = state.elements[i];
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
        hitId = el.id; setDragOffset({ x: x - el.x, y: y - el.y }); break;
      }
    }
    onSelect(hitId); setDraggingId(hitId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || state.step === 'preview') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const nx = (e.clientX - rect.left) * (state.canvasSize / rect.width) - dragOffset.x;
    const ny = (e.clientY - rect.top) * (state.canvasSize / rect.height) - dragOffset.y;
    onUpdate(draggingId, { x: nx, y: ny });
  };

  return (
    <div className="relative bg-white rounded-[60px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border-[16px] border-white ring-1 ring-slate-200">
      <canvas 
        ref={canvasRef} 
        width={state.canvasSize} height={state.canvasSize} 
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} 
        onMouseUp={() => setDraggingId(null)} onMouseLeave={() => setDraggingId(null)} 
        className={`${state.step === 'edit' ? 'cursor-move' : 'cursor-default'} rounded-[40px] w-full max-w-[600px] aspect-square`} 
      />
      
      {state.step === 'preview' && (
        <div className="absolute bottom-[12%] left-6 right-6 bg-white/95 backdrop-blur-sm border border-orange-200 p-3 rounded-2xl flex items-center gap-3 shadow-xl z-10 transition-all">
          <div className="bg-orange-500 p-1.5 rounded-lg text-white flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-black text-orange-700 uppercase leading-tight tracking-tight">
            Imagem ilustrativa, a arte final será aprovada no setor de artes com o designer responsável pelo pedido
          </p>
        </div>
      )}
    </div>
  );
});

export default CanvasEditor;
