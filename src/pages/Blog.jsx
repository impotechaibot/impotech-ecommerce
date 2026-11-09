import { Calendar, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';

const POSTS = [
  {
    id: 1,
    title: 'বাইকের জন্য সেরা LED লাইট বাছাই করার টিপস',
    excerpt: 'সঠিক LED লাইট আপনার রাতের রাইডকে নিরাপদ ও আরামদায়ক করে তোলে। জেনে নিন কী দেখে কিনবেন।',
    date: '2026-10-28',
    tag: 'গাইড',
  },
  {
    id: 2,
    title: 'অ্যাঞ্জেল উইংস ইনস্টল করার সহজ নিয়ম',
    excerpt: 'নিজেই ঘরে বসে অ্যাঞ্জেল উইংস লাগানোর ধাপে ধাপে নির্দেশনা।',
    date: '2026-10-20',
    tag: 'টিউটোরিয়াল',
  },
  {
    id: 3,
    title: 'রাইডিং গিয়ার কেন জরুরি',
    excerpt: 'দুর্ঘটনার সময় সঠিক গিয়ার আপনার জীবন বাঁচাতে পারে। জেনে নিন কী কী থাকা দরকার।',
    date: '2026-10-12',
    tag: 'নিরাপত্তা',
  },
  {
    id: 4,
    title: 'বর্ষায় বাইক রক্ষার ৭টি উপায়',
    excerpt: 'বৃষ্টির মৌসুমে আপনার বাইক ও অ্যাকসেসরিজ ভালো রাখার সহজ টিপস।',
    date: '2026-10-05',
    tag: 'টিপস',
  },
];

export default function Blog() {
  return (
    <div className="container-x py-10">
      <Seo title="ব্লগ ও নিউজ — ইম্পোটেক" description="বাইক অ্যাকসেসরিজ, রাইডিং টিপস ও গাইড।" />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold">ব্লগ ও নিউজ</h1>
        <p className="text-ink-muted mt-2">রাইডিং টিপস, গাইড ও নতুন পণ্যের খবর</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {POSTS.map((p) => (
          <article key={p.id} className="card overflow-hidden hover:border-accent/50 transition-colors group">
            <div className="aspect-video bg-gradient-to-br from-surface2 to-surface grid place-items-center">
              <span className="text-4xl">📝</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span className="badge bg-accent/15 text-accent">{p.tag}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {p.date}</span>
              </div>
              <h2 className="font-semibold mt-3 clamp-2 group-hover:text-accent transition-colors">{p.title}</h2>
              <p className="text-sm text-ink-muted mt-2 clamp-3">{p.excerpt}</p>
              <span className="text-sm text-accent flex items-center gap-1 mt-4">
                পড়ুন <ArrowRight size={14} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
