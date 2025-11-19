import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, Brain, BarChart2, CheckCircle, ArrowLeft, MessageSquare, FileText, PenTool, BookOpen, Sparkles } from 'lucide-react';
import { ChatMessage, StudentState, User } from '../types';
import { generateScaffoldingResponse } from '../services/geminiService';
import { logService } from '../services/mockBackend';

interface Props {
    onBack: () => void;
    currentUser: User;
}

const LearningSystem: React.FC<Props> = ({ onBack, currentUser }) => {
    // Mobile Tab State: 'editor' | 'chat'
    const [activeTab, setActiveTab] = useState<'editor' | 'chat'>('editor');

    // Mock Task Data (Education / Critical Thinking)
    const task = {
        title: "議題探討：AI 與教育的未來",
        description: "請撰寫一篇 200 字以內的短文，表達你對「AI 是否應該完全取代人類教師？」的看法。請包含明確的主張、支持的理由，以及具體的例子。",
        goals: ["提出明確主張 (Claim)", "提供證據/例子 (Evidence)", "邏輯推論 (Reasoning)"]
    };

    // State
    const [studentState, setStudentState] = useState<StudentState>({
        code: "", // Reuse 'code' field for text content to avoid deep refactoring, conceptually it's 'content'
        conceptMastery: 30,
        cognitiveLoad: 'optimal',
        engagement: 'passive'
    });

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'agent',
            content: '你好！我是你的寫作教練。今天我們要探討 AI 是否應該取代人類教師。你不需要一開始就寫得很完美，試著先寫下你的核心觀點，我會引導你完善論述。',
            timestamp: new Date(),
            type: 'encouragement'
        }
    ]);

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStudentState(prev => ({ ...prev, code: e.target.value, engagement: 'active' }));
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Log User Action
        logService.addLog(currentUser.email, 'CHAT_USER', `提問: ${input}`);

        try {
            // Simulate Analysis Delay (System Architecture: Learning Analytics Module)
            await new Promise(resolve => setTimeout(resolve, 600)); 
            
            // Call Gemini Scaffolding Agent
            const responseText = await generateScaffoldingResponse(
                studentState.code,
                input,
                messages
            );

            const agentMsg: ChatMessage = {
                role: 'agent',
                content: responseText,
                timestamp: new Date(),
                type: 'hint'
            };

            setMessages(prev => [...prev, agentMsg]);

            // Log AI Response
            logService.addLog(currentUser.email, 'CHAT_AI', `AI 回覆: ${responseText.substring(0, 50)}...`);

            // Simulate updating learner model based on interaction
            setStudentState(prev => ({
                ...prev,
                conceptMastery: Math.min(100, prev.conceptMastery + 5),
                engagement: 'active'
            }));

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: "系統連線錯誤，請檢查 API Key 或網路。",
                timestamp: new Date()
            }]);
            logService.addLog(currentUser.email, 'ERROR', 'AI Agent 連線失敗');
        } finally {
            setIsTyping(false);
        }
    };

    // Simulate "Analyze Structure" (replacing Run Code)
    const [analysisOutput, setAnalysisOutput] = useState<string | null>(null);
    
    const handleAnalyze = () => {
        setAnalysisOutput("正在分析文章結構...");
        // Switch to editor tab to see output if on mobile
        setActiveTab('editor');
        
        const currentContent = studentState.code;
        const wordCount = currentContent.length;

        // Log Analysis Action
        logService.addLog(currentUser.email, 'ANALYZE', `觸發結構分析, 字數: ${wordCount}`);
        
        setTimeout(() => {
            // Advanced Analysis Logic
            const keywords = {
                connectors: ["因為", "所以", "因此", "然而", "但是", "雖然", "此外", "總之", "反之"],
                evidence: ["例如", "比如", "根據", "數據", "研究", "例子", "事實上"],
                opinions: ["我認為", "我覺得", "主張", "觀點", "應當", "不應", "相信"]
            };

            const hasConnector = keywords.connectors.some(k => currentContent.includes(k));
            const hasEvidence = keywords.evidence.some(k => currentContent.includes(k));
            const hasOpinion = keywords.opinions.some(k => currentContent.includes(k));

            let result = "";
            let masteryBonus = 0;

            if (wordCount < 50) {
                 result = `[字數不足] 目前僅 ${wordCount} 字。試著運用「因為...所以...」的句型來擴充你的論點，解釋為什麼你會有這樣的想法。`;
            } else if (!hasOpinion) {
                 result = `[觀點不明] 文章似乎在描述現象，但缺少了你的核心主張。請試著加入「我認為...」或「我的主張是...」來明確表達立場。`;
                 masteryBonus = 2;
            } else if (!hasEvidence) {
                 result = `[缺乏證據] 你提出了明確的觀點，這很好！但若能加入「例如...」或「根據...」來提供具體例子，說服力會大幅提升。`;
                 masteryBonus = 5;
            } else if (!hasConnector) {
                 result = `[邏輯連接] 你的句子之間較為獨立。試著使用「然而」、「因此」或「此外」這些連接詞，讓文章讀起來更流暢。`;
                 masteryBonus = 5;
            } else {
                 result = `[表現優異] 結構完整！包含了明確主張、具體證據與邏輯連接。建議你可以挑戰反面論點：思考一下反對你的人會怎麼說？`;
                 masteryBonus = 20;
                 // Set optimal state if structure is good
                 setStudentState(prev => ({ ...prev, cognitiveLoad: 'optimal' }));
            }

            // Update mastery
            setStudentState(prev => ({ 
                ...prev, 
                conceptMastery: Math.min(100, Math.max(prev.conceptMastery, 40 + masteryBonus + (wordCount > 100 ? 10 : 0)))
            }));

            setAnalysisOutput(result);
            logService.addLog(currentUser.email, 'ANALYZE_RESULT', result);

        }, 800);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans fixed inset-0">
            {/* System Header */}
            <header className="bg-white border-b border-slate-200 p-3 flex items-center justify-between shrink-0 h-14 shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-rose-500 p-1.5 rounded-lg shadow-sm">
                            <PenTool size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-sm md:text-base hidden sm:block">Adaptive Writing Coach</h1>
                            <h1 className="font-bold text-slate-800 text-sm sm:hidden">Writing Coach</h1>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Tab Switcher */}
                <div className="flex md:hidden bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('editor')}
                        className={`p-1.5 rounded px-3 text-xs font-medium flex items-center gap-1.5 transition-all ${activeTab === 'editor' ? 'bg-white text-slate-800 shadow ring-1 ring-black/5' : 'text-slate-500'}`}
                    >
                        <FileText size={14} /> 寫作區
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`p-1.5 rounded px-3 text-xs font-medium flex items-center gap-1.5 transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}
                    >
                        <MessageSquare size={14} /> 導師
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-4 px-4">
                    <span className="text-xs text-slate-400 font-medium">Hi, {currentUser.name}</span>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                         <div className={`w-2 h-2 rounded-full ${studentState.engagement === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                         <span className="text-xs text-slate-500 font-medium">AI 教練狀態: 待命中</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-row overflow-hidden relative">
                
                {/* Left Column: Writing Area & Task */}
                <div className={`
                    flex-1 flex flex-col border-r border-slate-200 min-w-0 transition-all duration-300 absolute md:relative inset-0 bg-white z-0
                    ${activeTab === 'editor' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'}
                `}>
                    {/* Task Description */}
                    <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
                        <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <BookOpen size={20} className="text-rose-500" />
                            {task.title}
                        </h2>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{task.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {task.goals.map((goal, idx) => (
                                <span key={idx} className="text-[11px] font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={10} className="text-emerald-500" />
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Writing Editor Area */}
                    <div className="flex-1 relative group">
                        <textarea 
                            id="essay-content"
                            name="essay-content"
                            value={studentState.code}
                            onChange={handleContentChange}
                            placeholder="請在此開始寫作... (例如：我認為 AI 不應該完全取代老師，因為...)"
                            className="w-full h-full bg-white text-slate-800 p-6 resize-none focus:outline-none text-base md:text-lg leading-loose selection:bg-rose-100 placeholder:text-slate-300"
                            spellCheck={false}
                        />
                        <button 
                            onClick={handleAnalyze}
                            className="absolute bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-medium text-sm transition-all active:scale-95 hover:-translate-y-1 z-10"
                        >
                            <Sparkles size={16} className="text-yellow-400" />
                            結構分析
                        </button>
                    </div>

                    {/* Analysis Output Panel */}
                    <div className="h-1/3 max-h-40 bg-slate-50 border-t border-slate-200 p-4 overflow-auto shrink-0 pb-8 md:pb-4">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <BarChart2 size={12} />
                            即時評估報告 (Assessment)
                        </div>
                        {analysisOutput ? (
                            <div className={`text-sm leading-relaxed p-3 rounded-lg border ${analysisOutput.includes("優異") ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-white border-slate-200 text-slate-700"}`}>
                                {analysisOutput}
                            </div>
                        ) : (
                            <span className="text-slate-400 text-sm italic">等待提交分析...</span>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Scaffolding Agent & Analytics */}
                <div className={`
                    w-full md:w-[400px] flex flex-col bg-white shrink-0 border-l border-slate-200 transition-all duration-300 absolute md:relative inset-0 z-10 shadow-2xl md:shadow-none
                    ${activeTab === 'chat' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 md:translate-x-0 md:opacity-100'}
                `}>
                    
                    {/* Analytics Dashboard (Mini) */}
                    <div className="p-4 border-b border-slate-100 bg-white shrink-0">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Brain size={14} />
                            學習狀態儀表板
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                                    <span>寫作完成度</span>
                                    <span>{studentState.conceptMastery}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-rose-400 to-indigo-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${studentState.conceptMastery}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    <div className="text-[10px] text-slate-400 mb-1">認知負荷</div>
                                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <Brain size={12} />
                                        {studentState.cognitiveLoad === 'optimal' ? '適中 (Optimal)' : '高 (High)'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    <div className="text-[10px] text-slate-400 mb-1">參與狀態</div>
                                    <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        {studentState.engagement === 'active' ? '積極思考中' : '觀察中'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 overscroll-contain">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div 
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200' 
                                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-slate-100'}`}
                                    >
                                        {msg.role === 'agent' && (
                                            <div className="text-[10px] font-bold text-rose-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                                                <div className="bg-rose-100 p-0.5 rounded">
                                                    <RefreshCw size={10} className="animate-spin-slow text-rose-600" />
                                                </div>
                                                AI 寫作教練
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200 shadow-sm flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-200 shrink-0 pb-6 md:pb-3">
                            <div className="relative">
                                <input
                                    id="chat-input"
                                    name="chat-input"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="對論點有疑問嗎？詢問教練..."
                                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningSystem;
