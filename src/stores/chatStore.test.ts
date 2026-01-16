// src/stores/chatStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useChatStore } from './chatStore';

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useChatStore.setState({
        isOpen: false,
        sessionId: null,
      });
    });
  });

  describe('initial state', () => {
    it('has isOpen set to false by default', () => {
      const state = useChatStore.getState();
      expect(state.isOpen).toBe(false);
    });

    it('has sessionId set to null by default', () => {
      const state = useChatStore.getState();
      expect(state.sessionId).toBeNull();
    });
  });

  describe('toggleChat', () => {
    it('toggles isOpen from false to true', () => {
      act(() => {
        useChatStore.getState().toggleChat();
      });

      expect(useChatStore.getState().isOpen).toBe(true);
    });

    it('toggles isOpen from true to false', () => {
      act(() => {
        useChatStore.setState({ isOpen: true });
        useChatStore.getState().toggleChat();
      });

      expect(useChatStore.getState().isOpen).toBe(false);
    });

    it('can toggle multiple times', () => {
      const { toggleChat } = useChatStore.getState();

      act(() => {
        toggleChat();
      });
      expect(useChatStore.getState().isOpen).toBe(true);

      act(() => {
        toggleChat();
      });
      expect(useChatStore.getState().isOpen).toBe(false);

      act(() => {
        toggleChat();
      });
      expect(useChatStore.getState().isOpen).toBe(true);
    });
  });

  describe('openChat', () => {
    it('sets isOpen to true', () => {
      act(() => {
        useChatStore.getState().openChat();
      });

      expect(useChatStore.getState().isOpen).toBe(true);
    });

    it('keeps isOpen true when already open', () => {
      act(() => {
        useChatStore.setState({ isOpen: true });
        useChatStore.getState().openChat();
      });

      expect(useChatStore.getState().isOpen).toBe(true);
    });
  });

  describe('closeChat', () => {
    it('sets isOpen to false', () => {
      act(() => {
        useChatStore.setState({ isOpen: true });
        useChatStore.getState().closeChat();
      });

      expect(useChatStore.getState().isOpen).toBe(false);
    });

    it('keeps isOpen false when already closed', () => {
      act(() => {
        useChatStore.getState().closeChat();
      });

      expect(useChatStore.getState().isOpen).toBe(false);
    });
  });

  describe('setSessionId', () => {
    it('sets sessionId to provided value', () => {
      act(() => {
        useChatStore.getState().setSessionId('session-123');
      });

      expect(useChatStore.getState().sessionId).toBe('session-123');
    });

    it('updates existing sessionId', () => {
      act(() => {
        useChatStore.setState({ sessionId: 'old-session' });
        useChatStore.getState().setSessionId('new-session');
      });

      expect(useChatStore.getState().sessionId).toBe('new-session');
    });

    it('can set sessionId to different values', () => {
      const { setSessionId } = useChatStore.getState();

      act(() => {
        setSessionId('session-1');
      });
      expect(useChatStore.getState().sessionId).toBe('session-1');

      act(() => {
        setSessionId('session-2');
      });
      expect(useChatStore.getState().sessionId).toBe('session-2');
    });
  });

  describe('state independence', () => {
    it('does not affect sessionId when toggling chat', () => {
      act(() => {
        useChatStore.setState({ sessionId: 'my-session' });
        useChatStore.getState().toggleChat();
      });

      expect(useChatStore.getState().sessionId).toBe('my-session');
    });

    it('does not affect isOpen when setting sessionId', () => {
      act(() => {
        useChatStore.setState({ isOpen: true });
        useChatStore.getState().setSessionId('test-session');
      });

      expect(useChatStore.getState().isOpen).toBe(true);
    });
  });

  describe('store exports', () => {
    it('exports useChatStore hook', () => {
      expect(useChatStore).toBeDefined();
      expect(typeof useChatStore).toBe('function');
    });

    it('provides getState method', () => {
      expect(typeof useChatStore.getState).toBe('function');
    });

    it('provides setState method', () => {
      expect(typeof useChatStore.setState).toBe('function');
    });

    it('provides subscribe method', () => {
      expect(typeof useChatStore.subscribe).toBe('function');
    });
  });
});
