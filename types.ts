export interface SelectionItem {
  id: string;
  label: string;
  category: 'tech' | 'theory' | 'target' | 'platform';
}

export interface ArchitectureNode {
  name: string;
  children?: ArchitectureNode[];
  type?: 'system' | 'module' | 'component' | 'database';
}

export interface ThesisProposal {
  title: string;
  englishTitle: string;
  abstract: string;
  researchQuestions: string[];
  methodology: string;
  architectureDescription: string;
  architectureTree: ArchitectureNode;
  techStack: string[];
  expectedContribution: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: ThesisProposal | null;
}

// Prototype System Types
export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  type?: 'hint' | 'explanation' | 'encouragement'; 
}

export interface StudentState {
  code: string;
  conceptMastery: number; // 0-100
  cognitiveLoad: 'low' | 'optimal' | 'high';
  engagement: 'active' | 'passive';
}

// --- New Auth & Admin Types ---

export type Role = 'user' | 'admin';

export interface User {
  email: string;
  name: string;
  role: Role;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  userEmail: string;
  action: string; // e.g., "LOGIN", "GENERATE_THESIS", "CHAT_MESSAGE"
  details: string; // JSON string or plain text details
}