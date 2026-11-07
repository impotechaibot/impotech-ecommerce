import { useEffect, useState, useCallback } from 'react';

// Background customisation lives in localStorage so the admin panel can change the
// site background (colour or uploaded image) and every page picks it up instantly.
export const BG_KEY = 'impotech_bg';
export const BG_EVENT = 'impotech-bg-change';

export const COLOR_PRESETS = [
  { id: 'charcoal', label: 'চারকোল (ডিফল্ট)', value: '#08080a' },
  { id: 'midnight', label: 'মিডনাইট ব্লু', value: '#0a1226' },
  { id: 'forest', label: 'ফরেস্ট গ্রিন', value: '#07130f' },
  { id: 'plum', label: 'ডিপ প্লাম', value: '#150a1c' },
  { id: 'wine', label: 'ওয়াইন রেড', value: '#1a0808' },
  { id: 'sand', label: 'স্যান্ডブラウン', value: '#16110a' },
  { id: 'graphite', label: 'গ্রাফাইট', value: '#17181c' },
  { id: 'navy', label: 'নেভি নাইট', value: '#050a1a' },
];

export const DEFAULT_BG = {
  type: 'color',
  color: '#08080a',
  image: '',
  overlay: 45,
  blur: 0,
};

export const readBgConfig = () => {
  try {
    const raw = localStorage.getItem(BG_KEY);
    if (!raw) return DEFAULT_BG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BG, ...parsed };
  } catch {
    return DEFAULT_BG;
  }
};

export const writeBgConfig = (cfg) => {
  try {
    localStorage.setItem(BG_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent(BG_EVENT, { detail: cfg }));
  } catch (err) {
    console.warn('Background could not be saved', err);
  }
};

export const clearBgConfig = () => {
  try {
    localStorage.removeItem(BG_KEY);
    window.dispatchEvent(new CustomEvent(BG_EVENT, { detail: DEFAULT_BG }));
  } catch (err) {
    console.warn('Background could not be reset', err);
  }
};

// Shared hook — keeps one source of truth in sync across tabs and components.
export const useBackground = () => {
  const [config, setConfig] = useState(readBgConfig);

  useEffect(() => {
    const onChange = (e) => {
      setConfig(e.detail || readBgConfig());
    };
    const onStorage = (e) => {
      if (e.key === BG_KEY) setConfig(readBgConfig());
    };
    window.addEventListener(BG_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(BG_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const save = useCallback((cfg) => {
    writeBgConfig(cfg);
    setConfig(cfg);
  }, []);

  const reset = useCallback(() => {
    clearBgConfig();
    setConfig(DEFAULT_BG);
  }, []);

  return { config, save, reset };
};
