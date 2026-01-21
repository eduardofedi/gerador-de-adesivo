
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  ArrowRight,
  Edit3,
  Eye
} from 'lucide-react';
import { StickerElement, EditorState, EditorStep } from './types';
import CanvasEditor, { CanvasEditorHandle } from './components/CanvasEditor';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';

// Utilitário para medir o tamanho real do texto
export const measureText = (text: string, fontSize: number, fontFamily: string, isSocial?: string): { width: number, height: number } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { width: 150, height: fontSize * 1.2 };
  
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const iconPadding = isSocial ? fontSize * 1.4 : 0;
  
  return {
    width: textWidth + iconPadding + 10, // margem de segurança
    height: fontSize * 1.2
  };
};

const App: React.FC = () => {
  const editorRef = useRef<CanvasEditorHandle>(null);
  const [state, setState] = useState<EditorState>({
    elements: [],
    selectedId: null,
    canvasSize: 600,
    stickerMode: 'special',
    borderColor: '#ffffff',
    borderWidth: 15,
    cornerRadius: 20,
    step: 'edit',
    showPinkCutLine: true,
    warningConfig: {
      x: 30,
      y: 480,
      width: 540
    }
  });

  const addElement = (type: StickerElement['type'], extra: Partial<StickerElement> = {}) => {
    const isBase = extra.isBaseImage;
    const initialContent = extra.content || (type === 'text' ? 'Novo Texto' : undefined);
    const initialFontSize = extra.fontSize || (type === 'text' ? (extra.isSocial ? 28 : 24) : 24);
    const initialFont = 'Inter'; // Sempre utiliza Inter

    // Se a largura e altura já vierem no extra (como no caso de imagens carregadas), usamos elas.
    // Caso contrário, usamos os padrões.
    let width = extra.width || 150;
    let height = extra.height || 60;

    if (type === 'text' && initialContent) {
      const size = measureText(initialContent, initialFontSize, initialFont, extra.isSocial);
      width = size.width;
      height = size.height;
    } else if (isBase && !extra.width) {
      // Padrão de segurança caso não tenha vindo largura no extra
      width = 300;
      height = 300;
    }

    const newElement: StickerElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: state.canvasSize / 2 - width / 2,
      y: state.canvasSize / 2 - height / 2,
      width,
      height,
      rotation: 0,
      content: initialContent,
      fontSize: initialFontSize,
      fontFamily: initialFont,
      fill: type === 'text' ? (extra.isSocial ? (extra.isSocial === 'whatsapp' ? '#25D366' : '#E1306C') : '#000000') : '#fb923c',
      stroke: '#ffffff',
      strokeWidth: 2,
      useOfficialColor: true,
      ...extra,
    };

    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedId: newElement.id,
    }));
  };

  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id !== id) return el;
        
        const next = { ...el, ...updates };
        // Se for texto e mudar escala ou conteúdo, remede
        if (next.type === 'text' && (updates.content !== undefined || updates.fontSize !== undefined)) {
          const size = measureText(next.content || '', next.fontSize || 24, 'Inter', next.isSocial);
          next.width = size.width;
          next.height = size.height;
        }
        return next;
      }),
    }));
  };

  const deleteElement = (id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  };

  const setStep = (step: EditorStep) => {
    setState(prev => ({ ...prev, step, selectedId: null }));
  };

  const selectedElement = state.elements.find(el => el.id === state.selectedId);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden selection:bg-blue-200">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Plus className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">StickerZap</h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setStep('edit')}
              className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                state.step === 'edit' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edição
            </button>
            <button
              onClick={() => setStep('preview')}
              className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                state.step === 'preview' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Prévia
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {state.step === 'edit' && (
            <button 
              onClick={() => setStep('preview')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Finalizar
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <Sidebar 
          state={state} 
          onAddElement={addElement} 
          onUpdateState={(u) => setState(p => ({...p, ...u}))} 
        />

        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 bg-slate-100 canvas-container">
          <CanvasEditor 
            ref={editorRef}
            state={state} 
            onSelect={(id) => setState(prev => ({ ...prev, selectedId: id }))}
            onUpdate={updateElement}
            onUpdateState={(u) => setState(p => ({...p, ...u}))}
          />
        </div>

        <PropertiesPanel 
          state={state}
          onUpdateState={(updates) => setState(prev => ({ ...prev, ...updates }))}
          selectedElement={selectedElement}
          onUpdate={(updates) => selectedElement && updateElement(selectedElement.id, updates)}
          onDelete={() => selectedElement && deleteElement(selectedElement.id)}
        />
      </main>
    </div>
  );
};

export default App;
