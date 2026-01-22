
import React from 'react';
import { 
  Type, 
  Upload, 
  Instagram, 
  Phone, 
  Circle, 
  Square, 
  BoxSelect, 
  Sparkles,
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Activity
} from 'lucide-react';
import { StickerElement, EditorState, StickerMode } from '../types';

interface SidebarProps {
  state: EditorState;
  onAddElement: (type: StickerElement['type'], extra?: Partial<StickerElement>) => void;
  onUpdateState: (updates: Partial<EditorState>) => void;
  usageCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onAddElement, onUpdateState, usageCount }) => {

  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const newElements = [...state.elements];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= newElements.length) return;
    [newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]];
    onUpdateState({ elements: newElements });
  };

  const deleteLayer = (id: string) => {
    onUpdateState({
      elements: state.elements.filter(el => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        // Criar objeto de imagem temporário para obter proporções
        const img = new Image();
        img.onload = () => {
          const maxWidth = 300;
          const ratio = img.height / img.width;
          const width = Math.min(img.width, maxWidth);
          const height = width * ratio;
          
          onAddElement('image', { 
            src, 
            isBaseImage: true,
            width,
            height
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 overflow-hidden">
      {/* Ferramentas */}
      <div className="p-6 border-b border-slate-100 space-y-6 flex-shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Ferramentas</h3>
        
        {state.step === 'edit' ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 cursor-pointer transition-all group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase">Foto</span>
            </label>
            
            <button onClick={() => onAddElement('text', { content: 'Texto', fontSize: 30 })} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
              <Type className="w-5 h-5 text-slate-600" />
              <span className="text-[10px] font-black text-slate-600 uppercase">Texto</span>
            </button>
            
            <button onClick={() => onAddElement('text', { content: '@seu_insta', isSocial: 'instagram', fontSize: 32 })} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-pink-50 border border-pink-100 hover:bg-pink-100 transition-all">
              <Instagram className="w-5 h-5 text-pink-600" />
              <span className="text-[10px] font-black text-pink-700 uppercase">Insta</span>
            </button>
            
            <button onClick={() => onAddElement('text', { content: '(00) 00000-0000', isSocial: 'whatsapp', fontSize: 32 })} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase">Zap</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
             {[
               { mode: 'special', label: 'Corte Especial', icon: <Sparkles className="w-4 h-4"/> },
               { mode: 'round', label: 'Círculo', icon: <Circle className="w-4 h-4"/> },
               { mode: 'square', label: 'Quadrado', icon: <Square className="w-4 h-4"/> },
               { mode: 'rect', label: 'Retangular', icon: <BoxSelect className="w-4 h-4"/> },
             ].map(item => (
               <button 
                key={item.mode} 
                onClick={() => onUpdateState({ stickerMode: item.mode as StickerMode })} 
                className={`flex items-center gap-3 w-full p-4 rounded-2xl border transition-all font-black uppercase text-[10px] tracking-widest ${state.stickerMode === item.mode ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white'}`}
               >
                {item.icon}
                {item.label}
              </button>
             ))}
          </div>
        )}
      </div>

      {/* Camadas */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-6 flex items-center justify-between flex-shrink-0">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
             <Layers className="w-3 h-3" /> Objetos / Camadas
           </h3>
           <span className="text-[10px] font-bold text-slate-300">{state.elements.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {state.elements.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[11px] text-slate-400 font-medium italic">Nenhum objeto adicionado</p>
            </div>
          ) : (
            [...state.elements].reverse().map((el, i) => {
              const actualIdx = state.elements.length - 1 - i;
              const isSelected = state.selectedId === el.id;
              
              return (
                <div 
                  key={el.id}
                  onClick={() => onUpdateState({ selectedId: el.id })}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {el.type === 'text' ? <Type className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {el.type === 'text' ? (el.content || 'Texto') : 'Imagem'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{el.type}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(actualIdx, 'up'); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(actualIdx, 'down'); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(el.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer de Contagem - Movido para o Sidebar */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm select-none transition-all hover:shadow-md">
          <div className="bg-blue-100 p-1 rounded-md flex-shrink-0">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
            Utilizações da Prévia: <span className="text-blue-600 ml-1">{usageCount}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
