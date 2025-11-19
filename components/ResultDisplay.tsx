import React from 'react';
import { ThesisProposal } from '../types';
import ArchitectureDiagram from './ArchitectureDiagram';
import { BookOpen, Cpu, Layers, Target, Code, PlayCircle } from 'lucide-react';

interface Props {
  proposal: ThesisProposal;
  onLaunchPrototype: () => void;
}

const ResultDisplay: React.FC<Props> = ({ proposal, onLaunchPrototype }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full opacity-50 -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full opacity-50 -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
             <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                推薦題目
             </span>
             <button 
                onClick={onLaunchPrototype}
                className="w-full md:w-auto group flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 md:py-2.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
             >
                <PlayCircle size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                啟動系統原型 (Prototype)
             </button>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            {proposal.title}
          </h1>
          <h2 className="text-lg md:text-xl text-slate-500 font-medium mb-8 leading-snug">
            {proposal.englishTitle}
          </h2>
          
          <div className="bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-100">
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-3 text-lg">
              <BookOpen className="text-indigo-600" size={24} />
              論文摘要
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify text-base">
              {proposal.abstract}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          
          {/* Research Questions */}
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-5 pb-3 border-b border-slate-100 text-lg">
              <Target className="text-rose-500" size={24} />
              研究問題
            </h3>
            <ul className="space-y-5">
              {proposal.researchQuestions.map((q, idx) => (
                <li key={idx} className="flex gap-4 text-slate-700">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-base leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Methodology */}
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-5 pb-3 border-b border-slate-100 text-lg">
              <Layers className="text-amber-500" size={24} />
              方法與貢獻
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">研究設計</h4>
                <p className="text-slate-700 text-base leading-relaxed">{proposal.methodology}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">預期貢獻</h4>
                <p className="text-slate-700 text-base leading-relaxed">{proposal.expectedContribution}</p>
              </div>
            </div>
          </div>

           {/* Tech Stack */}
           <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-5 pb-3 border-b border-slate-100 text-lg">
              <Code className="text-emerald-500" size={24} />
              技術棧
            </h3>
            <div className="flex flex-wrap gap-2">
              {proposal.techStack.map((tech, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Architecture */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow border border-slate-100 p-5 md:p-6 h-full flex flex-col">
            <h3 className="flex items-center gap-2 text-slate-900 font-bold mb-5 pb-3 border-b border-slate-100 text-lg">
              <Cpu className="text-blue-600" size={24} />
              系統架構設計
            </h3>
            
            <div className="mb-6 text-slate-700 text-base leading-relaxed">
              {proposal.architectureDescription}
            </div>

            <div className="flex-grow w-full overflow-hidden bg-slate-50 rounded-xl border border-slate-100">
               <ArchitectureDiagram data={proposal.architectureTree} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;