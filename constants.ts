import { SelectionItem } from './types';

export const AI_TECHS: SelectionItem[] = [
  { id: 'llm', label: '大型語言模型 (LLM/RAG)', category: 'tech' },
  { id: 'cv', label: '電腦視覺 (CV)', category: 'tech' },
  { id: 'nlp', label: '自然語言處理 (NLP)', category: 'tech' },
  { id: 'speech', label: '語音識別與合成', category: 'tech' },
  { id: 'recsys', label: '個人化推薦系統', category: 'tech' },
  { id: 'kg', label: '知識圖譜 (Knowledge Graph)', category: 'tech' },
  { id: 'affective', label: '情感運算 (Affective Computing)', category: 'tech' },
  { id: 'agent', label: '智慧代理人 (AI Agents)', category: 'tech' },
];

export const EDU_THEORIES: SelectionItem[] = [
  { id: 'scaffolding', label: '鷹架理論 (Scaffolding)', category: 'theory' },
  { id: 'srl', label: '自我調節學習 (SRL)', category: 'theory' },
  { id: 'flipped', label: '翻轉教室 (Flipped Classroom)', category: 'theory' },
  { id: 'gamification', label: '遊戲化學習 (Gamification)', category: 'theory' },
  { id: 'ct', label: '運算思維 (Computational Thinking)', category: 'theory' },
  { id: 'ccl', label: '電腦輔助協作學習 (CSCL)', category: 'theory' },
  { id: 'bloom', label: '布魯姆分類法 (Bloom\'s Taxonomy)', category: 'theory' },
];

export const TARGET_AUDIENCES: SelectionItem[] = [
  { id: 'k12', label: 'K-12 基礎教育', category: 'target' },
  { id: 'university', label: '大專院校學生', category: 'target' },
  { id: 'coding', label: '程式設計初學者', category: 'target' },
  { id: 'language', label: '語言學習者', category: 'target' },
  { id: 'special', label: '特殊教育需求', category: 'target' },
  { id: 'vocational', label: '職業培訓/在職進修', category: 'target' },
  { id: 'elderly', label: '高齡學習者', category: 'target' },
];

export const PLATFORMS: SelectionItem[] = [
  { id: 'web', label: 'Web 網頁應用', category: 'platform' },
  { id: 'mobile', label: 'Mobile App', category: 'platform' },
  { id: 'chatbot', label: '對話機器人 (Line/Discord)', category: 'platform' },
  { id: 'vr_ar', label: 'VR/AR 虛擬實境', category: 'platform' },
  { id: 'iot', label: 'IoT 物聯網裝置', category: 'platform' },
  { id: 'plugin', label: '瀏覽器/IDE 擴充套件', category: 'platform' },
];
