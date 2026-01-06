// src/stores/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  isOpen: boolean;
  sessionId: string | null;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setSessionId: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      sessionId: null,
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);
