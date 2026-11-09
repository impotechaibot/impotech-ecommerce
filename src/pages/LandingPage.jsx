import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingCart, Star, Check, Clock, Truck, ShieldCheck, Volume2, VolumeX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { localdb } from '../lib/localdb.js';
import { money, discountPercent, toBn } from '../lib/format.js';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';

function useCountdown(target) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!target) return undefined;
    const tick = () => setLeft(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: left <= 0,
  };
}

export default function LandingPage() {
  const { slug } = useParams();
  const { products, loading } = useStore();
  const [page, setPage] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [muted, setMuted] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', address: '', qty: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const found = localdb.findLandingPage(slug);
    setPage(found);
  }, [slug, products]);

  const product = useMemo(() => {
    if (!page) return null;
    return products.find((p) => p.id === page.product_id) || page.product || null;
  }, [page, products]);

  const cd = useCountdown(page?.countdown_to);

  if (loading) return <Loader />;

  if (!page || !product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">ল্যান্ডিং পেজটি পাওয়া যায়নি</h1>
        <p className="text-ink-muted mt-2">লিংকটি ভুল বা পেজটি এখনো প্রকাশ করা হয়নি।</p>
        <Link to="/shop" className="btn-primary mt-6">সব পণ্য দেখুন</Link>
      </div>
    );
  }

  const images = (product.images || []).filter(Boolean);
  const videos = (product.videos || []).filter(Boolean);
  const off = discountPercent(product.price, product.old_price);
  const features = page.features || product.features || [];
  const reviews = localdb.listReviews(product.id);

  const order = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('নাম দিন'); return; }
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) { toast.error('সঠিক মোবাইল নম্বর দিন'); return; }
    if (!form.address.trim()) { toast.error('ঠিকানা দিন'); return; }
    setSubmitting(true);
    try {
      const qty = Math.max(1, Number(form.qty) || 1);
      const subtotal = Number(product.price) * qty;
      const shipping = 80;
      const saved = localdb.placeOrder({
        order_code: localdb.nextOrderCode(),
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        items: [{ product_id: product.id, name: product.name_bn || product.name, slug: product.slug, price: Number(product.price), qty, image: images[0] || '' }],
        subtotal,
        shipping,
        discount: 0,
        total: subtotal + shipping,
        payment_method: 'cod',
        status: 'new',
        source: 'landing:' + slug,
      });
      toast.success('অর্ডার সফল! আমরা শীঘ্রই যোগাযোগ করব।');
      setForm({ name: '', phone: '', address: '', qty: 1 });
      window.location.href = `/order-success/${saved.order_code}`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error('অর্ডার করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Seo
        title={page.meta_title || `${product.name_bn || product.name} — বিশেষ অফার`}
        description={page.meta_description || product.description}
        image={images[0]}
      />

      {/* হিরো */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-x py-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            {page.offer_text && <span className="badge bg-red-500/90 text-white">{page.offer_text}</span>}
            <h1 className="text-3xl sm:text-4xl font-bold mt-4 leading-tight">
              {page.hero_title || product.name_bn || product.name}
            </h1>
            <p className="text-ink-muted mt-4 text-lg">
              {page.hero_subtitle || product.description}
            </p>

            <div className="flex items-end gap-3 mt-6">
              <span className="text-3xl font-bold text-accent">{money(product.price)}</span>
              {Number(product.old_price || 0) > Number(product.price || 0) && (
                <>
                  <span className="text-lg text-ink-muted line-through">{money(product.old_price)}</span>
                  <span className="badge bg-red-500/15 text-red-400">-{off}%</span>
                </>
              )}
            </div>

            {page.countdown_to && !cd.done && (
              <div className="flex gap-3 mt-6">
                {[
                  { v: cd.days, l: 'দিন' },
                  { v: cd.hours, l: 'ঘণ্টা' },
                  { v: cd.minutes, l: 'মিনিট' },
                  { v: cd.seconds, l: 'সেকেন্ড' },
                ].map((c, i) => (
                  <div key={i} className="card px-4 py-3 text-center min-w-[64px]">
                    <p className="text-xl font-bold text-accent">{toBn(String(c.v).padStart(2, '0'))}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{c.l}</p>
                  </div>
                ))}
              </div>
            )}

            <a href="#order" className="btn-primary mt-7">
              <ShoppingCart size={17} /> এখনই অর্ডার করুন
            </a>
          </div>

          <div className="card overflow-hidden aspect-square bg-surface2">
            {images.length > 0 ? (
              <img src={images[activeImg]} alt={product.name_bn || product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-ink-muted">ছবি নেই</div>
            )}
          </div>
        </div>
      </section>

      {/* ফিচার */}
      {features.length > 0 && (
        <section className="container-x py-12">
          <h2 className="text-2xl font-semibold text-center mb-8">কেন এই পণ্যটি?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="card p-5 flex items-start gap-3">
                <Check size={18} className="text-accent shrink-0 mt-0.5" />
                <p className="text-sm">{typeof f === 'string' ? f : f.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* গ্যালারি */}
      {images.length > 1 && (
        <section className="container-x py-8">
          <h2 className="text-2xl font-semibold text-center mb-8">গ্যালারি</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square rounded-card overflow-hidden border-2 ${i === activeImg ? 'border-accent' : 'border-line'}`}
              >
                <img src={img} alt={`গ্যালারি ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ভিডিও */}
      {videos.length > 0 && (
        <section className="container-x py-8">
          <h2 className="text-2xl font-semibold text-center mb-8">ভিডিও</h2>
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {videos.map((v, i) => (
              <div key={i} className="relative card overflow-hidden aspect-video bg-black">
                <video src={v} className="w-full h-full object-contain" muted={muted} autoPlay loop playsInline />
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="absolute bottom-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-black/60 text-white"
                  aria-label="সাউন্ড"
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* রিভিউ */}
      {reviews.length > 0 && (
        <section className="container-x py-12">
          <h2 className="text-2xl font-semibold text-center mb-8">কাস্টমার রিভিউ</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className={i <= Number(r.rating || 0) ? 'text-accent fill-accent' : 'text-line'} />
                  ))}
                </div>
                <p className="text-sm text-ink-muted">{r.text || r.comment}</p>
                <p className="text-xs text-ink-muted mt-3 font-medium">— {r.customer_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* অর্ডার ফর্ম */}
      <section id="order" className="container-x py-12">
        <div className="card p-7 max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold text-center">অর্ডার করুন</h2>
          <p className="text-sm text-ink-muted text-center mt-2">ফর্মটি পূরণ করুন — আমরা কল করে কনফার্ম করব</p>

          <form onSubmit={order} className="space-y-4 mt-6">
            <div>
              <label className="label">পূর্ণ নাম *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" />
            </div>
            <div>
              <label className="label">মোবাইল নম্বর *</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
            </div>
            <div>
              <label className="label">সম্পূর্ণ ঠিকানা *</label>
              <textarea className="input min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="বাসা/রোড/এলাকা" />
            </div>
            <div>
              <label className="label">পরিমাণ</label>
              <input type="number" min="1" className="input" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            </div>

            <div className="bg-surface2 rounded-field p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">পণ্যের দাম</span>
                <span>{money(Number(product.price) * Math.max(1, Number(form.qty) || 1))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">ডেলিভারি চার্জ</span>
                <span>{money(80)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-line pt-2">
                <span>সর্বমোট</span>
                <span className="text-accent">{money(Number(product.price) * Math.max(1, Number(form.qty) || 1) + 80)}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'অর্ডার হচ্ছে…' : 'ক্যাশ অন ডেলিভারিতে অর্ডার করুন'}
            </button>
          </form>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Truck, t: 'দ্রুত ডেলিভারি' },
              { icon: ShieldCheck, t: 'নিরাপদ' },
              { icon: Clock, t: '২৪/৭ সাপোর্ট' },
            ].map((b, i) => (
              <div key={i} className="text-center">
                <b.icon size={18} className="mx-auto text-accent" />
                <p className="text-xs text-ink-muted mt-1.5">{b.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
