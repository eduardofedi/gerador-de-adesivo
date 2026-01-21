
import React from 'react';
import { EditorState, StickerElement } from '../types';
import { Trash2, Settings2, TextCursorInput, Scissors, Maximize, Palette, RotateCw } from 'lucide-react';

interface PropertiesPanelProps {
  state: EditorState;
  onUpdateState: (updates: Partial<EditorState>) => void;
  selectedElement?: StickerElement;
  onUpdate: (updates: Partial<StickerElement>) => void;
  onDelete: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ state, onUpdateState, selectedElement, onUpdate, onDelete }) => {
  const handleScaleChange = (newVal: number) => {
    if (!selectedElement) return;
    if (selectedElement.type === 'text') {
      // O App.tsx cuidará do recálculo de width/height baseado no fontSize alterado
      onUpdate({ fontSize: newVal });
    } else {
      const ratio = selectedElement.height / selectedElement.width;
      onUpdate({ width: newVal, height: newVal * ratio });
    }
  };

  return (
    <div className="hidden lg:flex flex-col w-80 bg-white border-l border-slate-200 overflow-y-auto shadow-inner">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-blue-600" />
        <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Painel de Ajustes</h3>
      </div>

      <div className="p-6 space-y-8">
        {state.step === 'preview' ? (
          <section className="space-y-6">
            <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
               <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest flex items-center gap-2"> <Scissors className="w-3 h-3" /> Margem de Recorte </h4>
               <p className="text-[11px] text-blue-700 leading-tight">Largura da borda do adesivo.</p>
            </div>
            <input type="range" min="0" max="80" value={state.borderWidth} onChange={(e) => onUpdateState({ borderWidth: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-600" />
            
            <div className="pt-4 border-t border-slate-100 space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Palette className="w-3 h-3" /> Cor do Fundo/Adesivo</h4>
               <div className="flex items-center gap-4">
                  <input type="color" value={state.borderColor} onChange={(e) => onUpdateState({ borderColor: e.target.value })} className="w-12 h-12 rounded-2xl cursor-pointer border-4 border-white shadow-sm" />
                  <span className="text-xs font-black text-slate-500">{state.borderColor.toUpperCase()}</span>
               </div>
            </div>

            {(state.stickerMode === 'square' || state.stickerMode === 'rect') && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Arredondar Quina</label>
                <input type="range" min="0" max="150" value={state.cornerRadius} onChange={(e) => onUpdateState({ cornerRadius: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg accent-slate-400" />
              </div>
            )}
          </section>
        ) : (
          selectedElement ? (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuração</label>
                <button onClick={onDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>

              {selectedElement.type === 'text' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase"> <TextCursorInput className="w-3 h-3" /> Texto </div>
                    <input type="text" value={selectedElement.content} onChange={(e) => onUpdate({ content: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Cor do Texto</label>
                    <div className="flex gap-2">
                      <input type="color" value={selectedElement.fill} onChange={(e) => onUpdate({ fill: e.target.value })} className="w-10 h-10 rounded-xl cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Maximize className="w-3 h-3" /> Escala</label>
                  <span className="text-[10px] font-bold text-slate-400">{selectedElement.type === 'text' ? selectedElement.fontSize : selectedElement.width}px</span>
                </div>
                <input type="range" min="10" max="600" value={selectedElement.type === 'text' ? selectedElement.fontSize : selectedElement.width} onChange={(e) => handleScaleChange(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-600" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><RotateCw className="w-3 h-3" /> Rotação</label>
                  <span className="text-[10px] font-bold text-slate-400">{selectedElement.rotation}°</span>
                </div>
                <input type="range" min="0" max="360" value={selectedElement.rotation} onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg accent-slate-400" />
              </div>
            </section>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Maximize className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Selecione um objeto para ajustar</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
