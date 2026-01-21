
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
  });

  const addElement = (type: StickerElement['type'], extra: Partial<StickerElement> = {}) => {
    const isBase = extra.isBaseImage;
    const newElement: StickerElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: state.canvasSize / 2 - (isBase ? 150 : 75),
      y: state.canvasSize / 2 - (isBase ? 150 : 20),
      width: isBase ? 300 : 150,
      height: isBase ? 300 : (extra.isSocial ? 40 : 60),
      rotation: 0,
      content: type === 'text' ? 'Novo Texto' : undefined,
      fontSize: type === 'text' ? (extra.isSocial ? 28 : 24) : undefined,
      fontFamily: type === 'text' ? 'Inter' : undefined,
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
      elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el),
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
