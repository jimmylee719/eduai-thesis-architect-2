import React, { useState, useEffect, useRef } from 'react';
import { SelectionItem, ThesisProposal, User } from './types';
import { AI_TECHS, EDU_THEORIES, TARGET_AUDIENCES, PLATFORMS } from './constants';
import { generateThesisProposal } from './services/geminiService';
import { logService, authService } from './services/mockBackend';
import TopicBuilder from './components/TopicBuilder';
import ResultDisplay from './components/ResultDisplay';
import LearningSystem from './components/LearningSystem';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import { GraduationCap, AlertCircle, PlayCircle, FileText, ArrowRight, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // View State: 'landing' | 'generator' | 'prototype'
  const [view, setView] = useState<'landing' | 'generator' | 'prototype'>('landing');

  // State for selections
  const [selectedTech, setSelectedTech] = useState<SelectionItem[]>([]);
  const [selectedTheory, setSelectedTheory] = useState<SelectionItem[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<SelectionItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SelectionItem[]>([]);

  // State for generation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ThesisProposal | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Initialize Session
  useEffect(() => {
    const sessionUser = authService.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setIsAuthChecking(false);
  }, []);

  // Auth Handlers
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('landing');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('landing');
    // Reset generation state
    setProposal(null);
    setSelectedTech([]);
  };

  const toggleSelection = (item: SelectionItem) => {
    const updateState = (
      current: SelectionItem[],
      setter: React.Dispatch<React.SetStateAction<SelectionItem[]>>
    ) => {
      const exists = current.find(i => i.id === item.id);
      if (exists) {
        setter(current.filter(i => i.id !== item.id));
      } else {
        setter([...current, item]);
      }
    };

    switch (item.category) {
      case 'tech': updateState(selectedTech, setSelectedTech); break;
      case 'theory': updateState(selectedTheory, setSelectedTheory); break;
      case 'target': updateState(selectedTarget, setSelectedTarget); break;
      case 'platform': updateState(selectedPlatform, setSelectedPlatform); break;
    }
  };

  const handleRandomize = () => {
    const randomItem = (arr: SelectionItem[]) => arr[Math.floor(Math.random() * arr.length)];
    
    setSelectedTech([randomItem(AI_TECHS)]);
    setSelectedTheory([randomItem(EDU_THEORIES)]);
    setSelectedTarget([randomItem(TARGET_AUDIENCES)]);
    setSelectedPlatform([randomItem(PLATFORMS)]);
    
    setProposal(null); 
    setError(null);
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setProposal(null);

    // Log action
    logService.addLog(user.email, 'GENERATE_THESIS', '開始生成論文架構');

    try {
      const result = await generateThesisProposal(
        selectedTech,
        selectedTheory,
        selectedTarget,
        selectedPlatform
      );
      setProposal(result);
      
      logService.addLog(user.email, 'GENERATE_SUCCESS', `成功生成: ${result.title}`);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      const errorMessage = err.message || "生成失敗";
      setError(`生成失敗: ${errorMessage}`);
      logService.addLog(user.email, 'GENERATE_ERROR', `生成失敗: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // 1. Check Authentication
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 2. Check Admin Role
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // 3. Normal User Flow

  // Render Prototype View
  if (view === 'prototype') {
    return <LearningSystem currentUser={user} onBack={() => setView('landing')} />;
  }

  // Render Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         {/* Background Decorations */}
         <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>

         {/* User Info & Logout */}
         <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
            <span className="text-sm text-slate-500 font-medium hidden md:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="p-2 bg-white rounded-full shadow hover:bg-slate-50 text-slate-600 transition-colors">
               <LogOut size={16} />
            </button>
         </div>

         <div className="max-w-3xl w-full z-10 text-center space-y-10 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg mb-4 text-indigo-600">
                <GraduationCap size={48} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                EduAI <span className="text-indigo-600">Research & Lab</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                探索教育科技的未來。產生專業的碩士論文架構，或直接體驗基於鷹架理論的智慧學習系統原型。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              
              {/* Card 1: Prototype */}
              <button 
                onClick={() => setView('prototype')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:border-indigo-500 transition-all hover:shadow-2xl text-left flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-indigo-600 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="mb-6 p-3 bg-indigo-50 w-fit rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                  <PlayCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">啟動系統原型</h3>
                <p className="text-slate-500 text-sm mb-6 flex-grow">
                  體驗基於 AI Agent 與 Scaffolding Theory 的適應性智慧寫作教練環境。
                </p>
                <div className="flex items-center text-indigo-600 font-bold text-sm">
                  進入系統 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 2: Generator */}
              <button 
                onClick={() => setView('generator')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:border-rose-500 transition-all hover:shadow-2xl text-left flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-rose-600 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="mb-6 p-3 bg-rose-50 w-fit rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">論文架構生成器</h3>
                <p className="text-slate-500 text-sm mb-6 flex-grow">
                  自定義技術、理論與對象，快速產出具備學術價值的論文提案與架構圖。
                </p>
                <div className="flex items-center text-rose-600 font-bold text-sm">
                  開始構思 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>

            <p className="text-slate-400 text-xs pt-8">Powered by Google Gemini 2.5 Flash</p>
         </div>
      </div>
    );
  }

  // Render Generator View
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">EduAI Thesis Architect</h1>
              <p className="text-xs text-slate-500">教育科技與 AI 碩士論文架構生成器</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium hidden sm:block">Hi, {user.name}</span>
            <button 
                onClick={() => setView('landing')}
                className="text-sm text-slate-500 hover:text-slate-900 font-medium"
            >
                回首頁
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Builder Component */}
        <TopicBuilder 
          selectedTech={selectedTech}
          selectedTheory={selectedTheory}
          selectedTarget={selectedTarget}
          selectedPlatform={selectedPlatform}
          toggleSelection={toggleSelection}
          onGenerate={handleGenerate}
          onRandomize={handleRandomize}
          isGenerating={isLoading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r shadow-sm flex items-center gap-3">
            <AlertCircle className="text-rose-500" size={24} />
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {/* Result Display */}
        <div ref={resultRef}>
          {proposal && (
            <ResultDisplay 
                proposal={proposal} 
                onLaunchPrototype={() => {
                    logService.addLog(user.email, 'NAVIGATE', '從生成頁面跳轉至原型系統');
                    setView('prototype');
                }} 
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;