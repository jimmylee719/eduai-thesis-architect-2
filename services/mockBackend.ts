import { User, SystemLog, Role } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
  USERS: 'eduai_users',
  LOGS: 'eduai_logs',
  SESSION: 'eduai_session'
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  { email: 'user@mail.com', name: '一般學生', role: 'user' },
  { email: 'boss@mail.com', name: '系統管理員', role: 'admin' }
];

const DEFAULT_CREDENTIALS: Record<string, string> = {
  'user@mail.com': '1234',
  'boss@mail.com': '1234'
};

// Helper to get data
const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
};

const getStoredLogs = (): SystemLog[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
  // Convert string timestamps back to Date objects
  const logs = stored ? JSON.parse(stored) : [];
  return logs.map((log: any) => ({ ...log, timestamp: new Date(log.timestamp) }));
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

const saveLogs = (logs: SystemLog[]) => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

// Service Functions

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Sim delay

    // 1. Check predefined credentials first (simple logic for demo)
    let isValid = false;
    if (DEFAULT_CREDENTIALS[email] === password) isValid = true;
    
    // 2. Check stored users (In a real app, pass hash would be stored in User obj)
    // For this mock, we assume any registered user has password "1234" or matches default
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (user && (isValid || password.length >= 4)) { // Loose password check for demo
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      logService.addLog(user.email, 'LOGIN', '使用者登入成功');
      return user;
    }
    return null;
  },

  register: async (email: string, password: string, name: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("此 Email 已被註冊");
    }

    const newUser: User = { email, name, role: 'user' };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    // Auto login after register
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
    
    logService.addLog(newUser.email, 'REGISTER', '新使用者註冊');
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  }
};

export const logService = {
  addLog: (userEmail: string, action: string, details: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      userEmail,
      action,
      details
    };
    
    const currentLogs = getStoredLogs();
    // Keep only last 100 logs to prevent localStorage overflow
    const updatedLogs = [newLog, ...currentLogs].slice(0, 100);
    saveLogs(updatedLogs);
    
    // Console log for dev
    console.log(`[System Log] ${action}: ${details}`);
  },

  getLogs: async (): Promise<SystemLog[]> => {
    return getStoredLogs();
  },

  getAllUsers: async (): Promise<User[]> => {
    return getStoredUsers();
  },
  
  clearLogs: async () => {
    saveLogs([]);
  }
};