import { useCallback, useEffect, useState } from 'react';

/* ==========================================================
   createLocalStore — one generic store (localStorage + Supabase)

   Every admin-editable collection (categories, orders, coupons,
   reviews, …) needs the exact same behaviour:
     • read with a safe fallback to the built-in defaults
     • write + broadcast a CustomEvent so every consumer re-renders
     • stay in sync across browser tabs via the `storage` event
     • reset back to the defaults
     • **নতুন:** Supabase থাকলে সেখান থেকেও পড়া ও সেখানে লেখা

   ⚠️ আগের বাগ: এই স্টোরগুলো শুধু localStorage-এ থাকত, তাই
   অ্যাডমিনে কুপন/রিভিউ যোগ করলে লাইভ সাইটে কখনো যেত না।
   এখন `remote` দেওয়া থাকলে মাউন্টে রিমোট থেকে পড়ে এবং প্রতিটা
   সেভে রিমোটে push করে।
   ========================================================== */

export const createLocalStore = ({ key, event, defaults, sanitize, remote }) => {
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

  /** রিমোটে পাঠানো (ব্যাকগ্রাউন্ডে, UI ব্লক হয় না)। */
  const pushRemote = (value) => {
    if (!remote?.save) return;
    Promise.resolve(remote.save(value)).then((res) => {
      if (res && res.ok === false) {
        console.warn(`[${key}] রিমোট সেভ ব্যর্থ:`, res.error);
      }
    });
  };

  const useStore = () => {
    const [state, setState] = useState(() => ({ value: read(), custom: has() }));
    const [remoteError, setRemoteError] = useState(null);

    /* মাউন্টে রিমোট থেকে পড়া — লোকাল ক্যাশের চেয়ে রিমোটই সত্য */
    useEffect(() => {
      if (!remote?.fetch) return undefined;
      let alive = true;
      (async () => {
        const res = await remote.fetch();
        if (!alive || !res) return;
        if (res.ok && Array.isArray(res.data)) {
          const next = clean(res.data);
          write(next);
          setState({ value: next, custom: next.length > 0 });
          setRemoteError(null);
        } else if (res.error) {
          setRemoteError(res.error);
        }
      })();
      return () => {
        alive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
      if (ok) {
        setState({ value: next, custom: true });
        pushRemote(next);
      }
      return ok;
    }, []);

    const reset = useCallback(() => {
      clear();
      setState({ value: defaults, custom: false });
      pushRemote(defaults);
    }, []);

    return {
      value: state.value,
      isCustom: state.custom,
      save,
      reset,
      defaults,
      remoteError,
    };
  };

  return {
    KEY: key,
    EVENT: event,
    DEFAULTS: defaults,
    read,
    write,
    clear,
    has,
    useStore,
  };
};
