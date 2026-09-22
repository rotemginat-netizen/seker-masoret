import { db, configured } from './firebase.js';
import { QUESTIONS } from './questions.js';
import {
  doc, onSnapshot, addDoc, collection, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = document.getElementById('app');
const actions = document.getElementById('actions');

let session = null;
let open = false;
let step = 0;
let sending = false;
const answers = Object.fromEntries(QUESTIONS.map(q => [q.id, new Set()]));

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const answeredKey = () => `answered_${session}`;

function message(emoji, title, text) {
  actions.hidden = true;
  app.innerHTML = `<div class="center msg"><div class="big-emoji">${emoji}</div><h2>${title}</h2><p>${text || ''}</p></div>`;
}

function render() {
  if (!session) return message('🕐', 'הסקר עוד לא נפתח', 'המדריכה תפתח אותו בעוד רגע');
  if (store.get(answeredKey())) return message('🙌', 'תודה! התשובות נשלחו', 'עכשיו מסתכלים ביחד על התוצאות');
  if (!open) return message('🔒', 'ההצבעה סגורה כרגע', '');

  const q = QUESTIONS[step];
  const chosen = answers[q.id];
  app.innerHTML = `
    <div class="progress">${QUESTIONS.map((_, i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>
    <h2 class="qtitle">${q.title}</h2>
    <p class="qhint">${q.hint}</p>
    <div class="opts${q.single ? ' single' : ''}">
      ${q.options.map(o => `
        <button class="opt" type="button" data-id="${o.id}" aria-pressed="${chosen.has(o.id)}">
          <span class="ic">${o.icon}</span><span class="tx">${o.label}</span><span class="ck">✓</span>
        </button>`).join('')}
    </div>
    <div id="err"></div>`;

  app.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (q.single) {
      chosen.clear(); chosen.add(id);
      app.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', chosen.has(b.dataset.id)));
      document.getElementById('next').disabled = false;
    } else {
      chosen.has(id) ? chosen.delete(id) : chosen.add(id);
      btn.setAttribute('aria-pressed', chosen.has(id));
    }
  }));

  const last = step === QUESTIONS.length - 1;
  actions.hidden = false;
  actions.innerHTML = `
    ${step > 0 ? '<button class="btn ghost" id="back">הקודם</button>' : ''}
    <button class="btn" id="next" ${q.single && !chosen.size ? 'disabled' : ''}>${last ? 'שליחה' : 'הבא'}</button>`;
  document.getElementById('back')?.addEventListener('click', () => { step--; render(); scrollTo(0, 0); });
  document.getElementById('next').addEventListener('click', () => {
    if (!last) { step++; render(); scrollTo(0, 0); return; }
    submit();
  });
}

async function submit() {
  if (sending) return;
  sending = true;
  const btn = document.getElementById('next');
  btn.disabled = true; btn.textContent = 'שולח…';
  try {
    await addDoc(collection(db, 'responses'), {
      session,
      ...Object.fromEntries(QUESTIONS.map(q => [q.id, [...answers[q.id]]])),
      createdAt: serverTimestamp(),
    });
    store.set(answeredKey(), '1');
    render();
  } catch (e) {
    console.error(e);
    document.getElementById('err').innerHTML =
      `<div class="err">לא הצלחנו לשלוח (${open ? 'בדקו חיבור לאינטרנט' : 'ההצבעה נסגרה'}). נסו שוב.</div>`;
    btn.disabled = false; btn.textContent = 'שליחה';
  } finally {
    sending = false;
  }
}

if (!configured) {
  message('⚙️', 'חסרות הגדרות Firebase', 'יש למלא את הקובץ firebase-config.js');
} else {
  onSnapshot(doc(db, 'config', 'current'), snap => {
    const c = snap.exists() ? snap.data() : null;
    const newSession = c?.session || null;
    if (newSession !== session) {           // סבב חדש – מאפסים תשובות
      session = newSession; step = 0;
      Object.values(answers).forEach(s => s.clear());
    }
    open = !!c?.open;
    if (!sending) render();
  }, err => {
    console.error(err);
    message('⚠️', 'שגיאת חיבור', 'בדקו שכללי האבטחה ב-Firestore פורסמו');
  });
}
