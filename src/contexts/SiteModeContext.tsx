'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'shop' | 'impact';

const SiteModeContext = createContext<{ mode: Mode; toggle: () => void; setMode: (m: Mode) => void }>({
  mode: 'shop',
  toggle: () => {},
  setMode: () => {},
});

export function SiteModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('shop');

  useEffect(() => {
    const saved = localStorage.getItem('site-mode') as Mode | null;
    if (saved === 'shop' || saved === 'impact') setModeState(saved);
  }, []);

  const toggle = () => {
    const next: Mode = mode === 'shop' ? 'impact' : 'shop';
    setModeState(next);
    localStorage.setItem('site-mode', next);
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem('site-mode', m);
  };

  return (
    <SiteModeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </SiteModeContext.Provider>
  );
}

export const useSiteMode = () => useContext(SiteModeContext);
