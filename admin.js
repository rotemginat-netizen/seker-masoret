import { db, configured } from './firebase.js';
import { QUESTIONS } from './questions.js';
import {
  doc, onSnapshot, setDoc, updateDoc, collection, query, where,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const $ = id => document.getElementById(id);
const chartsEl = $('charts');
const cfgRef = configured ? doc(db, 'config', 'current') : null;

let session = null;
let open = true;
let unsubResponses = null;

// ---- join link + QR ----
const joinUrl = location.origin + location.pathname.replace(/admin(\.html)?$/, '');
$('url').textContent = joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
try {
  const qr = qrcode(0, 'M'); qr.addData(joinUrl); qr.make();
  $('qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0 });
} catch (e) { console.error(e); }

// ---- build charts once ----
chartsEl.innerHTML = QUESTIONS.map(q => `
  <article class="panel chart">
    <h2>${q.title}</h2>
    <div class="rows">
      ${q.options.map(o => `
        <div class="row" id="r-${q.id}-${o.id}">
          <div class="lbl"><span class="ic">${o.icon}</span><span>${o.label}</span></div>
          <div class="track">
            <div class="b ours"><div class="fill"></div><span class="val">0%</span></div>
            ${o.national != null ? `<div class="b nat"><div class="fill" style="width:${o.national * 0.85}%"></div><span class="val">${o.national}%</span></div>` : ''}
          </div>
        </div>`).join('')}
    </div>
    <div class="legend">
      <span><i style="background:linear-gradient(270deg,var(--cyan),var(--blue))"></i>הקבוצה שלנו</span>
      ${q.options.some(o => o.national != null) ? `<span class="nat-l"><i style="background:var(--grey)"></i>הציבור הישראלי</span>` : ''}
    </div>
  </article>`).join('');

function draw(docs) {
  const n = docs.length;
  $('n').textContent = n;
  for (const q of QUESTIONS) {
    const counts = Object.fromEntries(q.options.map(o => [o.id, 0]));
    for (const d of docs) for (const id of (d[q.id] || [])) if (id in counts) counts[id]++;
    for (const o of q.options) {
      const pct = n ? Math.round((counts[o.id] / n) * 100) : 0;
      const row = $(`r-${q.id}-${o.id}`);
      row.querySelector('.ours .fill').style.width = `${pct * 0.85}%`;
      const v = row.querySelector('.ours .val');
      v.textContent = `${pct}%`;
      v.title = `${counts[o.id]} מתוך ${n}`;
    }
  }
}

function listen(s) {
  unsubResponses?.();
  draw([]);
  unsubResponses = onSnapshot(
    query(collection(db, 'responses'), where('session', '==', s)),
    snap => draw(snap.docs.map(d => d.data())),
    err => console.error(err),
  );
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

if (!configured) {
  chartsEl.insertAdjacentHTML('beforebegin',
    '<div class="err">חסרות הגדרות Firebase – יש למלא את הקובץ firebase-config.js</div>');
} else {
  onSnapshot(cfgRef, snap => {
    if (!snap.exists()) { setDoc(cfgRef, { session: newId(), open: true }); return; }
    const c = snap.data();
    open = !!c.open;
    $('status').innerHTML = `<span class="status-dot ${open ? '' : 'off'}"></span>${open ? 'פתוח' : 'סגור'}`;
    $('toggleOpen').textContent = open ? 'סגירת הצבעה' : 'פתיחת הצבעה';
    if (c.session !== session) { session = c.session; listen(session); }
  }, err => {
    console.error(err);
    chartsEl.insertAdjacentHTML('beforebegin',
      '<div class="err">שגיאת חיבור ל-Firestore – בדקו שכללי האבטחה פורסמו</div>');
  });

  $('toggleOpen').onclick = () => updateDoc(cfgRef, { open: !open });
  $('newRound').onclick = () => {
    if (confirm('להתחיל סבב חדש? הגרפים יתאפסו (התשובות הקודמות נשמרות במסד הנתונים).')) {
      setDoc(cfgRef, { session: newId(), open: true });
    }
  };
}

$('toggleNat').onclick = () => {
  const hidden = chartsEl.classList.toggle('hide-nat');
  $('toggleNat').textContent = hidden ? 'הצגת תוצאות ארציות' : 'הסתרת תוצאות ארציות';
};
