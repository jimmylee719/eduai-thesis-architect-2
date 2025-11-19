import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SelectionItem, ThesisProposal, ChatMessage } from '../types';

const SYSTEM_INSTRUCTION = `
你是一位頂尖的資訊工程與教育科技領域的教授。
你的任務是協助碩士生構思論文題目與系統架構。
請根據學生選擇的技術、理論、對象與平台，產生一份具備學術價值的論文提案。
必須嚴格遵守 JSON 格式輸出。
所有的內容必須是「繁體中文」(Traditional Chinese)，除了專有名詞或英文標題。
系統架構部分，請仔細思考如何將 AI 技術與教育理論結合在軟體工程中。
`;

// 1. Define deepest level first: Components
const componentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING }
  },
  required: ["name", "type"]
};

// 2. Define middle level: Modules (containing components)
const moduleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING },
    children: {
      type: Type.ARRAY,
      items: componentSchema
    }
  },
  required: ["name", "type", "children"]
};

// 3. Define top level: Architecture Tree (containing modules)
const architectureTreeSchema: Schema = {
  type: Type.OBJECT,
  description: "System Architecture Tree. Root -> Modules -> Components",
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING },
    children: {
      type: Type.ARRAY,
      items: moduleSchema
    }
  },
  required: ["name", "type", "children"]
};

// 4. Define full Thesis Proposal Schema
const thesisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "論文中文題目" },
    englishTitle: { type: Type.STRING, description: "論文英文題目" },
    abstract: { type: Type.STRING, description: "約 150-200 字的摘要，使用繁體中文" },
    researchQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3個主要研究問題"
    },
    methodology: { type: Type.STRING, description: "研究方法描述 (例如：準實驗設計)" },
    architectureDescription: { type: Type.STRING, description: "系統架構的文字詳細描述" },
    techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "建議使用的具體技術棧" },
    expectedContribution: { type: Type.STRING, description: "預期貢獻" },
    architectureTree: architectureTreeSchema
  },
  required: ["title", "englishTitle", "abstract", "researchQuestions", "methodology", "architectureDescription", "techStack", "expectedContribution", "architectureTree"]
};

const getAIClient = () => {
    // 嘗試從不同的來源獲取 API Key 以相容 Vercel/Vite 環境
    let apiKey = "";
    
    // 1. 嘗試 process.env (Node.js 或 Webpack DefinePlugin)
    try {
        if (typeof process !== 'undefined' && process.env?.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {}

    // 2. 嘗試 import.meta.env (Vite 標準)，Vercel 通常需要 VITE_ 前綴
    if (!apiKey) {
        try {
            const meta = import.meta as any;
            if (meta.env) {
                apiKey = meta.env.VITE_API_KEY || meta.env.API_KEY || "";
            }
        } catch (e) {}
    }

    if (!apiKey) {
        console.error("API Key 未設定。請檢查 Vercel 環境變數設定。");
        throw new Error("系統環境變數錯誤：找不到 API Key。請在 Vercel 專案設定中加入環境變數 'VITE_API_KEY' (值為您的 Gemini API Key)。");
    }
    
    return new GoogleGenAI({ apiKey });
}

export const generateThesisProposal = async (
  tech: SelectionItem[],
  theory: SelectionItem[],
  target: SelectionItem[],
  platform: SelectionItem[]
): Promise<ThesisProposal> => {
  
  try {
    const ai = getAIClient();

    const prompt = `
        請根據以下組合產生一個碩士論文提案：
        
        1. 核心 AI 技術: ${tech.map(t => t.label).join(', ')}
        2. 教育理論/策略: ${theory.map(t => t.label).join(', ')}
        3. 目標對象: ${target.map(t => t.label).join(', ')}
        4. 實作平台: ${platform.map(t => t.label).join(', ')}

        請發揮創意，結合最新的全球研究趨勢。
        重點：確保輸出為繁體中文。
        "architectureTree" 欄位必須是一個 3 層的巢狀結構：
        1. 根節點 (System Name)
        2. 第二層 (Subsystems/Modules, e.g., Frontend, Backend, AI Engine)
        3. 第三層 (Components, e.g., React UI, Vector DB, Scaffolding Agent)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: thesisSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    return JSON.parse(text) as ThesisProposal;
  } catch (error: any) {
    console.error("Error generating thesis proposal:", error);
    if (error.message && (error.message.includes("API_KEY") || error.message.includes("API Key"))) {
        throw error; 
    }
    throw new Error("生成過程中發生錯誤，請檢查額度或稍後再試。");
  }
};

export const generateScaffoldingResponse = async (
    userContent: string,
    userQuestion: string,
    chatHistory: ChatMessage[]
): Promise<string> => {
    try {
        const ai = getAIClient();

        const SCAFFOLDING_INSTRUCTION = `
        你是一個基於「鷹架理論 (Scaffolding Theory)」的寫作與邏輯教練。
        你的目標對象是大眾學習者或大學生。
        
        當前任務：撰寫一篇短文討論「AI 是否應該完全取代人類教師？」。
        
        核心原則：
        1. **絕對不要直接幫學生寫文章**。
        2. 你的角色是引導思考 (Critical Thinking Guide)。
        3. 根據學生的文章內容，檢查是否有「主張 (Claim)」、「證據 (Evidence)」與「推論 (Reasoning)」。
        4. 鷹架策略：
        - 如果內容太簡短，引導他們舉例。
        - 如果邏輯不通，用反問句引導他們思考漏洞。
        - 如果觀點單一，鼓勵他們思考反面論點 (Counter-argument)。
        5. 語氣要鼓勵、客觀、具啟發性。
        6. 請用繁體中文回答。
        `;

        const prompt = `
        [學生目前的文章草稿]:
        ${userContent || "(目前是空白的)"}

        [學生提出的問題/對話]:
        ${userQuestion}

        [對話歷史]:
        ${chatHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SCAFFOLDING_INSTRUCTION,
                temperature: 0.6,
            }
        });
        return response.text || "抱歉，我目前無法分析您的內容，請稍後再試。";
    } catch (error: any) {
        console.error("Scaffolding agent error:", error);
        // Explicitly throw API key errors to show correct feedback
        if (error.message && (error.message.includes("API_KEY") || error.message.includes("API Key"))) {
             // We return a user-friendly string that indicates config error
             return "系統錯誤：API Key 未設定或無效 (VITE_API_KEY)。請聯絡管理員。";
        }
        return "連線發生錯誤，請檢查網路狀態。";
    }
}
