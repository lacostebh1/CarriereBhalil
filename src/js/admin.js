// ============================================
// Gestion Administrative — SOCIETE H.H ISTITMAR
// Système de gestion : RH, paie, clients,
// fournisseurs, facturation, comptabilité (CGNC)
// Données persistées dans localStorage.
// ============================================

const STORAGE_KEY = 'hh-admin-v1';

const COMPANY = {
    nom: 'SOCIETE H.H ISTITMAR',
    activite: 'Exploitation de carrière — Calcaire dolomitique',
    adresse: "AV Hassan 2, Hay M'sila, Bhalil, Sefrou, Maroc",
    rc: '2227 Sefrou',
    ice: '001987690000045',
    if: '—',
    patente: '—',
    cnss: '—',
    capital: '1 000 000 DHS',
    tel: '+212 661 350 968'
};

const PRODUCTS = ['GNT 0/31.5', 'GNT 0/20', 'Gravier 3/8', 'Gravier 8/16', 'Gravier 16/31.5', 'Sable concassé 0/4', 'Tout-venant'];
const EXPENSE_CATEGORIES = ['Carburant', 'Maintenance', 'Pièces de rechange', 'Explosifs & minage', 'Électricité', 'Transport', 'Loyers & redevances', 'Assurances', 'Fournitures', 'Autre'];
const TVA_RATE = 0.20;

// ---------- Barème social & fiscal marocain (indicatif, LF 2025) ----------
const CNSS_SALARIE = 0.0448;      // part salariale, plafond 6 000 MAD
const CNSS_PLAFOND = 6000;
const AMO_SALARIE = 0.0226;       // sans plafond
const FRAIS_PRO_CAP = 2916.67;    // 35 000 MAD / an

// Charges patronales (indicatif)
const PATRONAL = {
    allocFamiliales: 0.0640,      // sans plafond
    prestationsSociales: 0.0898,  // plafond 6 000 MAD
    tfp: 0.016,                   // taxe formation professionnelle
    amo: 0.0411
};

// Barème IR mensuel (LF 2025)
const IR_BRACKETS = [
    { max: 3333.33, rate: 0, deduct: 0 },
    { max: 5000.00, rate: 0.10, deduct: 333.33 },
    { max: 6666.67, rate: 0.20, deduct: 833.33 },
    { max: 8333.33, rate: 0.30, deduct: 1500.00 },
    { max: 15000.00, rate: 0.34, deduct: 1833.33 },
    { max: Infinity, rate: 0.37, deduct: 2283.33 }
];

// ============================================
// Store
// ============================================

let db = load();

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* données corrompues → re-seed */ }
    const seeded = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seed() {
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    return {
        employees: [
            { id: 'e1', matricule: '0001', nom: 'Ahmed El Amrani', cin: 'D123456', cnss: '110234567', poste: 'Chef de Carrière', contrat: 'CDI', dateEmbauche: `${y - 4}-03-01`, finContrat: '', salaire: 12000, statut: 'actif' },
            { id: 'e2', matricule: '0002', nom: 'Youssef Bennani', cin: 'CB98765', cnss: '110345678', poste: "Conducteur d'engins", contrat: 'CDI', dateEmbauche: `${y - 3}-06-15`, finContrat: '', salaire: 6500, statut: 'actif' },
            { id: 'e3', matricule: '0003', nom: 'Karim Tazi', cin: 'D567890', cnss: '110456789', poste: 'Agent de sécurité', contrat: 'ANAPEC', dateEmbauche: `${y - 1}-02-01`, finContrat: `${y}-08-05`, salaire: 3500, statut: 'actif' },
            { id: 'e4', matricule: '0004', nom: 'Hassan Idrissi', cin: 'DA11223', cnss: '110567890', poste: 'Opérateur concasseur', contrat: 'CDD', dateEmbauche: `${y - 1}-09-01`, finContrat: `${y}-08-31`, salaire: 5200, statut: 'actif' },
            { id: 'e5', matricule: '0005', nom: 'Mohamed Alaoui', cin: 'D998877', cnss: '110678901', poste: 'Chauffeur camion', contrat: 'CDI', dateEmbauche: `${y - 2}-01-10`, finContrat: '', salaire: 4800, statut: 'actif' },
            { id: 'e6', matricule: '0006', nom: 'Rachid Berrada', cin: 'CD44556', cnss: '110789012', poste: 'Responsable administratif', contrat: 'CDI', dateEmbauche: `${y - 3}-11-02`, finContrat: '', salaire: 9000, statut: 'actif' }
        ],
        clients: [
            { id: 'c1', nom: 'Transport Alaoui SARL', ice: '001122334455667', contact: 'M. Alaoui', tel: '+212 662 111 222', email: 'contact@transportalaoui.ma', adresse: 'Fès' },
            { id: 'c2', nom: 'BTP Atlas Construction', ice: '002233445566778', contact: 'M. Fassi', tel: '+212 663 222 333', email: 'achats@btpatlas.ma', adresse: 'Sefrou' },
            { id: 'c3', nom: 'Route & Génie Maroc', ice: '003344556677889', contact: 'Mme Skalli', tel: '+212 664 333 444', email: 'rgm@rgmaroc.ma', adresse: 'Imouzzer' }
        ],
        suppliers: [
            { id: 's1', nom: 'Afriquia Gaz & Carburants', ice: '004455667788990', categorie: 'Carburant', contact: 'Agence Sefrou', tel: '+212 535 660 000', email: 'pro@afriquia.ma' },
            { id: 's2', nom: 'Atlas Pièces Industrielles', ice: '005566778899001', categorie: 'Pièces de rechange', contact: 'M. Benjelloun', tel: '+212 535 741 852', email: 'ventes@atlaspieces.ma' },
            { id: 's3', nom: 'Maroc Explosifs SA', ice: '006677889900112', categorie: 'Explosifs & minage', contact: 'Service commercial', tel: '+212 522 963 852', email: 'commandes@marocexplosifs.ma' }
        ],
        invoices: [
            { id: 'f1', num: `FA-${y}-001`, clientId: 'c1', date: `${y}-${m}-03`, produit: 'GNT 0/31.5', quantite: 120, pu: 85, statut: 'payee', montantRegle: 12240 },
            { id: 'f2', num: `FA-${y}-002`, clientId: 'c2', date: `${y}-${m}-08`, produit: 'Gravier 8/16', quantite: 80, pu: 110, statut: 'impayee', montantRegle: 0 },
            { id: 'f3', num: `FA-${y}-003`, clientId: 'c3', date: `${y}-${m}-12`, produit: 'Sable concassé 0/4', quantite: 60, pu: 120, statut: 'partielle', montantRegle: 4000 }
        ],
        expenses: [
            { id: 'd1', date: `${y}-${m}-02`, categorie: 'Carburant', description: 'Gasoil engins — semaine 1', supplierId: 's1', montant: 8500, statut: 'payee' },
            { id: 'd2', date: `${y}-${m}-06`, categorie: 'Pièces de rechange', description: 'Mâchoires concasseur', supplierId: 's2', montant: 12400, statut: 'a_payer' },
            { id: 'd3', date: `${y}-${m}-10`, categorie: 'Explosifs & minage', description: 'Campagne de minage mensuelle', supplierId: 's3', montant: 15000, statut: 'payee' }
        ],
        leaves: [
            { id: 'l1', empId: 'e2', type: 'Congé annuel', du: `${y}-${m}-15`, au: `${y}-${m}-20`, statut: 'approuve' },
            { id: 'l2', empId: 'e5', type: 'Maladie', du: `${y}-${m}-04`, au: `${y}-${m}-05`, statut: 'approuve' }
        ],
        contracts: [
            { id: 'ct1', type: 'Client', partie: 'BTP Atlas Construction', objet: `Fourniture annuelle GNT — marché Sefrou`, debut: `${y}-01-01`, fin: `${y}-12-31`, montant: 480000, statut: 'actif' },
            { id: 'ct2', type: 'Fournisseur', partie: 'Maroc Explosifs SA', objet: 'Approvisionnement explosifs & tirs', debut: `${y}-01-01`, fin: `${y}-06-30`, montant: 90000, statut: 'actif' }
        ],
        payroll: {},        // { 'YYYY-MM': { empId: 'paye' } }
        declarations: {},   // { 'YYYY-MM': { cnss: bool, ir: bool, tva: bool } }
        journal: []         // écritures manuelles complémentaires
    };
}

// ============================================
// Helpers
// ============================================

const $ = (sel) => document.querySelector(sel);

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtMAD(n) {
    return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
}

function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return isNaN(d) ? '—' : d.toLocaleDateString('fr-FR');
}

function monthKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
    const [y, m] = key.split('-');
    const names = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${names[Number(m) - 1]} ${y}`;
}

function lastMonths(n, from = new Date()) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
        out.push(monthKey(new Date(from.getFullYear(), from.getMonth() - i, 1)));
    }
    return out;
}

function daysUntil(iso) {
    if (!iso) return Infinity;
    return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

function leaveDays(l) {
    const d = Math.round((new Date(l.au) - new Date(l.du)) / 86400000) + 1;
    return Math.max(1, d);
}

function invoiceHT(f) { return (Number(f.quantite) || 0) * (Number(f.pu) || 0); }
function invoiceTVA(f) { return invoiceHT(f) * TVA_RATE; }
function invoiceTTC(f) { return invoiceHT(f) + invoiceTVA(f); }
function invoiceReste(f) { return f.statut === 'payee' ? 0 : Math.max(0, invoiceTTC(f) - (Number(f.montantRegle) || 0)); }

function clientName(id) { return db.clients.find(c => c.id === id)?.nom || '—'; }
function supplierName(id) { return db.suppliers.find(s => s.id === id)?.nom || '—'; }
function employee(id) { return db.employees.find(e => e.id === id); }

// ---------- Paie (barème marocain) ----------

function calcPay(brut) {
    brut = Number(brut) || 0;
    const cnss = Math.min(brut, CNSS_PLAFOND) * CNSS_SALARIE;
    const amo = brut * AMO_SALARIE;
    const fraisPro = Math.min(brut * (brut <= 6500 ? 0.35 : 0.25), FRAIS_PRO_CAP);
    const imposable = Math.max(0, brut - fraisPro - cnss - amo);
    const bracket = IR_BRACKETS.find(b => imposable <= b.max);
    const ir = Math.max(0, imposable * bracket.rate - bracket.deduct);
    const net = brut - cnss - amo - ir;
    const patronal = brut * PATRONAL.allocFamiliales
        + Math.min(brut, CNSS_PLAFOND) * PATRONAL.prestationsSociales
        + brut * PATRONAL.tfp
        + brut * PATRONAL.amo;
    return { brut, cnss, amo, imposable, ir, net, patronal, coutTotal: brut + patronal };
}

function activeEmployees() {
    return db.employees.filter(e => e.statut === 'actif');
}

function payrollTotals(month) {
    const totals = { brut: 0, cnss: 0, amo: 0, ir: 0, net: 0, patronal: 0 };
    activeEmployees().forEach(e => {
        const p = calcPay(e.salaire);
        totals.brut += p.brut; totals.cnss += p.cnss; totals.amo += p.amo;
        totals.ir += p.ir; totals.net += p.net; totals.patronal += p.patronal;
    });
    return totals;
}

// ---------- Congés (droit marocain : 1,5 j / mois) ----------

function leaveBalance(emp) {
    const start = new Date(emp.dateEmbauche);
    const now = new Date();
    const months = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth());
    const acquired = Math.min(months, 12 * (now.getFullYear() - start.getFullYear()) + 12) * 1.5;
    const currentYear = now.getFullYear();
    const taken = db.leaves
        .filter(l => l.empId === emp.id && l.statut === 'approuve' && l.type === 'Congé annuel' && l.du.startsWith(String(currentYear)))
        .reduce((s, l) => s + leaveDays(l), 0);
    return { acquired: Math.round(Math.min(acquired, 18) * 10) / 10, taken };
}

// ---------- CSV export ----------

function exportCSV(filename, headers, rows) {
    const body = [headers, ...rows]
        .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
        .join('\n');
    const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ============================================
// Modal
// ============================================

function openModal(title, formHTML, onSubmit, submitLabel = 'Enregistrer') {
    const modal = $('#modal');
    $('#modal-title').textContent = title;
    const form = $('#modal-form');
    form.innerHTML = formHTML + `
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn-primary">${esc(submitLabel)}</button>
      </div>`;
    modal.hidden = false;
    form.onsubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        onSubmit(data);
        closeModal();
    };
    form.querySelector('[data-close]').onclick = closeModal;
    form.querySelector('input, select, textarea')?.focus();
}

function closeModal() {
    $('#modal').hidden = true;
    $('#modal-form').innerHTML = '';
}

function field(label, name, opts = {}) {
    const { type = 'text', value = '', required = true, step, placeholder = '', options, half } = opts;
    let input;
    if (options) {
        input = `<select class="form-input" name="${name}" ${required ? 'required' : ''}>
            ${options.map(o => {
            const [val, lab] = Array.isArray(o) ? o : [o, o];
            return `<option value="${esc(val)}" ${String(val) === String(value) ? 'selected' : ''}>${esc(lab)}</option>`;
        }).join('')}
        </select>`;
    } else if (type === 'textarea') {
        input = `<textarea class="form-input" name="${name}" ${required ? 'required' : ''} placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
    } else {
        input = `<input class="form-input" type="${type}" name="${name}" value="${esc(value)}" ${required ? 'required' : ''} ${step ? `step="${step}"` : ''} placeholder="${esc(placeholder)}">`;
    }
    return `<div class="form-group ${half ? 'half' : ''}">
        <label class="form-label">${esc(label)}</label>${input}
    </div>`;
}

// ============================================
// Impression (bulletins, factures)
// ============================================

function printHTML(html) {
    $('#print-area').innerHTML = html;
    window.print();
}

function companyHeaderHTML() {
    return `
      <div class="p-head">
        <div>
          <div class="p-brand">HH</div>
        </div>
        <div class="p-co">
          <strong>${COMPANY.nom}</strong><br>
          ${COMPANY.activite}<br>
          ${COMPANY.adresse}<br>
          RC : ${COMPANY.rc} — ICE : ${COMPANY.ice} — Capital : ${COMPANY.capital}
        </div>
      </div>`;
}

function printBulletin(empId, month) {
    const e = employee(empId);
    if (!e) return;
    const p = calcPay(e.salaire);
    printHTML(`
      ${companyHeaderHTML()}
      <h2 class="p-title">Bulletin de paie — ${monthLabel(month)}</h2>
      <table class="p-table p-info">
        <tr><td><strong>Salarié :</strong> ${esc(e.nom)}</td><td><strong>Matricule :</strong> ${esc(e.matricule)}</td></tr>
        <tr><td><strong>CIN :</strong> ${esc(e.cin)}</td><td><strong>N° CNSS :</strong> ${esc(e.cnss)}</td></tr>
        <tr><td><strong>Poste :</strong> ${esc(e.poste)}</td><td><strong>Contrat :</strong> ${esc(e.contrat)} — embauché le ${fmtDate(e.dateEmbauche)}</td></tr>
      </table>
      <table class="p-table">
        <thead><tr><th>Rubrique</th><th>Base</th><th>Taux</th><th>Retenue</th><th>Montant</th></tr></thead>
        <tbody>
          <tr><td>Salaire de base</td><td>${fmtMAD(p.brut)}</td><td>—</td><td>—</td><td>${fmtMAD(p.brut)}</td></tr>
          <tr><td>CNSS (part salariale)</td><td>${fmtMAD(Math.min(p.brut, CNSS_PLAFOND))}</td><td>4,48 %</td><td>${fmtMAD(p.cnss)}</td><td>—</td></tr>
          <tr><td>AMO (part salariale)</td><td>${fmtMAD(p.brut)}</td><td>2,26 %</td><td>${fmtMAD(p.amo)}</td><td>—</td></tr>
          <tr><td>Impôt sur le revenu (IR)</td><td>${fmtMAD(p.imposable)}</td><td>Barème</td><td>${fmtMAD(p.ir)}</td><td>—</td></tr>
        </tbody>
        <tfoot>
          <tr><th colspan="4">Net à payer</th><th>${fmtMAD(p.net)}</th></tr>
        </tfoot>
      </table>
      <p class="p-note">Calcul indicatif selon barème IR (LF 2025), CNSS 4,48 % (plafond 6 000 MAD), AMO 2,26 %.</p>
      <div class="p-sign">
        <div>Signature de l'employeur</div>
        <div>Signature du salarié</div>
      </div>`);
}

function printInvoice(id) {
    const f = db.invoices.find(x => x.id === id);
    if (!f) return;
    const c = db.clients.find(x => x.id === f.clientId);
    printHTML(`
      ${companyHeaderHTML()}
      <h2 class="p-title">Facture N° ${esc(f.num)}</h2>
      <table class="p-table p-info">
        <tr><td><strong>Date :</strong> ${fmtDate(f.date)}</td><td><strong>Client :</strong> ${esc(c?.nom || '—')}</td></tr>
        <tr><td><strong>ICE client :</strong> ${esc(c?.ice || '—')}</td><td><strong>Adresse :</strong> ${esc(c?.adresse || '—')}</td></tr>
      </table>
      <table class="p-table">
        <thead><tr><th>Désignation</th><th>Quantité (T)</th><th>P.U. HT</th><th>Montant HT</th></tr></thead>
        <tbody>
          <tr><td>${esc(f.produit)}</td><td>${esc(f.quantite)}</td><td>${fmtMAD(f.pu)}</td><td>${fmtMAD(invoiceHT(f))}</td></tr>
        </tbody>
        <tfoot>
          <tr><td colspan="3">Total HT</td><td>${fmtMAD(invoiceHT(f))}</td></tr>
          <tr><td colspan="3">TVA 20 %</td><td>${fmtMAD(invoiceTVA(f))}</td></tr>
          <tr><th colspan="3">Total TTC</th><th>${fmtMAD(invoiceTTC(f))}</th></tr>
        </tfoot>
      </table>
      <p class="p-note">Arrêtée la présente facture à la somme de : <strong>${fmtMAD(invoiceTTC(f))}</strong> toutes taxes comprises.</p>
      <div class="p-sign"><div>Cachet & signature</div><div></div></div>`);
}

// ============================================
// Vues
// ============================================

const VIEW_TITLES = {
    dashboard: 'Tableau de bord',
    employees: 'Salariés',
    payroll: 'Paie',
    leaves: 'Congés & Absences',
    declarations: 'Déclarations sociales & fiscales',
    clients: 'Clients',
    invoices: 'Facturation',
    suppliers: 'Fournisseurs',
    expenses: 'Dépenses',
    contracts: 'Contrats',
    accounting: 'Comptabilité — Journal & TVA'
};

const state = {
    view: 'dashboard',
    payrollMonth: monthKey(),
    accountingMonth: monthKey(),
    search: ''
};

function render() {
    const view = state.view;
    document.querySelectorAll('.nav-item[data-view]').forEach(a => {
        a.classList.toggle('active', a.dataset.view === view);
    });
    $('#view-title').textContent = VIEW_TITLES[view] || '';
    const renderer = {
        dashboard: renderDashboard,
        employees: renderEmployees,
        payroll: renderPayroll,
        leaves: renderLeaves,
        declarations: renderDeclarations,
        clients: renderClients,
        invoices: renderInvoices,
        suppliers: renderSuppliers,
        expenses: renderExpenses,
        contracts: renderContracts,
        accounting: renderAccounting
    }[view] || renderDashboard;
    $('#view').innerHTML = renderer();
}

// ---------- Tableau de bord ----------

function renderDashboard() {
    const month = monthKey();
    const totals = payrollTotals(month);
    const caMois = db.invoices.filter(f => f.date.startsWith(month)).reduce((s, f) => s + invoiceTTC(f), 0);
    const impayes = db.invoices.reduce((s, f) => s + invoiceReste(f), 0);
    const depensesMois = db.expenses.filter(d => d.date.startsWith(month)).reduce((s, d) => s + Number(d.montant), 0);

    // Alertes
    const alerts = [];
    db.employees.filter(e => e.statut === 'actif' && e.finContrat).forEach(e => {
        const d = daysUntil(e.finContrat);
        if (d < 0) alerts.push({ icon: '🔴', text: `Contrat ${e.contrat} de <strong>${esc(e.nom)}</strong> expiré le ${fmtDate(e.finContrat)}` });
        else if (d <= 30) alerts.push({ icon: '⚠️', text: `Contrat ${e.contrat} de <strong>${esc(e.nom)}</strong> expire dans ${d} j (${fmtDate(e.finContrat)})` });
    });
    db.contracts.filter(c => c.statut === 'actif').forEach(c => {
        const d = daysUntil(c.fin);
        if (d >= 0 && d <= 30) alerts.push({ icon: '⚠️', text: `Contrat ${c.type.toLowerCase()} « ${esc(c.objet)} » expire dans ${d} j` });
    });
    const prevMonth = lastMonths(2)[0];
    const decl = db.declarations[prevMonth] || {};
    if (!decl.cnss) alerts.push({ icon: '📑', text: `Déclaration <strong>CNSS ${monthLabel(prevMonth)}</strong> à télédéclarer (DAMANCOM, avant le 10)` });
    if (!decl.tva) alerts.push({ icon: '📑', text: `Déclaration <strong>TVA ${monthLabel(prevMonth)}</strong> à déposer (SIMPL, avant le 20)` });
    db.invoices.filter(f => invoiceReste(f) > 0 && daysUntil(f.date) < -30).forEach(f => {
        alerts.push({ icon: '💰', text: `Facture <strong>${esc(f.num)}</strong> (${esc(clientName(f.clientId))}) en retard de paiement — reste ${fmtMAD(invoiceReste(f))}` });
    });

    // Graphique 6 mois : CA vs sorties
    const months = lastMonths(6);
    const series = months.map(mk => {
        const ca = db.invoices.filter(f => f.date.startsWith(mk)).reduce((s, f) => s + invoiceTTC(f), 0);
        const dep = db.expenses.filter(d => d.date.startsWith(mk)).reduce((s, d) => s + Number(d.montant), 0)
            + (Object.keys(db.payroll[mk] || {}).length ? payrollTotals(mk).net : 0);
        return { mk, ca, dep };
    });
    const maxVal = Math.max(1, ...series.flatMap(s => [s.ca, s.dep]));

    return `
      <div class="stats-grid">
        ${kpi('👥', 'Effectif actif', activeEmployees().length)}
        ${kpi('💵', 'Masse salariale nette / mois', fmtMAD(totals.net))}
        ${kpi('🧾', `CA facturé — ${monthLabel(month)}`, fmtMAD(caMois))}
        ${kpi('⏳', 'Créances clients (impayés)', fmtMAD(impayes))}
        ${kpi('💸', `Dépenses — ${monthLabel(month)}`, fmtMAD(depensesMois))}
        ${kpi('🏦', 'Coût employeur mensuel', fmtMAD(totals.brut + totals.patronal))}
      </div>

      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h3>⚠️ Alertes & échéances</h3></div>
          ${alerts.length ? `<ul class="alert-list">${alerts.map(a => `<li><span>${a.icon}</span><div>${a.text}</div></li>`).join('')}</ul>`
            : `<p class="empty">Aucune alerte. Tout est à jour ✅</p>`}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>📈 Chiffre d'affaires vs Sorties (6 mois)</h3></div>
          <div class="chart">
            ${series.map(s => `
              <div class="chart-col">
                <div class="chart-bars">
                  <div class="bar bar-ca" style="height:${Math.round(s.ca / maxVal * 100)}%" title="CA : ${fmtMAD(s.ca)}"></div>
                  <div class="bar bar-dep" style="height:${Math.round(s.dep / maxVal * 100)}%" title="Sorties : ${fmtMAD(s.dep)}"></div>
                </div>
                <span class="chart-label">${monthLabel(s.mk).slice(0, 4)}</span>
              </div>`).join('')}
          </div>
          <div class="chart-legend">
            <span><i class="dot dot-ca"></i> CA TTC facturé</span>
            <span><i class="dot dot-dep"></i> Dépenses + paie</span>
          </div>
        </div>
      </div>`;
}

function kpi(icon, label, value) {
    return `
      <div class="stat-card">
        <div class="stat-icon">${icon}</div>
        <div class="stat-info"><h3>${esc(label)}</h3><div class="value">${value}</div></div>
      </div>`;
}

// ---------- Salariés ----------

function renderEmployees() {
    const q = state.search.toLowerCase();
    const rows = db.employees
        .filter(e => !q || `${e.nom} ${e.poste} ${e.cin} ${e.matricule}`.toLowerCase().includes(q))
        .map(e => {
            const d = e.finContrat ? daysUntil(e.finContrat) : Infinity;
            const contratBadge = e.finContrat
                ? (d < 0 ? `<span class="status-badge status-error">Expiré</span>`
                    : d <= 30 ? `<span class="status-badge status-warning">Fin ${d} j</span>`
                        : `<span class="status-badge status-success">${esc(e.contrat)}</span>`)
                : `<span class="status-badge status-success">${esc(e.contrat)}</span>`;
            return `<tr>
              <td>${esc(e.matricule)}</td>
              <td><strong>${esc(e.nom)}</strong><br><small>${esc(e.cin)} · CNSS ${esc(e.cnss)}</small></td>
              <td>${esc(e.poste)}</td>
              <td>${contratBadge}</td>
              <td>${fmtDate(e.dateEmbauche)}</td>
              <td>${fmtMAD(e.salaire)}</td>
              <td>${e.statut === 'actif' ? '<span class="status-badge status-success">Actif</span>' : '<span class="status-badge status-error">Sorti</span>'}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Modifier" data-action="edit-employee" data-id="${e.id}">✏️</button>
                <button class="icon-btn" title="Supprimer" data-action="delete-employee" data-id="${e.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar('Rechercher un salarié…', [
        `<button class="btn btn-ghost" data-action="export-employees">⬇ Export CSV</button>`,
        `<button class="btn btn-primary" data-action="add-employee">+ Nouveau salarié</button>`
    ])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Matricule</th><th>Salarié</th><th>Poste</th><th>Contrat</th><th>Embauche</th><th>Salaire brut</th><th>Statut</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(8)}</tbody>
        </table>
      </div>`;
}

function employeeForm(e = {}) {
    return `<div class="form-grid">
      ${field('Nom complet', 'nom', { value: e.nom, half: true })}
      ${field('CIN', 'cin', { value: e.cin, half: true })}
      ${field('N° CNSS', 'cnss', { value: e.cnss, half: true, required: false })}
      ${field('Poste', 'poste', { value: e.poste, half: true })}
      ${field('Type de contrat', 'contrat', { value: e.contrat || 'CDI', options: ['CDI', 'CDD', 'ANAPEC', 'Intérim'], half: true })}
      ${field('Salaire brut (MAD)', 'salaire', { value: e.salaire, type: 'number', step: '0.01', half: true })}
      ${field("Date d'embauche", 'dateEmbauche', { value: e.dateEmbauche, type: 'date', half: true })}
      ${field('Fin de contrat (si CDD)', 'finContrat', { value: e.finContrat, type: 'date', required: false, half: true })}
      ${field('Statut', 'statut', { value: e.statut || 'actif', options: [['actif', 'Actif'], ['sorti', 'Sorti']], half: true })}
    </div>`;
}

// ---------- Paie ----------

function renderPayroll() {
    const month = state.payrollMonth;
    const paid = db.payroll[month] || {};
    const totals = payrollTotals(month);

    const rows = activeEmployees().map(e => {
        const p = calcPay(e.salaire);
        const isPaid = paid[e.id] === 'paye';
        return `<tr>
          <td><strong>${esc(e.nom)}</strong><br><small>${esc(e.poste)}</small></td>
          <td>${fmtMAD(p.brut)}</td>
          <td>${fmtMAD(p.cnss)}</td>
          <td>${fmtMAD(p.amo)}</td>
          <td>${fmtMAD(p.ir)}</td>
          <td><strong>${fmtMAD(p.net)}</strong></td>
          <td>${isPaid ? '<span class="status-badge status-success">Payé</span>' : '<span class="status-badge status-warning">En attente</span>'}</td>
          <td class="row-actions">
            <button class="icon-btn" title="Bulletin de paie" data-action="print-bulletin" data-id="${e.id}">🖨️</button>
            <button class="icon-btn" title="${isPaid ? 'Marquer non payé' : 'Marquer payé'}" data-action="toggle-paid" data-id="${e.id}">${isPaid ? '↩️' : '✅'}</button>
          </td>
        </tr>`;
    }).join('');

    return `
      <div class="toolbar">
        <label class="month-picker">Mois de paie :
          <input type="month" class="form-input" id="payroll-month" value="${month}">
        </label>
        <div class="toolbar-actions">
          <button class="btn btn-ghost" data-action="export-payroll">⬇ Export CSV</button>
          <button class="btn btn-primary" data-action="pay-all">✅ Tout marquer payé</button>
        </div>
      </div>

      <div class="stats-grid">
        ${kpi('💰', 'Total brut', fmtMAD(totals.brut))}
        ${kpi('🏥', 'CNSS + AMO (salarié)', fmtMAD(totals.cnss + totals.amo))}
        ${kpi('🏛️', 'IR à verser (DGI)', fmtMAD(totals.ir))}
        ${kpi('💵', 'Total net à payer', fmtMAD(totals.net))}
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Salarié</th><th>Brut</th><th>CNSS 4,48 %</th><th>AMO 2,26 %</th><th>IR</th><th>Net à payer</th><th>Statut</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(8)}</tbody>
          <tfoot><tr><th>Totaux</th><th>${fmtMAD(totals.brut)}</th><th>${fmtMAD(totals.cnss)}</th><th>${fmtMAD(totals.amo)}</th><th>${fmtMAD(totals.ir)}</th><th>${fmtMAD(totals.net)}</th><th colspan="2"></th></tr></tfoot>
        </table>
      </div>
      <p class="hint-note">Charges patronales estimées (CNSS AF 6,40 % + PS 8,98 % plafonné + TFP 1,60 % + AMO 4,11 %) : <strong>${fmtMAD(totals.patronal)}</strong> — Coût employeur total : <strong>${fmtMAD(totals.brut + totals.patronal)}</strong>. Calculs indicatifs (barème LF 2025).</p>`;
}

// ---------- Congés ----------

function renderLeaves() {
    const rows = db.leaves
        .slice().sort((a, b) => b.du.localeCompare(a.du))
        .map(l => {
            const e = employee(l.empId);
            const badge = { approuve: ['status-success', 'Approuvé'], attente: ['status-warning', 'En attente'], refuse: ['status-error', 'Refusé'] }[l.statut] || ['status-warning', l.statut];
            return `<tr>
              <td><strong>${esc(e?.nom || '—')}</strong></td>
              <td>${esc(l.type)}</td>
              <td>${fmtDate(l.du)} → ${fmtDate(l.au)}</td>
              <td>${leaveDays(l)} j</td>
              <td><span class="status-badge ${badge[0]}">${badge[1]}</span></td>
              <td class="row-actions">
                ${l.statut === 'attente' ? `
                  <button class="icon-btn" title="Approuver" data-action="approve-leave" data-id="${l.id}">✅</button>
                  <button class="icon-btn" title="Refuser" data-action="refuse-leave" data-id="${l.id}">❌</button>` : ''}
                <button class="icon-btn" title="Supprimer" data-action="delete-leave" data-id="${l.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    const balances = activeEmployees().map(e => {
        const b = leaveBalance(e);
        return `<tr><td>${esc(e.nom)}</td><td>${b.acquired} j</td><td>${b.taken} j</td><td><strong>${Math.max(0, b.acquired - b.taken).toFixed(1)} j</strong></td></tr>`;
    }).join('');

    return `
      ${toolbar(null, [`<button class="btn btn-primary" data-action="add-leave">+ Nouvelle demande</button>`])}
      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h3>Demandes de congés</h3></div>
          <div class="table-container flat">
            <table class="data-table">
              <thead><tr><th>Salarié</th><th>Type</th><th>Période</th><th>Durée</th><th>Statut</th><th></th></tr></thead>
              <tbody>${rows || emptyRow(6)}</tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Soldes congés annuels (1,5 j/mois — Code du travail)</h3></div>
          <div class="table-container flat">
            <table class="data-table">
              <thead><tr><th>Salarié</th><th>Acquis</th><th>Pris (${new Date().getFullYear()})</th><th>Solde</th></tr></thead>
              <tbody>${balances || emptyRow(4)}</tbody>
            </table>
          </div>
        </div>
      </div>`;
}

// ---------- Déclarations ----------

function renderDeclarations() {
    const months = lastMonths(12).reverse();
    const rows = months.map(mk => {
        const d = db.declarations[mk] || {};
        const totals = payrollTotals(mk);
        const tva = tvaSummary(mk);
        return `<tr>
          <td><strong>${monthLabel(mk)}</strong></td>
          <td>${checkbox(mk, 'cnss', d.cnss)} <small>avant le 10</small></td>
          <td>${checkbox(mk, 'ir', d.ir)} <small>${fmtMAD(totals.ir)}</small></td>
          <td>${checkbox(mk, 'tva', d.tva)} <small>${fmtMAD(Math.max(0, tva.due))} (avant le 20)</small></td>
        </tr>`;
    }).join('');

    return `
      <div class="panel">
        <div class="panel-head">
          <h3>Suivi des télédéclarations mensuelles</h3>
          <p class="hint-note">CNSS via DAMANCOM · IR via SIMPL-IR (DGI) · TVA via SIMPL-TVA. Cochez lorsque la déclaration est déposée.</p>
        </div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>Mois</th><th>CNSS / AMO</th><th>IR (retenue à la source)</th><th>TVA</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
}

function checkbox(month, kind, checked) {
    return `<label class="check">
      <input type="checkbox" data-action="toggle-declaration" data-month="${month}" data-kind="${kind}" ${checked ? 'checked' : ''}>
      <span>${checked ? 'Déclarée' : 'À faire'}</span>
    </label>`;
}

// ---------- Clients ----------

function renderClients() {
    const q = state.search.toLowerCase();
    const rows = db.clients
        .filter(c => !q || `${c.nom} ${c.ice} ${c.contact}`.toLowerCase().includes(q))
        .map(c => {
            const invs = db.invoices.filter(f => f.clientId === c.id);
            const ca = invs.reduce((s, f) => s + invoiceTTC(f), 0);
            const reste = invs.reduce((s, f) => s + invoiceReste(f), 0);
            return `<tr>
              <td><strong>${esc(c.nom)}</strong><br><small>ICE ${esc(c.ice)}</small></td>
              <td>${esc(c.contact)}<br><small>${esc(c.tel)}</small></td>
              <td>${esc(c.adresse || '—')}</td>
              <td>${fmtMAD(ca)}</td>
              <td>${reste > 0 ? `<span class="status-badge status-warning">${fmtMAD(reste)}</span>` : '<span class="status-badge status-success">Soldé</span>'}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Modifier" data-action="edit-client" data-id="${c.id}">✏️</button>
                <button class="icon-btn" title="Supprimer" data-action="delete-client" data-id="${c.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar('Rechercher un client…', [`<button class="btn btn-primary" data-action="add-client">+ Nouveau client</button>`])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Client</th><th>Contact</th><th>Ville</th><th>CA total TTC</th><th>Reste dû</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(6)}</tbody>
        </table>
      </div>`;
}

function clientForm(c = {}) {
    return `<div class="form-grid">
      ${field('Raison sociale', 'nom', { value: c.nom })}
      ${field('ICE', 'ice', { value: c.ice, half: true, required: false })}
      ${field('Contact', 'contact', { value: c.contact, half: true, required: false })}
      ${field('Téléphone', 'tel', { value: c.tel, half: true, required: false })}
      ${field('Email', 'email', { value: c.email, type: 'email', half: true, required: false })}
      ${field('Ville / Adresse', 'adresse', { value: c.adresse, required: false })}
    </div>`;
}

// ---------- Facturation ----------

function renderInvoices() {
    const q = state.search.toLowerCase();
    const rows = db.invoices
        .slice().sort((a, b) => b.date.localeCompare(a.date))
        .filter(f => !q || `${f.num} ${clientName(f.clientId)} ${f.produit}`.toLowerCase().includes(q))
        .map(f => {
            const badge = { payee: ['status-success', 'Payée'], impayee: ['status-error', 'Impayée'], partielle: ['status-warning', 'Partielle'] }[f.statut];
            return `<tr>
              <td><strong>${esc(f.num)}</strong></td>
              <td>${esc(clientName(f.clientId))}</td>
              <td>${fmtDate(f.date)}</td>
              <td>${esc(f.produit)}<br><small>${esc(f.quantite)} T × ${fmtMAD(f.pu)}</small></td>
              <td>${fmtMAD(invoiceHT(f))}</td>
              <td><strong>${fmtMAD(invoiceTTC(f))}</strong></td>
              <td><span class="status-badge ${badge[0]}">${badge[1]}</span>${invoiceReste(f) > 0 ? `<br><small>reste ${fmtMAD(invoiceReste(f))}</small>` : ''}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Imprimer" data-action="print-invoice" data-id="${f.id}">🖨️</button>
                <button class="icon-btn" title="Encaisser" data-action="pay-invoice" data-id="${f.id}">💰</button>
                <button class="icon-btn" title="Modifier" data-action="edit-invoice" data-id="${f.id}">✏️</button>
                <button class="icon-btn" title="Supprimer" data-action="delete-invoice" data-id="${f.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    const totalTTC = db.invoices.reduce((s, f) => s + invoiceTTC(f), 0);
    const totalReste = db.invoices.reduce((s, f) => s + invoiceReste(f), 0);

    return `
      ${toolbar('Rechercher une facture…', [
        `<button class="btn btn-ghost" data-action="export-invoices">⬇ Export CSV</button>`,
        `<button class="btn btn-primary" data-action="add-invoice">+ Nouvelle facture</button>`
    ])}
      <div class="stats-grid">
        ${kpi('🧾', 'Total facturé TTC', fmtMAD(totalTTC))}
        ${kpi('✅', 'Encaissé', fmtMAD(totalTTC - totalReste))}
        ${kpi('⏳', 'Reste à encaisser', fmtMAD(totalReste))}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Produit</th><th>HT</th><th>TTC</th><th>Statut</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(8)}</tbody>
        </table>
      </div>`;
}

function nextInvoiceNum() {
    const y = new Date().getFullYear();
    const nums = db.invoices
        .map(f => /-(\d+)$/.exec(f.num)?.[1])
        .filter(Boolean).map(Number);
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `FA-${y}-${String(next).padStart(3, '0')}`;
}

function invoiceForm(f = {}) {
    return `<div class="form-grid">
      ${field('N° de facture', 'num', { value: f.num || nextInvoiceNum(), half: true })}
      ${field('Date', 'date', { value: f.date || new Date().toISOString().slice(0, 10), type: 'date', half: true })}
      ${field('Client', 'clientId', { value: f.clientId, options: db.clients.map(c => [c.id, c.nom]) })}
      ${field('Produit', 'produit', { value: f.produit || PRODUCTS[0], options: PRODUCTS, half: true })}
      ${field('Quantité (tonnes)', 'quantite', { value: f.quantite, type: 'number', step: '0.01', half: true })}
      ${field('Prix unitaire HT (MAD/T)', 'pu', { value: f.pu, type: 'number', step: '0.01', half: true })}
      ${field('Statut', 'statut', { value: f.statut || 'impayee', options: [['impayee', 'Impayée'], ['partielle', 'Partiellement payée'], ['payee', 'Payée']], half: true })}
      ${field('Montant déjà réglé (MAD)', 'montantRegle', { value: f.montantRegle || 0, type: 'number', step: '0.01', required: false, half: true })}
    </div>`;
}

// ---------- Fournisseurs ----------

function renderSuppliers() {
    const q = state.search.toLowerCase();
    const rows = db.suppliers
        .filter(s => !q || `${s.nom} ${s.categorie}`.toLowerCase().includes(q))
        .map(s => {
            const achats = db.expenses.filter(d => d.supplierId === s.id);
            const total = achats.reduce((sum, d) => sum + Number(d.montant), 0);
            const aPayer = achats.filter(d => d.statut === 'a_payer').reduce((sum, d) => sum + Number(d.montant), 0);
            return `<tr>
              <td><strong>${esc(s.nom)}</strong><br><small>ICE ${esc(s.ice || '—')}</small></td>
              <td>${esc(s.categorie)}</td>
              <td>${esc(s.contact || '—')}<br><small>${esc(s.tel || '')}</small></td>
              <td>${fmtMAD(total)}</td>
              <td>${aPayer > 0 ? `<span class="status-badge status-warning">${fmtMAD(aPayer)}</span>` : '<span class="status-badge status-success">Soldé</span>'}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Modifier" data-action="edit-supplier" data-id="${s.id}">✏️</button>
                <button class="icon-btn" title="Supprimer" data-action="delete-supplier" data-id="${s.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar('Rechercher un fournisseur…', [`<button class="btn btn-primary" data-action="add-supplier">+ Nouveau fournisseur</button>`])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Fournisseur</th><th>Catégorie</th><th>Contact</th><th>Total achats</th><th>À payer</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(6)}</tbody>
        </table>
      </div>`;
}

function supplierForm(s = {}) {
    return `<div class="form-grid">
      ${field('Raison sociale', 'nom', { value: s.nom })}
      ${field('Catégorie', 'categorie', { value: s.categorie || EXPENSE_CATEGORIES[0], options: EXPENSE_CATEGORIES, half: true })}
      ${field('ICE', 'ice', { value: s.ice, half: true, required: false })}
      ${field('Contact', 'contact', { value: s.contact, half: true, required: false })}
      ${field('Téléphone', 'tel', { value: s.tel, half: true, required: false })}
      ${field('Email', 'email', { value: s.email, type: 'email', required: false })}
    </div>`;
}

// ---------- Dépenses ----------

function renderExpenses() {
    const q = state.search.toLowerCase();
    const month = monthKey();
    const rows = db.expenses
        .slice().sort((a, b) => b.date.localeCompare(a.date))
        .filter(d => !q || `${d.categorie} ${d.description} ${supplierName(d.supplierId)}`.toLowerCase().includes(q))
        .map(d => `<tr>
          <td>${fmtDate(d.date)}</td>
          <td>${esc(d.categorie)}</td>
          <td>${esc(d.description)}</td>
          <td>${d.supplierId ? esc(supplierName(d.supplierId)) : '—'}</td>
          <td><strong>${fmtMAD(d.montant)}</strong></td>
          <td>${d.statut === 'payee' ? '<span class="status-badge status-success">Payée</span>' : '<span class="status-badge status-warning">À payer</span>'}</td>
          <td class="row-actions">
            <button class="icon-btn" title="${d.statut === 'payee' ? 'Marquer à payer' : 'Marquer payée'}" data-action="toggle-expense" data-id="${d.id}">${d.statut === 'payee' ? '↩️' : '✅'}</button>
            <button class="icon-btn" title="Modifier" data-action="edit-expense" data-id="${d.id}">✏️</button>
            <button class="icon-btn" title="Supprimer" data-action="delete-expense" data-id="${d.id}">🗑️</button>
          </td>
        </tr>`).join('');

    const totalMois = db.expenses.filter(d => d.date.startsWith(month)).reduce((s, d) => s + Number(d.montant), 0);
    const aPayer = db.expenses.filter(d => d.statut === 'a_payer').reduce((s, d) => s + Number(d.montant), 0);

    return `
      ${toolbar('Rechercher une dépense…', [
        `<button class="btn btn-ghost" data-action="export-expenses">⬇ Export CSV</button>`,
        `<button class="btn btn-primary" data-action="add-expense">+ Nouvelle dépense</button>`
    ])}
      <div class="stats-grid">
        ${kpi('💸', `Dépenses — ${monthLabel(month)}`, fmtMAD(totalMois))}
        ${kpi('⏳', 'Dettes fournisseurs (à payer)', fmtMAD(aPayer))}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Catégorie</th><th>Description</th><th>Fournisseur</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(7)}</tbody>
        </table>
      </div>`;
}

function expenseForm(d = {}) {
    return `<div class="form-grid">
      ${field('Date', 'date', { value: d.date || new Date().toISOString().slice(0, 10), type: 'date', half: true })}
      ${field('Catégorie', 'categorie', { value: d.categorie || EXPENSE_CATEGORIES[0], options: EXPENSE_CATEGORIES, half: true })}
      ${field('Description', 'description', { value: d.description })}
      ${field('Fournisseur', 'supplierId', { value: d.supplierId || '', required: false, options: [['', '— Aucun —'], ...db.suppliers.map(s => [s.id, s.nom])], half: true })}
      ${field('Montant (MAD)', 'montant', { value: d.montant, type: 'number', step: '0.01', half: true })}
      ${field('Statut', 'statut', { value: d.statut || 'a_payer', options: [['a_payer', 'À payer'], ['payee', 'Payée']], half: true })}
    </div>`;
}

// ---------- Contrats ----------

function renderContracts() {
    const rows = db.contracts
        .slice().sort((a, b) => a.fin.localeCompare(b.fin))
        .map(c => {
            const d = daysUntil(c.fin);
            const badge = c.statut !== 'actif' ? '<span class="status-badge status-error">Clôturé</span>'
                : d < 0 ? '<span class="status-badge status-error">Expiré</span>'
                    : d <= 30 ? `<span class="status-badge status-warning">Expire dans ${d} j</span>`
                        : '<span class="status-badge status-success">Actif</span>';
            return `<tr>
              <td><span class="status-badge ${c.type === 'Client' ? 'status-success' : 'status-warning'}">${esc(c.type)}</span></td>
              <td><strong>${esc(c.partie)}</strong></td>
              <td>${esc(c.objet)}</td>
              <td>${fmtDate(c.debut)} → ${fmtDate(c.fin)}</td>
              <td>${fmtMAD(c.montant)}</td>
              <td>${badge}</td>
              <td class="row-actions">
                <button class="icon-btn" title="Modifier" data-action="edit-contract" data-id="${c.id}">✏️</button>
                <button class="icon-btn" title="Supprimer" data-action="delete-contract" data-id="${c.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    const cddRows = db.employees
        .filter(e => e.statut === 'actif' && e.finContrat)
        .map(e => {
            const d = daysUntil(e.finContrat);
            return `<tr>
              <td><strong>${esc(e.nom)}</strong></td>
              <td>${esc(e.contrat)}</td>
              <td>${fmtDate(e.dateEmbauche)} → ${fmtDate(e.finContrat)}</td>
              <td>${d < 0 ? '<span class="status-badge status-error">Expiré</span>' : d <= 30 ? `<span class="status-badge status-warning">${d} j restants</span>` : '<span class="status-badge status-success">En cours</span>'}</td>
            </tr>`;
        }).join('');

    return `
      ${toolbar(null, [`<button class="btn btn-primary" data-action="add-contract">+ Nouveau contrat</button>`])}
      <div class="panel">
        <div class="panel-head"><h3>Contrats clients & fournisseurs</h3></div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>Type</th><th>Partie</th><th>Objet</th><th>Période</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
            <tbody>${rows || emptyRow(7)}</tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Contrats salariés à échéance (CDD / ANAPEC)</h3></div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>Salarié</th><th>Type</th><th>Période</th><th>Échéance</th></tr></thead>
            <tbody>${cddRows || emptyRow(4)}</tbody>
          </table>
        </div>
      </div>`;
}

function contractForm(c = {}) {
    return `<div class="form-grid">
      ${field('Type', 'type', { value: c.type || 'Client', options: ['Client', 'Fournisseur', 'Autre'], half: true })}
      ${field('Partie (société)', 'partie', { value: c.partie, half: true })}
      ${field('Objet du contrat', 'objet', { value: c.objet })}
      ${field('Début', 'debut', { value: c.debut, type: 'date', half: true })}
      ${field('Fin', 'fin', { value: c.fin, type: 'date', half: true })}
      ${field('Montant (MAD)', 'montant', { value: c.montant, type: 'number', step: '0.01', half: true, required: false })}
      ${field('Statut', 'statut', { value: c.statut || 'actif', options: [['actif', 'Actif'], ['cloture', 'Clôturé']], half: true })}
    </div>`;
}

// ---------- Comptabilité (CGNC) ----------

function tvaSummary(month) {
    const collectee = db.invoices.filter(f => f.date.startsWith(month)).reduce((s, f) => s + invoiceTVA(f), 0);
    // TVA déductible estimée sur les achats (montants saisis TTC → TVA = montant × 20/120)
    const deductible = db.expenses.filter(d => d.date.startsWith(month))
        .reduce((s, d) => s + Number(d.montant) * TVA_RATE / (1 + TVA_RATE), 0);
    return { collectee, deductible, due: collectee - deductible };
}

function journalEntries(month) {
    const entries = [];
    db.invoices.filter(f => f.date.startsWith(month)).forEach(f => {
        entries.push({
            date: f.date, piece: f.num, libelle: `Vente ${f.produit} — ${clientName(f.clientId)}`,
            lines: [
                { compte: '3421 Clients', debit: invoiceTTC(f), credit: 0 },
                { compte: '7121 Ventes de biens produits', debit: 0, credit: invoiceHT(f) },
                { compte: '4455 État — TVA facturée', debit: 0, credit: invoiceTVA(f) }
            ]
        });
        if (Number(f.montantRegle) > 0 || f.statut === 'payee') {
            const regle = f.statut === 'payee' ? invoiceTTC(f) : Number(f.montantRegle);
            entries.push({
                date: f.date, piece: f.num, libelle: `Encaissement ${clientName(f.clientId)}`,
                lines: [
                    { compte: '5141 Banque', debit: regle, credit: 0 },
                    { compte: '3421 Clients', debit: 0, credit: regle }
                ]
            });
        }
    });
    db.expenses.filter(d => d.date.startsWith(month)).forEach(d => {
        const ht = Number(d.montant) / (1 + TVA_RATE);
        const tva = Number(d.montant) - ht;
        entries.push({
            date: d.date, piece: '—', libelle: `${d.categorie} — ${d.description}`,
            lines: [
                { compte: '6121 Achats de matières & fournitures', debit: ht, credit: 0 },
                { compte: '3455 État — TVA récupérable', debit: tva, credit: 0 },
                { compte: d.statut === 'payee' ? '5141 Banque' : '4411 Fournisseurs', debit: 0, credit: Number(d.montant) }
            ]
        });
    });
    const paid = db.payroll[month] || {};
    if (Object.values(paid).some(v => v === 'paye')) {
        const t = payrollTotals(month);
        entries.push({
            date: `${month}-28`, piece: 'PAIE', libelle: `Paie du personnel — ${monthLabel(month)}`,
            lines: [
                { compte: '6171 Rémunérations du personnel', debit: t.brut, credit: 0 },
                { compte: '6174 Charges sociales patronales', debit: t.patronal, credit: 0 },
                { compte: '4441 CNSS / AMO', debit: 0, credit: t.cnss + t.amo + t.patronal },
                { compte: '44525 État — IR source', debit: 0, credit: t.ir },
                { compte: '5141 Banque (nets payés)', debit: 0, credit: t.net }
            ]
        });
    }
    return entries.sort((a, b) => a.date.localeCompare(b.date));
}

function renderAccounting() {
    const month = state.accountingMonth;
    const tva = tvaSummary(month);
    const entries = journalEntries(month);
    const totalDebit = entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.debit, 0), 0);
    const totalCredit = entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.credit, 0), 0);

    const caHT = db.invoices.filter(f => f.date.startsWith(month)).reduce((s, f) => s + invoiceHT(f), 0);
    const chargesHT = db.expenses.filter(d => d.date.startsWith(month)).reduce((s, d) => s + Number(d.montant) / (1 + TVA_RATE), 0);
    const paie = Object.values(db.payroll[month] || {}).some(v => v === 'paye') ? payrollTotals(month) : null;
    const resultat = caHT - chargesHT - (paie ? paie.brut + paie.patronal : 0);

    const rows = entries.map(e => e.lines.map((l, i) => `
      <tr>
        ${i === 0 ? `<td rowspan="${e.lines.length}">${fmtDate(e.date)}<br><small>${esc(e.piece)}</small></td>
        <td rowspan="${e.lines.length}">${esc(e.libelle)}</td>` : ''}
        <td>${esc(l.compte)}</td>
        <td>${l.debit ? fmtMAD(l.debit) : ''}</td>
        <td>${l.credit ? fmtMAD(l.credit) : ''}</td>
      </tr>`).join('')).join('');

    return `
      <div class="toolbar">
        <label class="month-picker">Période :
          <input type="month" class="form-input" id="accounting-month" value="${month}">
        </label>
      </div>

      <div class="stats-grid">
        ${kpi('🧾', 'TVA collectée (ventes)', fmtMAD(tva.collectee))}
        ${kpi('📥', 'TVA récupérable (achats)', fmtMAD(tva.deductible))}
        ${kpi('🏛️', tva.due >= 0 ? 'TVA due (SIMPL-TVA)' : 'Crédit de TVA', fmtMAD(Math.abs(tva.due)))}
        ${kpi(resultat >= 0 ? '📈' : '📉', `Résultat estimé — ${monthLabel(month)}`, fmtMAD(resultat))}
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Journal comptable (plan CGNC) — ${monthLabel(month)}</h3>
          <p class="hint-note">Écritures générées automatiquement depuis la facturation, les dépenses et la paie. Montants indicatifs.</p>
        </div>
        <div class="table-container flat">
          <table class="data-table journal">
            <thead><tr><th>Date / Pièce</th><th>Libellé</th><th>Compte (CGNC)</th><th>Débit</th><th>Crédit</th></tr></thead>
            <tbody>${rows || emptyRow(5)}</tbody>
            <tfoot><tr><th colspan="3">Totaux</th><th>${fmtMAD(totalDebit)}</th><th>${fmtMAD(totalCredit)}</th></tr></tfoot>
          </table>
        </div>
      </div>`;
}

// ---------- Fragments partagés ----------

function toolbar(searchPlaceholder, actions = []) {
    return `<div class="toolbar">
      ${searchPlaceholder ? `<input type="search" class="form-input search-input" id="search-input" placeholder="${esc(searchPlaceholder)}" value="${esc(state.search)}">` : '<span></span>'}
      <div class="toolbar-actions">${actions.join('')}</div>
    </div>`;
}

function emptyRow(cols) {
    return `<tr><td colspan="${cols}" class="empty">Aucune donnée pour le moment.</td></tr>`;
}

// ============================================
// Actions (CRUD)
// ============================================

function nextMatricule() {
    const nums = db.employees.map(e => Number(e.matricule)).filter(n => !isNaN(n));
    return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
}

const actions = {
    // --- Salariés ---
    'add-employee': () => openModal('Nouveau salarié', employeeForm(), data => {
        db.employees.push({ id: uid(), matricule: nextMatricule(), ...data, salaire: Number(data.salaire) });
        save(); render();
    }),
    'edit-employee': ({ id }) => {
        const e = employee(id);
        openModal(`Modifier — ${e.nom}`, employeeForm(e), data => {
            Object.assign(e, data, { salaire: Number(data.salaire) });
            save(); render();
        });
    },
    'delete-employee': ({ id }) => {
        const e = employee(id);
        if (confirm(`Supprimer définitivement ${e.nom} ? (préférez le statut « Sorti »)`)) {
            db.employees = db.employees.filter(x => x.id !== id);
            save(); render();
        }
    },
    'export-employees': () => exportCSV('salaries.csv',
        ['Matricule', 'Nom', 'CIN', 'CNSS', 'Poste', 'Contrat', 'Embauche', 'Fin contrat', 'Salaire brut', 'Statut'],
        db.employees.map(e => [e.matricule, e.nom, e.cin, e.cnss, e.poste, e.contrat, e.dateEmbauche, e.finContrat, e.salaire, e.statut])),

    // --- Paie ---
    'toggle-paid': ({ id }) => {
        const m = state.payrollMonth;
        db.payroll[m] = db.payroll[m] || {};
        db.payroll[m][id] = db.payroll[m][id] === 'paye' ? 'attente' : 'paye';
        save(); render();
    },
    'pay-all': () => {
        const m = state.payrollMonth;
        db.payroll[m] = db.payroll[m] || {};
        activeEmployees().forEach(e => { db.payroll[m][e.id] = 'paye'; });
        save(); render();
    },
    'print-bulletin': ({ id }) => printBulletin(id, state.payrollMonth),
    'export-payroll': () => {
        const m = state.payrollMonth;
        exportCSV(`paie-${m}.csv`,
            ['Salarié', 'Brut', 'CNSS', 'AMO', 'IR', 'Net', 'Statut'],
            activeEmployees().map(e => {
                const p = calcPay(e.salaire);
                return [e.nom, p.brut.toFixed(2), p.cnss.toFixed(2), p.amo.toFixed(2), p.ir.toFixed(2), p.net.toFixed(2), (db.payroll[m]?.[e.id] === 'paye') ? 'Payé' : 'En attente'];
            }));
    },

    // --- Congés ---
    'add-leave': () => openModal('Nouvelle demande de congé', `<div class="form-grid">
        ${field('Salarié', 'empId', { options: activeEmployees().map(e => [e.id, e.nom]) })}
        ${field('Type', 'type', { options: ['Congé annuel', 'Maladie', 'Exceptionnel', 'Sans solde'], half: true })}
        ${field('Statut', 'statut', { value: 'attente', options: [['attente', 'En attente'], ['approuve', 'Approuvé']], half: true })}
        ${field('Du', 'du', { type: 'date', half: true })}
        ${field('Au', 'au', { type: 'date', half: true })}
      </div>`, data => {
        db.leaves.push({ id: uid(), ...data });
        save(); render();
    }),
    'approve-leave': ({ id }) => { db.leaves.find(l => l.id === id).statut = 'approuve'; save(); render(); },
    'refuse-leave': ({ id }) => { db.leaves.find(l => l.id === id).statut = 'refuse'; save(); render(); },
    'delete-leave': ({ id }) => { db.leaves = db.leaves.filter(l => l.id !== id); save(); render(); },

    // --- Déclarations ---
    'toggle-declaration': ({ month, kind }) => {
        db.declarations[month] = db.declarations[month] || {};
        db.declarations[month][kind] = !db.declarations[month][kind];
        save(); render();
    },

    // --- Clients ---
    'add-client': () => openModal('Nouveau client', clientForm(), data => {
        db.clients.push({ id: uid(), ...data });
        save(); render();
    }),
    'edit-client': ({ id }) => {
        const c = db.clients.find(x => x.id === id);
        openModal(`Modifier — ${c.nom}`, clientForm(c), data => { Object.assign(c, data); save(); render(); });
    },
    'delete-client': ({ id }) => {
        if (db.invoices.some(f => f.clientId === id)) return alert('Impossible : des factures sont liées à ce client.');
        if (confirm('Supprimer ce client ?')) { db.clients = db.clients.filter(c => c.id !== id); save(); render(); }
    },

    // --- Factures ---
    'add-invoice': () => {
        if (!db.clients.length) return alert("Créez d'abord un client.");
        openModal('Nouvelle facture', invoiceForm(), data => {
            db.invoices.push({ id: uid(), ...data, quantite: Number(data.quantite), pu: Number(data.pu), montantRegle: Number(data.montantRegle) || 0 });
            save(); render();
        });
    },
    'edit-invoice': ({ id }) => {
        const f = db.invoices.find(x => x.id === id);
        openModal(`Modifier — ${f.num}`, invoiceForm(f), data => {
            Object.assign(f, data, { quantite: Number(data.quantite), pu: Number(data.pu), montantRegle: Number(data.montantRegle) || 0 });
            save(); render();
        });
    },
    'pay-invoice': ({ id }) => {
        const f = db.invoices.find(x => x.id === id);
        f.statut = 'payee';
        f.montantRegle = invoiceTTC(f);
        save(); render();
    },
    'delete-invoice': ({ id }) => {
        if (confirm('Supprimer cette facture ?')) { db.invoices = db.invoices.filter(f => f.id !== id); save(); render(); }
    },
    'print-invoice': ({ id }) => printInvoice(id),
    'export-invoices': () => exportCSV('factures.csv',
        ['N°', 'Client', 'Date', 'Produit', 'Quantité', 'PU', 'HT', 'TVA', 'TTC', 'Réglé', 'Statut'],
        db.invoices.map(f => [f.num, clientName(f.clientId), f.date, f.produit, f.quantite, f.pu,
        invoiceHT(f).toFixed(2), invoiceTVA(f).toFixed(2), invoiceTTC(f).toFixed(2), f.montantRegle, f.statut])),

    // --- Fournisseurs ---
    'add-supplier': () => openModal('Nouveau fournisseur', supplierForm(), data => {
        db.suppliers.push({ id: uid(), ...data });
        save(); render();
    }),
    'edit-supplier': ({ id }) => {
        const s = db.suppliers.find(x => x.id === id);
        openModal(`Modifier — ${s.nom}`, supplierForm(s), data => { Object.assign(s, data); save(); render(); });
    },
    'delete-supplier': ({ id }) => {
        if (db.expenses.some(d => d.supplierId === id)) return alert('Impossible : des dépenses sont liées à ce fournisseur.');
        if (confirm('Supprimer ce fournisseur ?')) { db.suppliers = db.suppliers.filter(s => s.id !== id); save(); render(); }
    },

    // --- Dépenses ---
    'add-expense': () => openModal('Nouvelle dépense', expenseForm(), data => {
        db.expenses.push({ id: uid(), ...data, montant: Number(data.montant) });
        save(); render();
    }),
    'edit-expense': ({ id }) => {
        const d = db.expenses.find(x => x.id === id);
        openModal('Modifier la dépense', expenseForm(d), data => {
            Object.assign(d, data, { montant: Number(data.montant) });
            save(); render();
        });
    },
    'toggle-expense': ({ id }) => {
        const d = db.expenses.find(x => x.id === id);
        d.statut = d.statut === 'payee' ? 'a_payer' : 'payee';
        save(); render();
    },
    'delete-expense': ({ id }) => {
        if (confirm('Supprimer cette dépense ?')) { db.expenses = db.expenses.filter(d => d.id !== id); save(); render(); }
    },
    'export-expenses': () => exportCSV('depenses.csv',
        ['Date', 'Catégorie', 'Description', 'Fournisseur', 'Montant', 'Statut'],
        db.expenses.map(d => [d.date, d.categorie, d.description, supplierName(d.supplierId), d.montant, d.statut])),

    // --- Contrats ---
    'add-contract': () => openModal('Nouveau contrat', contractForm(), data => {
        db.contracts.push({ id: uid(), ...data, montant: Number(data.montant) || 0 });
        save(); render();
    }),
    'edit-contract': ({ id }) => {
        const c = db.contracts.find(x => x.id === id);
        openModal('Modifier le contrat', contractForm(c), data => {
            Object.assign(c, data, { montant: Number(data.montant) || 0 });
            save(); render();
        });
    },
    'delete-contract': ({ id }) => {
        if (confirm('Supprimer ce contrat ?')) { db.contracts = db.contracts.filter(c => c.id !== id); save(); render(); }
    }
};

// ============================================
// Bootstrap
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Date du jour dans l'en-tête
    $('#header-date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Routing par hash
    const applyHash = () => {
        const view = location.hash.replace('#', '') || 'dashboard';
        if (VIEW_TITLES[view]) {
            state.view = view;
            state.search = '';
            render();
        }
    };
    window.addEventListener('hashchange', applyHash);
    applyHash();

    // Délégation des actions
    $('#view').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.matches('input[type="checkbox"]')) return; // géré par change
        actions[btn.dataset.action]?.(btn.dataset);
    });

    $('#view').addEventListener('change', (e) => {
        const el = e.target;
        if (el.matches('[data-action="toggle-declaration"]')) {
            actions['toggle-declaration'](el.dataset);
        } else if (el.id === 'payroll-month' && el.value) {
            state.payrollMonth = el.value;
            render();
        } else if (el.id === 'accounting-month' && el.value) {
            state.accountingMonth = el.value;
            render();
        }
    });

    $('#view').addEventListener('input', (e) => {
        if (e.target.id === 'search-input') {
            state.search = e.target.value;
            const pos = e.target.selectionStart;
            render();
            const input = $('#search-input');
            if (input) { input.focus(); input.setSelectionRange(pos, pos); }
        }
    });

    // Modal
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
