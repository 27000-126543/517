import { create } from 'zustand';
import type { User } from '../types';
import { users, currentUser } from '../mock/data';

interface UserStore {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: currentUser,
  users: users,
  setCurrentUser: (user) => set({ currentUser: user }),
  login: async (username, password) => {
    const user = users.find(u => u.username === username);
    if (user && password === '123456') {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ currentUser: currentUser });
  },
  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `user${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ users: [...state.users, newUser] }));
  },
  updateUser: (id, userData) => {
    set((state) => ({
      users: state.users.map(u => u.id === id ? { ...u, ...userData } : u),
    }));
  },
  deleteUser: (id) => {
    set((state) => ({ users: state.users.filter(u => u.id !== id) }));
  },
}));
