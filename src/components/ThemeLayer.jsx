import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig, hexToRgb, darken } from '../hooks/useSiteConfig.js';

/* ==========================================================
   ThemeLayer — applies the admin-chosen theme (accent colour,
   font scale, corner radius, dark/light mode) as CSS variables
   on :root. The background feature (useBackground) is untouched;
   this only overrides the accent + a few sizing tokens.
   ========================================================== */

const ThemeLayer = () => {
  const { config: site } = useSiteConfig();
  const theme = site.theme || {};

  useEffect(() => {
    const root = document.documentElement;
    const accent = theme.accent || '#f0b429';

    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-dark', theme.accentDark || darken(accent, 0.2));
    root.style.setProperty('--accent-soft', `rgba(${hexToRgb(accent)}, 0.14)`);
    root.style.setProperty('--radius', `${theme.radius ?? 18}px`);
    root.style.setProperty(
      '--radius-sm',
      `${Math.max(6, Math.round((theme.radius ?? 18) * 0.66))}px`
    );

    // Font scale — 100 = default. Applied to the root font size.
    const scale = Number(theme.fontScale) || 100;
    root.style.fontSize = `${(scale / 100) * 16}px`;

    // Dark / light mode — light mode flips the surface + text tokens.
    if (theme.mode === 'light') {
      root.style.setProperty('--bg', '#f4f4f6');
      root.style.setProperty('--surface', 'rgba(255, 255, 255, 0.92)');
      root.style.setProperty('--surface-solid', '#ffffff');
      root.style.setProperty('--surface-2', '#f0f0f3');
      root.style.setProperty('--line', 'rgba(0, 0, 0, 0.09)');
      root.style.setProperty('--line-strong', 'rgba(0, 0, 0, 0.16)');
      root.style.setProperty('--text', '#141418');
      root.style.setProperty('--muted', '#5a5a64');
      root.style.setProperty('--muted-2', '#8a8a94');
    } else {
      root.style.setProperty('--bg', '#08080a');
      root.style.setProperty('--surface', 'rgba(20, 20, 24, 0.88)');
      root.style.setProperty('--surface-solid', '#141418');
      root.style.setProperty('--surface-2', '#1b1b20');
      root.style.setProperty('--line', 'rgba(255, 255, 255, 0.09)');
      root.style.setProperty('--line-strong', 'rgba(255, 255, 255, 0.16)');
      root.style.setProperty('--text', '#f5f5f7');
      root.style.setProperty('--muted', '#9a9aa4');
      root.style.setProperty('--muted-2', '#6e6e78');
    }
  }, [theme.accent, theme.accentDark, theme.radius, theme.fontScale, theme.mode]);

  return null;
};

export default ThemeLayer;
