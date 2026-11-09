import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Phone, Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

const NAV = [
  { to: '/', label: 'হোম', end: true },
  { to: '/shop', label: 'শপ' },
  { to: '/services', label: 'সার্ভিস' },
  { to: '/blog', label: 'ব্লগ' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'যোগাযোগ' },
];

export default function Header() {
  const { cartCount, wishlist, settings } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const contact = settings?.contact || {};
  const identity = settings?.identity || {};

  const search = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-line">
      {/* টপ বার */}
      <div className="bg-surface2 border-b border-line text-xs">
        <div className="container-x flex items-center justify-between h-9">
          <p className="flex items-center gap-1.5 text-ink-muted">
            <Truck size={13} className="text-accent" /> ২০০০ টাকার উপরে ফ্রি ডেলিভারি
          </p>
          <a href={`tel:${contact.phone || ''}`} className="flex items-center gap-1.5 text-ink-muted hover:text-accent">
            <Phone size={13} /> {contact.phone || '01884332067'}
          </a>
        </div>
      </div>

      {/* মূল হেডার */}
      <div className="container-x flex items-center gap-4 h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-lg bg-accent grid place-items-center text-black font-bold text-lg">
            ই
          </span>
          <span className="font-semibold text-lg hidden sm:block">
            {identity.siteName || 'ইম্পোটেক'}
          </span>
        </Link>

        <form onSubmit={search} className="hidden md:flex flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-9"
            placeholder="পণ্য খুঁজুন…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-field text-sm transition-colors ${
                  isActive ? 'text-accent font-medium' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 ml-auto lg:ml-2">
          <Link to="/wishlist" className="relative w-10 h-10 grid place-items-center rounded-field text-ink-muted hover:text-ink hover:bg-surface2">
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-accent text-black text-[10px] font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative w-10 h-10 grid place-items-center rounded-field text-ink-muted hover:text-ink hover:bg-surface2">
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-accent text-black text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/account" className="w-10 h-10 grid place-items-center rounded-field text-ink-muted hover:text-ink hover:bg-surface2">
            <User size={19} />
          </Link>
          <button
            className="lg:hidden w-10 h-10 grid place-items-center rounded-field text-ink-muted hover:text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="মেনু"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* মোবাইল মেনু */}
      {open && (
        <div className="lg:hidden border-t border-line bg-surface">
          <div className="container-x py-3 space-y-1">
            <form onSubmit={search} className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                className="input pl-9"
                placeholder="পণ্য খুঁজুন…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-field text-sm ${
                    isActive ? 'bg-accent/15 text-accent font-medium' : 'text-ink-muted hover:bg-surface2'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
