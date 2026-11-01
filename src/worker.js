const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});
const STATUS=['pending','confirmed','shipped','delivered','cancelled'];
const T={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4'};
const mu=s=>String(s||'').startsWith('/media/')?String(s):'';

export default {
  async fetch(req, env) {
    const u = new URL(req.url), p = u.pathname, m = req.method;
    try {
      if (p.startsWith('/media/')) return media(req, env, p.slice(7));
      if (p.startsWith('/api/admin/')) {
        if (!env.ADMIN_TOKEN || req.headers.get('authorization') !== 'Bearer ' + env.ADMIN_TOKEN) return J({error:'unauthorized'},401);
        return admin(req, env, u);
      }
      if (p === '/api/products') return J((await env.DB.prepare('SELECT id,name,price,description,image,video FROM products WHERE active=1 ORDER BY id DESC').all()).results);
      if (p === '/api/config') return J({delivery:+env.DELIVERY_FEE||0, bkash:env.BKASH_NUMBER||''});
      if (p === '/api/orders' && m === 'POST') return order(req, env);
      if (p === '/api/track') {
        const r = await env.DB.prepare('SELECT status,total FROM orders WHERE code=? AND phone=?')
          .bind((u.searchParams.get('code')||'').toUpperCase(), (u.searchParams.get('phone')||'').replace(/\D/g,'').replace(/^88/,'')).first();
        return r ? J(r) : J({error:'অর্ডার পাওয়া যায়নি'},404);
      }
      return env.ASSETS.fetch(req);
    } catch (e) { return J({error:'সার্ভারে সমস্যা হয়েছে'},500); }
  }
};

async function media(req, env, key) {
  const o = await env.BUCKET.get(key, {range: req.headers});
  if (!o) return new Response('Not found', {status:404});
  const h = new Headers(); o.writeHttpMetadata(h);
  h.set('etag', o.httpEtag); h.set('accept-ranges','bytes'); h.set('cache-control','public, max-age=31536000, immutable');
  if (o.range && req.headers.get('range')) {
    const {offset=0, length=o.size-offset} = o.range;
    h.set('content-range', `bytes ${offset}-${offset+length-1}/${o.size}`);
    return new Response(o.body, {status:206, headers:h});
  }
  return new Response(o.body, {headers:h});
}

async function order(req, env) {
  const b = await req.json();
  const name = String(b.name||'').trim().slice(0,100);
  const phone = String(b.phone||'').replace(/\D/g,'').replace(/^88/,'');
  const address = String(b.address||'').trim().slice(0,300);
  const pay = b.payment==='bkash' ? 'bkash' : 'cod';
  const trx = String(b.trx||'').trim().slice(0,30);
  const q = new Map();
  for (const i of (b.items||[]).slice(0,50)) q.set(+i.id, Math.min(Math.max(+i.qty|0,1),20));
  if (!name || !/^01\d{9}$/.test(phone) || !address || !q.size) return J({error:'নাম, সঠিক মোবাইল নম্বর ও ঠিকানা দিন'},400);
  if (pay==='bkash' && !trx) return J({error:'bKash TrxID দিন'},400);
  const ids = [...q.keys()];
  const rows = (await env.DB.prepare(`SELECT id,name,price FROM products WHERE active=1 AND id IN (${ids.map(()=>'?').join()})`).bind(...ids).all()).results;
  if (!rows.length) return J({error:'পণ্য পাওয়া যায়নি'},400);
  const sub = rows.reduce((a,r)=>a+r.price*q.get(r.id),0), del = +env.DELIVERY_FEE||0;
  const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
  const o = await env.DB.prepare('INSERT INTO orders(code,name,phone,address,payment,trx,subtotal,delivery,total) VALUES(?,?,?,?,?,?,?,?,?) RETURNING id')
    .bind(code,name,phone,address,pay,trx,sub,del,sub+del).first();
  await env.DB.batch(rows.map(r=>env.DB.prepare('INSERT INTO order_items VALUES(?,?,?,?,?)').bind(o.id,r.id,r.name,r.price,q.get(r.id))));
  return J({code});
}

async function admin(req, env, u) {
  const p = u.pathname.slice(11), m = req.method, D = env.DB;
  if (p==='orders') return J((await D.prepare("SELECT o.*,(SELECT group_concat(name||' ×'||qty,', ') FROM order_items WHERE order_id=o.id) items FROM orders o ORDER BY id DESC LIMIT 100").all()).results);
  if (p==='products') return J((await D.prepare('SELECT * FROM products ORDER BY id DESC').all()).results);
  if (p==='upload' && m==='POST') {
    const ext = (u.searchParams.get('ext')||'').toLowerCase();
    if (!T[ext]) return J({error:'শুধু jpg, png, webp, mp4 চলবে'},400);
    const k = crypto.randomUUID()+'.'+ext;
    await env.BUCKET.put(k, req.body, {httpMetadata:{contentType:T[ext]}});
    return J({url:'/media/'+k});
  }
  if (p==='product' && m==='POST') {
    const b = await req.json();
    const v = [String(b.name||'').slice(0,200), +b.price||0, String(b.description||'').slice(0,2000), mu(b.image), mu(b.video), b.active?1:0];
    if (b.id) await D.prepare('UPDATE products SET name=?,price=?,description=?,image=?,video=?,active=? WHERE id=?').bind(...v,+b.id).run();
    else await D.prepare('INSERT INTO products(name,price,description,image,video,active) VALUES(?,?,?,?,?,?)').bind(...v).run();
    return J({ok:1});
  }
  if (p==='status' && m==='POST') {
    const b = await req.json();
    if (!STATUS.includes(b.status)) return J({error:'bad'},400);
    await D.prepare('UPDATE orders SET status=? WHERE id=?').bind(b.status,+b.id).run();
    return J({ok:1});
  }
  return J({error:'not found'},404);
}
