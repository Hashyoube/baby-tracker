/**
 * replace-icons.js — Remplace les emojis-icônes par des SVG Lucide outline
 * Usage : node replace-icons.js
 */
const fs = require('fs');
const FILE = 'C:/Users/Hub/Documents/baby-tracker/index.html';
let html = fs.readFileSync(FILE, 'utf8');
let ok = 0, ko = 0;

function r(old, neu) {
  if (!html.includes(old)) {
    console.warn('  ✗ NOT FOUND:', JSON.stringify(old.substring(0, 80)));
    ko++;
  } else {
    html = html.split(old).join(neu);
    console.log('  ✓', old.replace(/\n/g, '↵').substring(0, 58));
    ok++;
  }
}

// ── SVG statique embarqué directement dans la source HTML ────────────────────
const P = {
  bottle:  '<path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.788a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.472 6.472 0 0 0 5 0"/>',
  moon:    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  shield:  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  scale:   '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  chart:   '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  ruler:   '<path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  sparkles:'<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  check:   '<polyline points="20 6 9 17 4 12"/>',
  play:    '<polygon points="5 3 19 12 5 21 5 3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload:  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
};
const ATTR = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0"';
function s(name, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${ATTR}>${P[name]}</svg>`;
}
// Appel ic() littéral (sera évalué dans le JS du navigateur)
function ic(name, size) { return "${ic('" + name + "'," + size + ")}"; }

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Drapeaux pays (vaccins) ──');
r('🇫🇷 France', 'France');
r('🇹🇭 Thaïlande', 'Thaïlande');

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── Boutons statiques ──');
r('onclick="exportData()">↓ Télécharger mes données</button>',
  'onclick="exportData()">' + s('download',15) + ' Télécharger mes données</button>');
r("onclick=\"document.getElementById('importFileInput').click()\">↑ Charger une sauvegarde</button>",
  "onclick=\"document.getElementById('importFileInput').click())\">" + s('upload',15) + ' Charger une sauvegarde</button>');
r('onclick="startSleepNow()">▶ Commencer maintenant</button>',
  'onclick="startSleepNow()">' + s('play',15) + ' Commencer maintenant</button>');
r('onclick="renderInsights()">↻ Actualiser</button>',
  'onclick="renderInsights()">' + s('refresh',13) + ' Actualiser</button>');

// Boutons ✓ → check SVG
r('onclick="saveTetee()">✓ Enregistrer la tétée</button>',
  'onclick="saveTetee()">' + s('check',15) + ' Enregistrer la tétée</button>');
r('onclick="saveSleepManual()">✓ Enregistrer</button>',
  'onclick="saveSleepManual()">' + s('check',15) + ' Enregistrer</button>');
r('onclick="saveDiaper()">✓ Enregistrer la couche</button>',
  'onclick="saveDiaper()">' + s('check',15) + ' Enregistrer la couche</button>');
r('onclick="saveWeight()">✓ Enregistrer le poids</button>',
  'onclick="saveWeight()">' + s('check',15) + ' Enregistrer le poids</button>');
r('onclick="saveHeight()">✓ Enregistrer la taille</button>',
  'onclick="saveHeight()">' + s('check',15) + ' Enregistrer la taille</button>');
r('onclick="addRDV()">✓ Ajouter le rendez-vous</button>',
  'onclick="addRDV()">' + s('check',15) + ' Ajouter le rendez-vous</button>');
r('onclick="savePerimetre()">✓ Enregistrer la mesure</button>',
  'onclick="savePerimetre()">' + s('check',15) + ' Enregistrer la mesure</button>');

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderTetees ──');
// empty state : string → concaténation avec ic()
r(
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">🍼</div>Aucune tétée dans les dernières 24h</div>'; return;",
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('bottle',36)+'</div>Aucune tétée dans les dernières 24h</div>'; return;"
);
// labels
r(
  "const labels={sein_gauche:'♀ Sein gauche',sein_droit:'♀ Sein droit',biberon:'🍼 Biberon'};",
  "const labels={sein_gauche:'Sein gauche',sein_droit:'Sein droit',biberon:'Biberon'};"
);
// history icon dans template literal
r(
  "<div class=\"history-icon hi-primary\">${e.type==='biberon'?'🍼':'🤱'}</div>",
  "<div class=\"history-icon hi-primary\">${e.type==='biberon'?ic('bottle',16):ic('heart',16)}</div>"
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderSommeil ──');
r(
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">😴</div>Aucun sommeil enregistré</div>'; return;",
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('moon',36)+'</div>Aucun sommeil enregistré</div>'; return;"
);
r(
  '<div class="history-icon hi-secondary">😴</div>',
  '<div class="history-icon hi-secondary">' + ic('moon',16) + '</div>'
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderCouches ──');
r('<div class="stat-lbl">💧 Pipi</div></div>',   '<div class="stat-lbl">' + ic('droplet',10) + ' Pipi</div></div>');
r('<div class="stat-lbl">💩 Caca</div></div>',   '<div class="stat-lbl">' + ic('alertcircle',10) + ' Caca</div></div>');
r('<div class="stat-lbl">🔥 Mixte</div></div>',  '<div class="stat-lbl">' + ic('layers',10) + ' Mixte</div></div>');
r(
  "const icons={pipi:'💧',caca:'💩',mixte:'🔥'}, lbls=",
  "const icons={pipi:ic('droplet',16),caca:ic('alertcircle',16),mixte:ic('layers',16)}, lbls="
);
// empty state (apostrophe échappée dans string JS du fichier HTML)
r(
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">🧷</div>Aucune couche aujourd\\'hui</div>'; return; }",
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('shield',36)+\"</div>Aucune couche aujourd'hui</div>'; return; }"
);
// history icon
r(
  "<div class=\"history-icon hi-green\">${icons[e.type]||'🧷'}</div>",
  "<div class=\"history-icon hi-green\">${icons[e.type]||ic('shield',16)}</div>"
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderPoids ──');
r(
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">⚖️</div>Aucune pesée enregistrée</div>'; }",
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('scale',36)+'</div>Aucune pesée enregistrée</div>'; }"
);
r(
  '<div class="history-icon hi-purple">⚖️</div>',
  '<div class="history-icon hi-purple">' + ic('scale',16) + '</div>'
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderHeightHistory ──');
r(
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">📏</div>Aucune taille enregistrée</div>';",
  "c.innerHTML='<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('ruler',36)+'</div>Aucune taille enregistrée</div>';"
);
r(
  '<div class="history-icon hi-purple">📏</div>',
  '<div class="history-icon hi-purple">' + ic('ruler',16) + '</div>'
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderPerimetre ──');
r(
  "c.innerHTML = '<div class=\"empty-state\"><div class=\"empty-icon\">📐</div>Aucune mesure enregistrée</div>';",
  "c.innerHTML = '<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('ruler',36)+'</div>Aucune mesure enregistrée</div>';"
);
r(
  '<div class="history-icon" style="background:rgba(45,212,191,0.12);">📐</div>',
  '<div class="history-icon" style="background:rgba(45,212,191,0.12);">' + ic('ruler',16) + '</div>'
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — renderRDV ──');
r(
  'container.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div>Aucun rendez-vous enregistré</div>`;',
  "container.innerHTML = '<div class=\"empty-state\"><div class=\"empty-icon\">'+ic('calendar',36)+'</div>Aucun rendez-vous enregistré</div>';"
);
r(
  "const typeEmoji = { pédiatre:'👶', généraliste:'🩺', spécialiste:'⚕️', urgences:'🚨' };",
  "const typeEmoji = { pédiatre:ic('user'), généraliste:ic('stethoscope'), spécialiste:ic('plus'), urgences:ic('alert') };"
);
r(
  "${typeEmoji[r.type]||'📋'} ${r.type.charAt(0).toUpperCase()+r.type.slice(1)}",
  "${typeEmoji[r.type]||ic('calendar')} ${r.type.charAt(0).toUpperCase()+r.type.slice(1)}"
);
r(
  'r.medecin ? `<div class="rdv-sub">👤 ${r.medecin}${r.lieu?\' · 📍 \'+r.lieu:\'\'}</div>` : r.lieu ? `<div class="rdv-sub">📍 ${r.lieu}</div>`',
  'r.medecin ? `<div class="rdv-sub">${ic(\'user\',13)} ${r.medecin}${r.lieu?\' · \'+ic(\'mappin\',13)+\' \'+r.lieu:\'\'}</div>` : r.lieu ? `<div class="rdv-sub">${ic(\'mappin\',13)} ${r.lieu}</div>`'
);
r(
  'r.notes   ? `<div class="rdv-notes">📝 ${r.notes}</div>`',
  'r.notes   ? `<div class="rdv-notes">${ic(\'filetext\',13)} ${r.notes}</div>`'
);
r(
  'html += `<div class="rdv-upcoming-label">📌 Prochains rendez-vous (${upcoming.length})</div>`;',
  'html += `<div class="rdv-upcoming-label">${ic(\'pin\',13)} Prochains rendez-vous (${upcoming.length})</div>`;'
);

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — Insights — pills résumé ──');
r('<div class="sp-lbl">🍼 Tétées</div>',  '<div class="sp-lbl">' + ic('bottle',11) + ' Tétées</div>');
r('<div class="sp-lbl">😴 Sommeil</div>', '<div class="sp-lbl">' + ic('moon',11) + ' Sommeil</div>');
r('<div class="sp-lbl">🧷 Couches</div>', '<div class="sp-lbl">' + ic('shield',11) + ' Couches</div>');

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — Insights — no-data ──');
r('<div class="no-data-icon">📊</div>', '<div class="no-data-icon">' + ic('chart',28) + '</div>');
r('<div class="no-data-icon">🔮</div>', '<div class="no-data-icon">' + ic('sparkles',28) + '</div>');

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — Insights — propriétés icon ──');
// Rythmes (indent 6 espaces)
r("icon:'⏱', cls:'ii-amber',\n      label:'Intervalle",   "icon:ic('timer'), cls:'ii-amber',\n      label:'Intervalle");
r("icon:'🍼', cls:'ii-blue',\n      label:'Durée",         "icon:ic('bottle'), cls:'ii-blue',\n      label:'Durée");
r("icon:'📅', cls:'ii-purple',",                            "icon:ic('calendar'), cls:'ii-purple',");
r("icon:'😴', cls:'ii-blue',\n      label:'Durée moyenne d\\'une sieste",
  "icon:ic('moon'), cls:'ii-blue',\n      label:'Durée moyenne d\\'une sieste");
r("icon:'💤', cls:'ii-purple',\n      label:`${babyName} s'endort",
  "icon:ic('bed'), cls:'ii-purple',\n      label:`${babyName} s'endort");
r("icon:'🧷', cls:'ii-green',\n      label:'Couches par jour",
  "icon:ic('shield'), cls:'ii-green',\n      label:'Couches par jour");
r("icon:'🕐', cls:'ii-amber',", "icon:ic('clock'), cls:'ii-amber',");

// Prédictions
r("icon:'🍼', cls:'ii-amber',\n        label:'Prochaine tétée probable",
  "icon:ic('bottle'), cls:'ii-amber',\n        label:'Prochaine tétée probable");
r("icon:'🍼', cls:'ii-blue',\n        label:'Prochaine tétée probable",
  "icon:ic('bottle'), cls:'ii-blue',\n        label:'Prochaine tétée probable");
r("icon:'⏱', cls:'ii-purple',\n      label:'Durée probable",
  "icon:ic('timer'), cls:'ii-purple',\n      label:'Durée probable");
r("icon:'💤', cls:'ii-blue',\n      label:`${babyName} devrait",
  "icon:ic('bed'), cls:'ii-blue',\n      label:`${babyName} devrait");
r("icon:'😴', cls:'ii-blue',\n      label:'Durée probable de la sieste",
  "icon:ic('moon'), cls:'ii-blue',\n      label:'Durée probable de la sieste");

// Anomalies
r("icon:'⚠️', cls:'ii-red',\n      label:'Moins de tétées",  "icon:ic('alert'), cls:'ii-red',\n      label:'Moins de tétées");
r("icon:'📈', cls:'ii-green',\n      label:'Plus de tétées",   "icon:ic('trending'), cls:'ii-green',\n      label:'Plus de tétées");
r("icon:'😟', cls:'ii-red',\n      label:'Moins de sommeil",   "icon:ic('alertcircle'), cls:'ii-red',\n      label:'Moins de sommeil");
r("icon:'🧷', cls:'ii-red',\n      label:'Peu de couches",     "icon:ic('shield'), cls:'ii-red',\n      label:'Peu de couches");
r("icon:'⏰', cls:'ii-red',",                                   "icon:ic('alarmclock'), cls:'ii-red',");

// Résumé du jour (indent 4 espaces)
r("icon:'🍼', cls:'ii-pink',",  "icon:ic('bottle'), cls:'ii-pink',");
r("icon:'😴', cls:'ii-blue',\n    label:'Sommeil aujourd\\'hui",
  "icon:ic('moon'), cls:'ii-blue',\n    label:'Sommeil aujourd\\'hui");
r("icon:'🧷', cls:'ii-green',\n    label:'Couches aujourd\\'hui",
  "icon:ic('shield'), cls:'ii-green',\n    label:'Couches aujourd\\'hui");
r("icon:'⏱', cls:'ii-amber',\n    label:'Dernière tétée",
  "icon:ic('timer'), cls:'ii-amber',\n    label:'Dernière tétée");

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n── JS — anomaly-none ──');
r(
  "<div class=\"anomaly-none\">✓ Tout se passe normalement aujourd'hui !</div>",
  '<div class="anomaly-none">' + s('check',15) + " Tout se passe normalement aujourd'hui !</div>"
);

// ═══════════════════════════════════════════════════════════════════════════════
// Écriture
// ═══════════════════════════════════════════════════════════════════════════════
fs.writeFileSync(FILE, html, 'utf8');
console.log('\n' + '═'.repeat(60));
console.log('✅  ' + ok + ' remplacement(s) OK');
if (ko > 0) console.log('⚠️  ' + ko + ' chaîne(s) non trouvée(s)');
console.log('Fichier sauvegardé : ' + FILE);
