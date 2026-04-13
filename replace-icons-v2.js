/**
 * replace-icons-v2.js — Remplace les emojis par des SVG Lucide (outline)
 *
 * Approche différente de la v1 :
 *  • Regex courts ciblés sur l'emoji + contexte minimal (pas de longues chaînes fragiles)
 *  • Un seul regex pour tous les `icon:'EMOJI'` dans les Insights
 *  • Un seul regex pour tous les `<span class="tab-icon">` de la nav
 *  • Injection automatique de la fonction ic() dans le <script>
 *
 * Usage : node replace-icons-v2.js [chemin/vers/index.html]
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const FILE = path.resolve(process.argv[2] || 'index.html');
let   html = fs.readFileSync(FILE, 'utf8');
let   ok = 0, ko = 0;

// ── SVG paths Lucide (24×24, outline) ─────────────────────────────────────
const P = {
  bottle:      '<path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.788a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.472 6.472 0 0 0 5 0"/>',
  moon:        '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  shield:      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  scale:       '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  chart:       '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  ruler:       '<path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
  calendar:    '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  sparkles:    '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  check:       '<polyline points="20 6 9 17 4 12"/>',
  play:        '<polygon points="5 3 19 12 5 21 5 3"/>',
  pause:       '<rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>',
  refresh:     '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  download:    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  heart:       '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  venus:       '<circle cx="12" cy="8" r="6"/><line x1="12" x2="12" y1="14" y2="22"/><line x1="9" x2="15" y1="19" y2="19"/>',
  mars:        '<circle cx="10" cy="14" r="6"/><line x1="21" x2="15" y1="3" y2="9"/><path d="M21 3h-6"/><path d="M21 9V3"/>',
  settings:    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  cross:       '<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>',
  droplet:     '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  alertcircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>',
  layers:      '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  trending:    '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  timer:       '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  bed:         '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
  clock:       '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  alarmclock:  '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>',
  alert:       '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  pin:         '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 17 8 11 16 11 12 17"/>',
  mappin:      '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  user:        '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  stethoscope: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  plus:        '<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>',
  syringe:     '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><line x1="9" x2="13" y1="11" y2="15"/><line x1="5" x2="2" y1="19" y2="22"/><line x1="14" x2="20" y1="4" y2="10"/>',
  filetext:    '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
};

// Attributs SVG communs
const BASE   = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const INLINE = BASE + ' style="display:inline-block;vertical-align:middle;flex-shrink:0"';

// SVG statique pour contextes HTML (taille configurable)
function svg(name, size = 16, attrs = BASE) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${attrs}>${P[name]}</svg>`;
}
// SVG inline-block (pour boutons, labels, etc.)
const svgi = (name, size) => svg(name, size, INLINE);

// Appel ic() dynamique (évalué au runtime dans le navigateur)
const ic = (name, size = 18) => `\${ic('${name}',${size})}`;

// ── Helpers de remplacement ─────────────────────────────────────────────────
function rStr(old, neu) {
  if (!html.includes(old)) {
    console.warn('  ✗ NOT FOUND:', JSON.stringify(old.replace(/\n/g,'↵').slice(0, 72)));
    ko++;
  } else {
    html = html.split(old).join(neu);
    const mark = old.replace(/\n/g,'↵').slice(0, 60);
    console.log(`  ✓ "${mark}"`);
    ok++;
  }
}

function rRe(re, fn, label) {
  const before = html;
  html = html.replace(re, fn);
  if (html === before) {
    console.warn('  ✗ NO MATCH:', label || String(re).slice(0, 60));
    ko++;
  } else {
    console.log(`  ✓ [regex] ${label || String(re).slice(0, 55)}`);
    ok++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INJECTION de la fonction ic() dans le <script>
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Injection de ic() ──');
// Détecter le séparateur de ligne du fichier
const EOL = html.includes('\r\n') ? '\r\n' : '\n';
const IC_FN = `
// ── Icônes Lucide dynamiques ─────────────────────────────────────────────────
const _IC_P = ${JSON.stringify(P, null, 0)};
const _IC_A = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0"';
function ic(name, size=18) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" '+_IC_A+'>'+(_IC_P[name]||'')+'</svg>';
}
// ─────────────────────────────────────────────────────────────────────────────
`;
rStr('<script>' + EOL + '// ─── CLÉS', '<script>' + IC_FN + '// ─── CLÉS');

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NAVIGATION — tab-icon spans
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Navigation tabs ──');
const TAB_MAP = {
  '🍼': ['bottle', 20], '😴': ['moon', 20], '🧷': ['shield', 20],
  '⚖️': ['scale', 20], '🏥': ['cross', 20], '✨': ['sparkles', 20],
  '⚙️': ['settings', 20],
};
// Un seul regex capturant le contenu du span
rRe(
  /<span class="tab-icon">([^<]+)<\/span>/gu,
  (_, raw) => {
    const e = raw.trim().replace(/\uFE0F/g, '') + (raw.includes('\uFE0F') ? '' : '');
    const entry = TAB_MAP[raw.trim()] || TAB_MAP[e];
    return entry ? `<span class="tab-icon">${svg(entry[0], entry[1])}</span>` : _;
  },
  'tab-icon spans (7 onglets)'
);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Onboarding ──');
rStr('<div class="onboard-logo">👶</div>',
     '<div class="onboard-logo">' + svg('heart', 48) + '</div>');
rStr('<span>👧</span>Fille',   '<span>' + svgi('venus', 22) + '</span>Fille');
rStr('<span>👦</span>Garçon', '<span>' + svgi('mars', 22) + '</span>Garçon');

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SANTÉ — sous-navigation
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Santé sous-nav ──');
rStr('>💉 Vaccins<',              '>' + svgi('syringe', 13) + ' Vaccins<');
rStr('>📅 Rendez-vous<',          '>' + svgi('calendar', 13) + ' Rendez-vous<');
rStr('>📐 Périmètre crânien<',   '>' + svgi('ruler', 13) + ' Périmètre crânien<');

// ═══════════════════════════════════════════════════════════════════════════════
// 5. VACCINS — boutons pays (supprimer drapeaux, garder texte)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Drapeaux pays ──');
rStr('>🇫🇷 France<',    '>France<');
rStr('>🇹🇭 Thaïlande<', '>Thaïlande<');

// ═══════════════════════════════════════════════════════════════════════════════
// 6. RDV — boutons type dans le formulaire HTML (seg-btn)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── RDV seg-buttons ──');
rStr('>👶 Pédiatre<',    '>' + svgi('user', 13) + ' Pédiatre<');
rStr('>🩺 Généraliste<', '>' + svgi('stethoscope', 13) + ' Généraliste<');
rStr('>⚕️ Spécialiste<', '>' + svgi('plus', 13) + ' Spécialiste<');
rStr('>🚨 Urgences<',    '>' + svgi('alert', 13) + ' Urgences<');

// ═══════════════════════════════════════════════════════════════════════════════
// 7. TÉTÉES — seg-buttons (♀ sein) + COUCHES — seg-buttons emoji
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Sein seg-buttons ──');
rStr('>♀ Gauche<', '>' + svgi('heart', 13) + ' Gauche<');
rStr('>♀ Droit<',  '>' + svgi('heart', 13) + ' Droit<');
rStr('>🍼 Biberon<', '>' + svgi('bottle', 13) + ' Biberon<');

console.log('\n── Couches seg-buttons ──');
rStr('>💧 Pipi</div>',  '>' + svgi('droplet', 13) + ' Pipi</div>');
rStr('>💩 Caca</div>',  '>' + svgi('alertcircle', 13) + ' Caca</div>');
rStr('>🔥 Mixte</div>', '>' + svgi('layers', 13) + ' Mixte</div>');

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CARD TITLES avec emoji (regex — capture et mappe l'emoji en tête)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Card titles ──');
// Mapping normalisé (sans variation selector U+FE0F)
const CT_MAP = {
  '⚖': 'scale', '📏': 'ruler', '📈': 'trending', '📐': 'ruler',
  '🔮': 'sparkles', '📊': 'chart', '⚠': 'alert', '📝': 'filetext',
  '👶': 'user', '💾': 'download', '📂': 'upload',
};
rRe(
  /(<div class="card-title">)([\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]+)\s*/gu,
  (_, prefix, emojiRaw) => {
    const e = emojiRaw.replace(/\uFE0F/g, '');
    const name = CT_MAP[e] || CT_MAP[emojiRaw];
    return name ? prefix + svg(name, 14) + ' ' : _;
  },
  'card-title emoji prefixes'
);

// ═══════════════════════════════════════════════════════════════════════════════
// 8b. JS — headerName : textContent avec emoji → innerHTML avec ic()
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS headerName + profile avatar ──');
rStr(
  "document.getElementById('headerName').textContent = (p.sexe==='fille' ? '👧 ' : '👦 ') + p.prenom;",
  "document.getElementById('headerName').innerHTML = ic(p.sexe==='fille'?'venus':'mars', 14) + ' ' + p.prenom;"
);
rStr(
  "<div class=\"profile-avatar\">${p.sexe==='fille'?'👧':'👦'}</div>",
  `<div class="profile-avatar">\${ic(p.sexe==='fille'?'venus':'mars',28)}</div>`
);

// ═══════════════════════════════════════════════════════════════════════════════
// 9. BOUTONS STATIQUES
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Boutons statiques ──');
// Export / Import
rStr('>↓ Télécharger mes données</button>',
     '>' + svgi('download', 15) + ' Télécharger mes données</button>');
rStr('>↑ Charger une sauvegarde</button>',
     '>' + svgi('upload', 15) + ' Charger une sauvegarde</button>');
// Timer tétée
rStr('>▶ Démarrer</button>',
     '>' + svgi('play', 15) + ' Démarrer</button>');
// Sommeil
rStr('>▶ Commencer maintenant</button>',
     '>' + svgi('play', 15) + ' Commencer maintenant</button>');
// Insights refresh
rStr('>↻ Actualiser</button>',
     '>' + svgi('refresh', 13) + ' Actualiser</button>');
// Tous les boutons ✓ Enregistrer / Ajouter
[
  'Enregistrer la tétée', 'Enregistrer', 'Enregistrer la couche',
  'Enregistrer le poids', 'Enregistrer la taille',
  'Ajouter le rendez-vous', 'Enregistrer la mesure',
].forEach(label => {
  rStr(`>✓ ${label}</button>`, '>' + svgi('check', 15) + ` ${label}</button>`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. JS — tetTimerToggle / tetTimerReset : textContent → innerHTML + ic()
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS timer tétée ──');
rStr("tetTimerRunning = true; btn.textContent = '⏸ Pause';",
     `tetTimerRunning = true; btn.innerHTML = ic('pause',15)+' Pause';`);
rStr("tetTimerRunning=false; btn.textContent='▶ Reprendre';",
     `tetTimerRunning=false; btn.innerHTML=ic('play',15)+' Reprendre';`);
rStr("document.getElementById('tetTimerBtn').textContent='▶ Démarrer';",
     `document.getElementById('tetTimerBtn').innerHTML=ic('play',15)+' Démarrer';`);

// ═══════════════════════════════════════════════════════════════════════════════
// 11. JS — renderTetees
// ═══════════════════════════════════════════════════════════════════════════════
// ─── Helpers de contexte ic() ────────────────────────────────────────────────
// ic(name,size)  → "${ic('name',size)}"  pour template literals (interpolation)
// concat(n,s)   → "'+ic('name',s)+'"    pour strings JS mono-guillemets (concaténation)
// bare(n,s)     → "ic('name',s)"        pour expressions JS dans ${...} (ternaire, ||)
const concat = (name, size) => `'+ic('${name}',${size})+'`;
const bare   = (name, size) => `ic('${name}',${size})`;

console.log('\n── JS renderTetees ──');
// empty-state dans single-quoted string → concaténation
rStr('<div class="empty-icon">🍼</div>Aucune tétée',
     `<div class="empty-icon">${concat('bottle',36)}</div>Aucune tétée`);
rStr("const labels={sein_gauche:'♀ Sein gauche',sein_droit:'♀ Sein droit',biberon:'🍼 Biberon'};",
     "const labels={sein_gauche:'Sein gauche',sein_droit:'Sein droit',biberon:'Biberon'};");
// ternaire dans expression template literal → appels ic() nus (pas de ${})
rStr("<div class=\"history-icon hi-primary\">${e.type==='biberon'?'🍼':'🤱'}</div>",
     `<div class="history-icon hi-primary">\${e.type==='biberon'?${bare('bottle',16)}:${bare('heart',16)}}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 12. JS — renderSommeil
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderSommeil ──');
rStr('<div class="empty-icon">😴</div>Aucun sommeil',
     `<div class="empty-icon">${concat('moon',36)}</div>Aucun sommeil`);
// history-icon dans template literal → interpolation ic() standard
rStr('<div class="history-icon hi-secondary">😴</div>',
     `<div class="history-icon hi-secondary">${ic('moon',16)}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 13. JS — renderCouches
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderCouches ──');
// Note : stat-lbl 💧💩🔥 déjà remplacés par "Couches seg-buttons" (même pattern >emoji</div>)
rStr("const icons={pipi:'💧',caca:'💩',mixte:'🔥'}",
     "const icons={pipi:ic('droplet',16),caca:ic('alertcircle',16),mixte:ic('layers',16)}");
rStr('<div class="empty-icon">🧷</div>Aucune couche',
     `<div class="empty-icon">${concat('shield',36)}</div>Aucune couche`);
// || dans expression template literal → appel ic() nu
rStr("<div class=\"history-icon hi-green\">${icons[e.type]||'🧷'}</div>",
     `<div class="history-icon hi-green">\${icons[e.type]||${bare('shield',16)}}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 14. JS — renderPoids
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderPoids ──');
rStr('<div class="empty-icon">⚖️</div>Aucune pesée',
     `<div class="empty-icon">${concat('scale',36)}</div>Aucune pesée`);
rStr('<div class="history-icon hi-purple">⚖️</div>',
     `<div class="history-icon hi-purple">${ic('scale',16)}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 15. JS — renderHeightHistory
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderHeightHistory ──');
rStr('<div class="empty-icon">📏</div>Aucune taille',
     `<div class="empty-icon">${concat('ruler',36)}</div>Aucune taille`);
rStr('<div class="history-icon hi-purple">📏</div>',
     `<div class="history-icon hi-purple">${ic('ruler',16)}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 16. JS — renderPerimetre
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderPerimetre ──');
rStr('<div class="empty-icon">📐</div>Aucune mesure',
     `<div class="empty-icon">${concat('ruler',36)}</div>Aucune mesure`);
rStr('<div class="history-icon" style="background:rgba(45,212,191,0.12);">📐</div>',
     `<div class="history-icon" style="background:rgba(45,212,191,0.12);">${ic('ruler',16)}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 17. JS — renderRDV
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS renderRDV ──');
// container.innerHTML = `...` (template literal) → ic() standard
rStr('<div class="empty-icon">📅</div>Aucun rendez-vous',
     `<div class="empty-icon">${ic('calendar',36)}</div>Aucun rendez-vous`);
rStr("const typeEmoji = { pédiatre:'👶', généraliste:'🩺', spécialiste:'⚕️', urgences:'🚨' };",
     "const typeEmoji = { pédiatre:ic('user'), généraliste:ic('stethoscope'), spécialiste:ic('plus'), urgences:ic('alert') };");
rStr("typeEmoji[r.type]||'📋'",
     "typeEmoji[r.type]||ic('calendar')");
// rdv-sub : médecin + lieu (nested template literal)
rStr("`<div class=\"rdv-sub\">👤 ${r.medecin}${r.lieu?' · 📍 '+r.lieu:''}",
     "`<div class=\"rdv-sub\">${ic('user',13)} ${r.medecin}${r.lieu?' · '+ic('mappin',13)+' '+r.lieu:''}");
rStr("`<div class=\"rdv-sub\">📍 ${r.lieu}",
     "`<div class=\"rdv-sub\">${ic('mappin',13)} ${r.lieu}");
rStr("`<div class=\"rdv-notes\">📝 ${r.notes}",
     "`<div class=\"rdv-notes\">${ic('filetext',13)} ${r.notes}");
rStr("`<div class=\"rdv-upcoming-label\">📌 Prochains",
     "`<div class=\"rdv-upcoming-label\">${ic('pin',13)} Prochains");

// ═══════════════════════════════════════════════════════════════════════════════
// 18. JS — Insights — pills résumé du jour
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS Insights — summary pills ──');
rStr('<div class="sp-lbl">🍼 Tétées</div>',  `<div class="sp-lbl">${ic('bottle',11)} Tétées</div>`);
rStr('<div class="sp-lbl">😴 Sommeil</div>', `<div class="sp-lbl">${ic('moon',11)} Sommeil</div>`);
rStr('<div class="sp-lbl">🧷 Couches</div>', `<div class="sp-lbl">${ic('shield',11)} Couches</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 19. JS — Insights — icônes no-data
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS Insights — no-data icons ──');
rStr('<div class="no-data-icon">📊</div>', `<div class="no-data-icon">${ic('chart',28)}</div>`);
rStr('<div class="no-data-icon">🔮</div>', `<div class="no-data-icon">${ic('sparkles',28)}</div>`);

// ═══════════════════════════════════════════════════════════════════════════════
// 20. JS — Insights — propriétés icon:'EMOJI' (regex global)
//     Mappe d'un coup tous les objets { icon:'⏱', ... } → { icon:ic('timer'), ... }
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS Insights — icon: properties ──');
const ICON_MAP = {
  '\u23F1':  'timer',       // ⏱
  '\u23F0':  'alarmclock',  // ⏰
  '\uD83C\uDF7C': 'bottle', // 🍼 (surrogate pair)
  '\uD83D\uDE34': 'moon',   // 😴
  '\uD83E\uDDF7': 'shield', // 🧷
  '\uD83D\uDCC5': 'calendar', // 📅
  '\uD83D\uDCA4': 'bed',    // 💤
  '\uD83D\uDD50': 'clock',  // 🕐
  '\uD83D\uDCC8': 'trending', // 📈
  '\u26A0':  'alert',       // ⚠ (sans variation selector)
  '\uD83D\uDE1F': 'alertcircle', // 😟
};
// Regex : icon:'...' où ... peut être 1 ou 2 unités de code (emoji BMP ou surrogate pair)
rRe(
  /icon:'([\s\S]{1,3}?)'/gu,   // consomme la ' fermante (pas de lookahead)
  (match, raw) => {
    const norm = raw.replace(/\uFE0F/g, '');
    const name = ICON_MAP[norm];
    return name ? `icon:ic('${name}')` : match;
  },
  "icon:'EMOJI' → icon:ic('name')"
);

// ═══════════════════════════════════════════════════════════════════════════════
// 21. JS — Insights — anomaly-none (icône check statique)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS anomaly-none ──');
rStr(">✓ Tout se passe normalement aujourd'hui !<",
     '>' + svgi('check', 15) + " Tout se passe normalement aujourd'hui !<");

// ═══════════════════════════════════════════════════════════════════════════════
// 22. CSS — ajuster les tailles svg pour les contextes spéciaux
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── CSS — ajustements SVG ──');
// Remplacer font-size des empty-icon par 0 (les SVG prennent le relais)
rStr(
  '.empty-state .empty-icon { font-size: 2.2rem; margin-bottom: 10px; opacity: 0.5; }',
  '.empty-state .empty-icon { font-size: 0; margin-bottom: 10px; opacity: 0.4; }\n    .empty-state .empty-icon svg { width: 36px; height: 36px; }'
);
rStr(
  '.no-data-msg .no-data-icon { font-size: 1.6rem; margin-bottom: 8px; opacity: 0.5; }',
  '.no-data-msg .no-data-icon { font-size: 0; margin-bottom: 8px; opacity: 0.4; }\n    .no-data-msg .no-data-icon svg { width: 28px; height: 28px; }'
);
// Ajout règles pour les SVG dans history-icon, anomaly-none, insight-icon
const CSS_EXTRA = `
    /* ── SVG Lucide — ajustements globaux ─────────────────────────────── */
    .history-icon svg { width: 16px; height: 16px; }
    .anomaly-none svg { width: 15px; height: 15px; vertical-align: middle; margin-right: 6px; }
    .insight-icon svg { width: 18px; height: 18px; }
    .tab-icon svg { display: block; margin: 0 auto 2px; }
    .onboard-logo svg { opacity: 0.9; }`;
rStr('  </style>', CSS_EXTRA + '\n  </style>');

// ═══════════════════════════════════════════════════════════════════════════════
// Écriture du fichier
// ═══════════════════════════════════════════════════════════════════════════════
fs.writeFileSync(FILE, html, 'utf8');

console.log('\n' + '═'.repeat(60));
console.log(`✅  ${ok} remplacement(s) OK`);
if (ko > 0) console.log(`⚠️  ${ko} chaîne(s) non trouvée(s)`);
console.log('Fichier sauvegardé :', FILE);

// ── Vérification résiduelle ──────────────────────────────────────────────────
const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1FA00}-\u{1FA9F}\u{1F100}-\u{1F1FF}]/gu;
const remaining = new Set();
let m;
while ((m = EMOJI_RE.exec(html)) !== null) remaining.add(m[0]);
if (remaining.size) {
  console.log(`\nEmojis résiduels (${remaining.size}) :`, [...remaining].join(' '));
} else {
  console.log('\n🎉 Aucun emoji résiduel détecté !');
}
