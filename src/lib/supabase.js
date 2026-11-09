/**
 * supabase.js — Supabase ক্লায়েন্ট (ঐচ্ছিক)
 * ------------------------------------------------------------
 * .env-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY থাকলে আসল ডেটাবেসে চলে।
 * না থাকলে null — তখন localdb.js (localStorage) ডেমো মোডে চলে।
 *
 * গুরুত্বপূর্ণ: অ্যাডমিন অ্যাপের সাথে একই Supabase প্রজেক্ট ব্যবহার করুন,
 * যাতে অ্যাডমিন থেকে যোগ করা প্রোডাক্ট/সার্ভিস সাইটে সাথে সাথে দেখা যায়।
 */

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('xxxxxxxxxxxx') && !anonKey.includes('....')
);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

/** ডেটা সোর্সের নাম (UI-তে দেখানোর জন্য) */
export const dataSource = isSupabaseConfigured ? 'supabase' : 'demo';
