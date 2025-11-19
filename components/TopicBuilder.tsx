import React from 'react';
import { AI_TECHS, EDU_THEORIES, TARGET_AUDIENCES, PLATFORMS } from '../constants';
import { SelectionItem } from '../types';
import { Check, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  selectedTech: SelectionItem[];
  selectedTheory: SelectionItem[];
  selectedTarget: SelectionItem[];
  selectedPlatform: SelectionItem[];
  toggleSelection: (item: SelectionItem) => void;
  onGenerate: () => void;
  onRandomize: () => void;
  isGenerating: boolean;
}

const Section: React.FC<{ title: string; items: SelectionItem[]; selected: SelectionItem[]; onToggle: (i: SelectionItem) => void }> = ({ title, items, selected, onToggle }) => {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const isSelected = selected.some(s => s.id === item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item)}
              className={`px-4 py-3 md:px-3 md:py-2 rounded-xl md:rounded-lg text-sm md:text-sm font-medium transition-all duration-200 border flex items-center gap-2 active:scale-95 touch-manipulation
                ${isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              {isSelected && <Check size={16} className="flex-shrink-0" />}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TopicBuilder: React.FC<Props> = ({
  selectedTech, selectedTheory, selectedTarget, selectedPlatform,
  toggleSelection, onGenerate, onRandomize, isGenerating
}) => {

  const canGenerate = selectedTech.length > 0 && selectedTheory.length > 0 && selectedTarget.length > 0 && selectedPlatform.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 md:p-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">1. 建構你的研究組合</h2>
        <button 
          onClick={onRandomize}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1.5 transition-colors bg-indigo-50 px-4 py-2 rounded-full active:bg-indigo-100"
        >
          <RefreshCw size={16} />
          <span>隨機靈感</span>
        </button>
      </div>

      <div className="space-y-2">
        <Section title="AI 核心技術" items={AI_TECHS} selected={selectedTech} onToggle={toggleSelection} />
        <Section title="教育理論" items={EDU_THEORIES} selected={selectedTheory} onToggle={toggleSelection} />
        <Section title="目標對象" items={TARGET_AUDIENCES} selected={selectedTarget} onToggle={toggleSelection} />
        <Section title="實作平台" items={PLATFORMS} selected={selectedPlatform} onToggle={toggleSelection} />
      </div>

      <div className="mt-8 sticky bottom-0 -mx-5 p-5 bg-white/95 backdrop-blur-sm border-t border-slate-100 md:relative md:bottom-auto md:mx-0 md:p-0 md:bg-transparent md:border-none z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
        <button
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
          className={`w-full justify-center px-8 py-4 md:py-3 rounded-xl font-bold text-lg md:text-base text-white flex items-center gap-2 shadow-lg transition-all
            ${!canGenerate 
              ? 'bg-slate-300 cursor-not-allowed' 
              : isGenerating 
                ? 'bg-indigo-400 cursor-wait' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
            }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              構思中...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              生成論文架構
            </>
          )}
        </button>
        {!canGenerate && (
          <p className="text-center md:text-right text-xs text-rose-500 mt-3 font-medium">請從每個類別至少選擇一個項目</p>
        )}
      </div>
    </div>
  );
};

export default TopicBuilder;