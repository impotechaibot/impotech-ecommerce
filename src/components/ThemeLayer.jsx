import { useEffect } from 'react';
import { useSiteConfig, hexToRgb, darken } from '../hooks/useSiteConfig.js';

/** Applies shared theme, typography, radius, and global background from Supabase. */
const ThemeLayer = () => {
  const { config: site } = useSiteConfig();
  const theme = site.theme || {};
  const background = site.background || {};

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const accent = theme.accent || '#f0b429';
    if (site.favicon) {
      let favicon = document.querySelector('link[rel=\"icon\"]');
      if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
      favicon.href = site.favicon;
    }
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-dark', theme.accentDark || darken(accent, 0.2));
    root.style.setProperty('--accent-soft', `rgba(${hexToRgb(accent)}, 0.14)`);
    root.style.setProperty('--radius', `${theme.radius ?? 18}px`);
    root.style.setProperty('--radius-sm', `${Math.max(6, Math.round((theme.radius ?? 18) * 0.66))}px`);
    root.style.fontSize = `${((Number(theme.fontScale) || 100) / 100) * 16}px`;

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

    if (background.type === 'image' && background.image) {
      const alpha = Math.min(1, Math.max(0, Number(background.overlay || 0) / 100));
      body.style.backgroundColor = background.color || 'var(--bg)';
      body.style.backgroundImage = `linear-gradient(rgba(0,0,0,${alpha}),rgba(0,0,0,${alpha})),url("${background.image.replace(/"/g, '\\"')}")`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.backgroundImage = 'none';
      body.style.backgroundColor = background.color || 'var(--bg)';
      body.style.backgroundSize = '';
      body.style.backgroundPosition = '';
      body.style.backgroundAttachment = '';
    }
  }, [theme.accent, theme.accentDark, theme.radius, theme.fontScale, theme.mode, background.type, background.color, background.image, background.overlay, site.favicon]);

  return null;
};

export default ThemeLayer;
