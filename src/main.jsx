import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import ThemeLayer from './components/ThemeLayer.jsx';
import './index.css';

/* ==========================================================
   main.jsx — v21
   ----------------------------------------------------------
   ⚠️ এখানেই থিম না বদলানোর দ্বিতীয় কারণটা ছিল:

   আগে ThemeLayer কোথাও মাউন্টই করা ছিল না! App.jsx-এও ছিল না,
   main.jsx-এও ছিল না। তাই অ্যাডমিনে থিম সেভ করলে
   localStorage-এ লেখা হতো, কিন্তু CSS ভেরিয়েবল
   (--accent, --bg, --text ...) কখনোই :root-এ বসত না —
   ফলে সাইট একদমই বদলাত না।

   এখন ThemeLayer এখানে মাউন্ট করা হয়েছে — BrowserRouter-এর
   ভেতরে, কিন্তু App-এর বাইরে, যাতে রুট বদলালেও unmount না হয়।
   ========================================================== */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <ThemeLayer />
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#17171d', color: '#f4f4f6', border: '1px solid #26262e' },
          }}
        />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
