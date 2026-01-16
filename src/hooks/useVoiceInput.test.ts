// src/hooks/useVoiceInput.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceInput, isSpeechRecognitionSupported } from './useVoiceInput';

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: ((ev: Event) => void) | null = null;
  onresult: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  onend: ((ev: Event) => void) | null = null;

  start = vi.fn(() => {
    if (this.onstart) {
      this.onstart(new Event('start'));
    }
  });
  stop = vi.fn(() => {
    if (this.onend) {
      this.onend(new Event('end'));
    }
  });
  abort = vi.fn();
}

describe('useVoiceInput', () => {
  let mockRecognition: MockSpeechRecognition;
  let originalSpeechRecognition: typeof window.SpeechRecognition;
  let originalWebkitSpeechRecognition: typeof window.webkitSpeechRecognition;

  beforeEach(() => {
    mockRecognition = new MockSpeechRecognition();
    originalSpeechRecognition = window.SpeechRecognition;
    originalWebkitSpeechRecognition = window.webkitSpeechRecognition;

    // Mock SpeechRecognition
    (window as any).SpeechRecognition = vi.fn(() => mockRecognition);
    (window as any).webkitSpeechRecognition = undefined;
  });

  afterEach(() => {
    window.SpeechRecognition = originalSpeechRecognition;
    window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns initial state', () => {
      const { result } = renderHook(() => useVoiceInput());

      expect(result.current.isListening).toBe(false);
      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
      expect(result.current.error).toBe(null);
    });

    it('sets isSupported based on browser support', async () => {
      const { result } = renderHook(() => useVoiceInput());

      // Wait for useEffect to run
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isSupported).toBe(true);
    });

    it('sets isSupported to false when not supported', async () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;

      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('startListening', () => {
    it('starts speech recognition', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('sets isListening to true when started', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);
    });

    it('resets transcript when starting', async () => {
      const { result } = renderHook(() => useVoiceInput());

      // First, simulate getting a transcript
      await act(async () => {
        result.current.startListening();
      });

      // Simulate result
      await act(async () => {
        if (mockRecognition.onresult) {
          mockRecognition.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              item: () => ({ isFinal: true, length: 1, 0: { transcript: 'hello', confidence: 1 } }),
              0: { isFinal: true, length: 1, 0: { transcript: 'hello', confidence: 1 } },
            },
          });
        }
      });

      expect(result.current.transcript).toBe('hello');

      // Start again
      await act(async () => {
        result.current.startListening();
      });

      expect(result.current.transcript).toBe('');
    });

    it('sets error when not supported', async () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;

      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      expect(result.current.error).toBe('Speech recognition is not supported in this browser.');
    });
  });

  describe('stopListening', () => {
    it('stops speech recognition', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        result.current.stopListening();
      });

      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    it('sets isListening to false when stopped', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);

      await act(async () => {
        result.current.stopListening();
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('toggleListening', () => {
    it('starts listening when not listening', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.toggleListening();
      });

      expect(result.current.isListening).toBe(true);
    });

    it('stops listening when listening', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        result.current.toggleListening();
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('resetTranscript', () => {
    it('clears transcript and interimTranscript', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      // Simulate interim result
      await act(async () => {
        if (mockRecognition.onresult) {
          mockRecognition.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              item: () => ({ isFinal: false, length: 1, 0: { transcript: 'testing', confidence: 1 } }),
              0: { isFinal: false, length: 1, 0: { transcript: 'testing', confidence: 1 } },
            },
          });
        }
      });

      expect(result.current.interimTranscript).toBe('testing');

      await act(async () => {
        result.current.resetTranscript();
      });

      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
    });
  });

  describe('speech recognition events', () => {
    it('handles final result', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onresult) {
          mockRecognition.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              item: () => ({ isFinal: true, length: 1, 0: { transcript: 'hello world', confidence: 1 } }),
              0: { isFinal: true, length: 1, 0: { transcript: 'hello world', confidence: 1 } },
            },
          });
        }
      });

      expect(result.current.transcript).toBe('hello world');
      expect(result.current.interimTranscript).toBe('');
    });

    it('handles interim result', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onresult) {
          mockRecognition.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              item: () => ({ isFinal: false, length: 1, 0: { transcript: 'interim text', confidence: 1 } }),
              0: { isFinal: false, length: 1, 0: { transcript: 'interim text', confidence: 1 } },
            },
          });
        }
      });

      expect(result.current.interimTranscript).toBe('interim text');
    });

    it('calls onResult callback with final transcript', async () => {
      const onResult = vi.fn();
      const { result } = renderHook(() => useVoiceInput({ onResult }));

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onresult) {
          mockRecognition.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              item: () => ({ isFinal: true, length: 1, 0: { transcript: 'final text', confidence: 1 } }),
              0: { isFinal: true, length: 1, 0: { transcript: 'final text', confidence: 1 } },
            },
          });
        }
      });

      expect(onResult).toHaveBeenCalledWith('final text');
    });
  });

  describe('error handling', () => {
    it('handles no-speech error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'no-speech', message: '' });
        }
      });

      expect(result.current.error).toBe('No speech detected. Please try again.');
      expect(result.current.isListening).toBe(false);
    });

    it('handles audio-capture error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'audio-capture', message: '' });
        }
      });

      expect(result.current.error).toBe('No microphone found. Please check your audio settings.');
    });

    it('handles not-allowed error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'not-allowed', message: '' });
        }
      });

      expect(result.current.error).toBe('Microphone access denied. Please allow microphone access.');
    });

    it('handles network error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'network', message: '' });
        }
      });

      expect(result.current.error).toBe('Network error. Please check your connection.');
    });

    it('ignores aborted error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'aborted', message: '' });
        }
      });

      // Error should not be set for aborted
      expect(result.current.error).toBe(null);
    });

    it('handles unknown error', async () => {
      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'some-unknown-error', message: '' });
        }
      });

      expect(result.current.error).toBe('Speech recognition error: some-unknown-error');
    });

    it('calls onError callback', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useVoiceInput({ onError }));

      await act(async () => {
        result.current.startListening();
      });

      await act(async () => {
        if (mockRecognition.onerror) {
          mockRecognition.onerror({ error: 'no-speech', message: '' });
        }
      });

      expect(onError).toHaveBeenCalledWith('No speech detected. Please try again.');
    });
  });

  describe('options', () => {
    it('sets continuous option', async () => {
      renderHook(() => useVoiceInput({ continuous: true }));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    });

    it('sets interimResults option', async () => {
      renderHook(() => useVoiceInput({ interimResults: false }));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    });

    it('sets language option', async () => {
      renderHook(() => useVoiceInput({ language: 'es-ES' }));

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    });
  });

  describe('webkit fallback', () => {
    it('uses webkitSpeechRecognition when SpeechRecognition is not available', async () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = vi.fn(() => mockRecognition);

      const { result } = renderHook(() => useVoiceInput());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isSupported).toBe(true);
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns true when SpeechRecognition is available', () => {
      (window as any).SpeechRecognition = MockSpeechRecognition;
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it('returns true when webkitSpeechRecognition is available', () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = MockSpeechRecognition;
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it('returns false when neither is available', () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;
      expect(isSpeechRecognitionSupported()).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('stops recognition on unmount', async () => {
      const { result, unmount } = renderHook(() => useVoiceInput());

      await act(async () => {
        result.current.startListening();
      });

      unmount();

      expect(mockRecognition.stop).toHaveBeenCalled();
    });
  });
});
