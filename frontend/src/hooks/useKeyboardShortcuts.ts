'use client';

import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onToggleLockdown?: () => void;
  onToggleAcousticShield?: () => void;
  onClearAlarm?: () => void;
  onInjectThreat?: () => void;
  onVerifyCourier?: () => void;
  onIntercomPress?: () => void;
  onIntercomRelease?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handlers.onIntercomPress?.();
      } else if (e.key === 'l' || e.key === 'L') {
        handlers.onToggleLockdown?.();
      } else if (e.key === 's' || e.key === 'S') {
        handlers.onToggleAcousticShield?.();
      } else if (e.key === 'c' || e.key === 'C') {
        handlers.onClearAlarm?.();
      } else if (e.key === 't' || e.key === 'T') {
        handlers.onInjectThreat?.();
      } else if (e.key === 'v' || e.key === 'V') {
        handlers.onVerifyCourier?.();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onIntercomRelease?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlers]);
}
