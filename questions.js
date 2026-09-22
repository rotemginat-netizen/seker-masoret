// השאלות בסקר + התוצאות הארציות (סקר הקונגרס הישראלי) להשוואה
export const QUESTIONS = [
  {
    id: 'activities',
    title: 'איזה מהפעילויות הבאות אתם נוהגים לעשות?',
    hint: 'אפשר לסמן כמה תשובות שרוצים (או אף אחת)',
    options: [
      { id: 'seder',      icon: '🍷', label: 'קיום ליל סדר משפחתי',        national: 84 },
      { id: 'hanukkah',   icon: '🕎', label: 'הדלקת נרות חנוכה',           national: 78 },
      { id: 'kiddush',    icon: '🥂', label: 'קידוש בליל שישי',            national: 58 },
      { id: 'yomkippur',  icon: '📯', label: 'צום ביום כיפור',             national: 53 },
      { id: 'pork',       icon: '🐷', label: 'הימנעות מאכילת חזיר',        national: 51 },
      { id: 'meatmilk',   icon: '🍔', label: 'הפרדה בין בשר לחלב',          national: 42 },
      { id: 'synagogue',  icon: '🕍', label: 'ביקור בבית כנסת',            national: 35 },
      { id: 'siddur',     icon: '📖', label: 'תפילה מתוך הסידור',          national: 32 },
      { id: 'kosher',     icon: '🍽️', label: 'אכילה במסעדות כשרות בלבד',   national: 28 },
      { id: 'tehillim',   icon: '📜', label: 'אמירת תהילים',               national: 26 },
      { id: 'tefillin',   icon: '✡️', label: 'הנחת תפילין',                national: 23 },
      { id: 'tzaddikim',  icon: '🪦', label: 'ביקור בקברי צדיקים',          national: 15 },
    ],
  },
  {
    id: 'values',
    title: 'חשיבות המסורת – עם אילו היגדים אתם מסכימים?',
    hint: 'גם אם עוד אין לכם ילדים – חשבו על העתיד. אפשר לסמן כמה תשובות',
    options: [
      { id: 'holidays',    icon: '🎉', label: 'חשוב לי שילדיי יכירו את חגי ישראל',                      national: 86 },
      { id: 'tanach',      icon: '📘', label: 'חשוב לי שילדיי יכירו את התנ״ך',                         national: 81 },
      { id: 'generations', icon: '👨‍👩‍👧', label: 'חשוב לי שהמסורת היהודית תמשיך לדורות הבאים במשפחתי', national: 72 },
      { id: 'barmitzvah',  icon: '🎊', label: 'חשוב לי שילדיי יחגגו בר/בת מצווה',                       national: 71 },
      { id: 'prayerbook',  icon: '📖', label: 'חשוב לי שילדיי יכירו את סידור התפילה',                   national: 50 },
      { id: 'tallit',      icon: '✡️', label: 'חשוב שבכל בית יהודי יהיו טלית ותפילין',                  national: 46 },
    ],
  },
];
