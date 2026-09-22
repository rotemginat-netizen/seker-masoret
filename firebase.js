import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

export const configured = !String(firebaseConfig.projectId).includes('PASTE');
export const db = configured ? getFirestore(initializeApp(firebaseConfig)) : null;
