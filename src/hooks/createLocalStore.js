import { useCallback, useEffect, useState } from 'react';

/* ==========================================================
   createLocalStore — one generic localStorage-backed store.

   Every admin-editable collection (categories, orders, coupons,
   reviews, …) needs the exact same behaviour:
     • read with a safe fallback to the built-in defaults
     • write + broadcast a CustomEvent so every consumer re-renders
     • stay in sync across browser tabs via the `storage` event
     • reset back to the defaults

   Rather than copy that five times, each collection is built from
   this factory. The returned `useStore` hook is created at module
   scope, so it is a stable hook identity.
   ========================================================== */

export const createLocalStore = ({ key, event, defaults, sanitize }) => {
  const clean = (value) => (sanitize ? sanitize(value) : value);

  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaults;
      return clean(JSON.parse(raw));
    } catch {
      return defaults;
    }
  };

  const has = () => {
    try {
      return Boolean(localStorage.getItem(key));
    } catch {
      return false;
    }
  };

  /** Returns true when the write actually landed (quota can be full). */
  const write = (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(event, { detail: value }));
      return true;
    } catch (err) {
      console.warn(`${key} could not be saved`, err);
      return false;
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent(event, { detail: defaults }));
    } catch (err) {
      console.warn(`${key} could not be reset`, err);
    }
  };

  const useStore = () => {
    const [state, setState] = useState(() => ({ value: read(), custom: has() }));

    useEffect(() => {
      const sync = (e) =>
        setState({ value: e.detail === undefined ? read() : e.detail, custom: has() });
      const onStorage = (e) => {
        if (e.key === key) setState({ value: read(), custom: has() });
      };
      window.addEventListener(event, sync);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(event, sync);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

    const save = useCallback((next) => {
      const ok = write(next);
      if (ok) setState({ value: next, custom: true });
      return ok;
    }, []);

    const reset = useCallback(() => {
      clear();
      setState({ value: defaults, custom: false });
    }, []);

    return { value: state.value, isCustom: state.custom, save, reset, defaults };
  };

  return { KEY: key, EVENT: event, DEFAULTS: defaults, read, write, clear, has, useStore };
};
