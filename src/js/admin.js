// ============================================
// Gestion Administrative — SOCIETE H.H ISTITMAR
// RH, paie, clients, fournisseurs, comptabilité (CGNC)
// Multi-utilisateurs via Supabase (repli localStorage)
// Bilingue Français / العربية (RTL)
// ============================================

import { store, uid, isCloud, getSession, signOut } from './store.js';

const COMPANY = {
    nom: 'SOCIETE H.H ISTITMAR',
    activite: 'Exploitation de carrière — Calcaire dolomitique',
    adresse: "AV Hassan 2, Hay M'sila, Bhalil, Sefrou, Maroc",
    rc: '2227 Sefrou',
    ice: '001987690000045',
    capital: '1 000 000 DHS',
    tel: '+212 661 350 968'
};

const PRODUCTS = ['GNT 0/31.5', 'GNT 0/20', 'Gravier 3/8', 'Gravier 8/16', 'Gravier 16/31.5', 'Sable concassé 0/4', 'Tout-venant'];
const TVA_RATE = 0.20;

// ---------- Barème social & fiscal marocain (indicatif, LF 2025) ----------
const CNSS_SALARIE = 0.0448;
const CNSS_PLAFOND = 6000;
const AMO_SALARIE = 0.0226;
const FRAIS_PRO_CAP = 2916.67;

const PATRONAL = {
    allocFamiliales: 0.0640,
    prestationsSociales: 0.0898,
    tfp: 0.016,
    amo: 0.0411
};

const IR_BRACKETS = [
    { max: 3333.33, rate: 0, deduct: 0 },
    { max: 5000.00, rate: 0.10, deduct: 333.33 },
    { max: 6666.67, rate: 0.20, deduct: 833.33 },
    { max: 8333.33, rate: 0.30, deduct: 1500.00 },
    { max: 15000.00, rate: 0.34, deduct: 1833.33 },
    { max: Infinity, rate: 0.37, deduct: 2283.33 }
];

// ============================================
// Internationalisation FR / AR
// ============================================

const I18N = {
    fr: {
        // Groupes & navigation
        'nav.group.pilotage': 'Pilotage', 'nav.group.rh': 'Ressources Humaines', 'nav.group.commercial': 'Commercial & Finance', 'nav.group.compta': 'Comptabilité',
        'nav.dashboard': 'Tableau de bord', 'nav.employees': 'Salariés', 'nav.payroll': 'Paie', 'nav.leaves': 'Congés & Absences', 'nav.declarations': 'Déclarations',
        'nav.clients': 'Clients', 'nav.invoices': 'Facturation', 'nav.suppliers': 'Fournisseurs', 'nav.expenses': 'Dépenses', 'nav.contracts': 'Contrats', 'nav.accounting': 'Journal & TVA',
        'nav.site': 'Voir le site', 'nav.logout': 'Déconnexion', 'nav.brand': 'Gestion H.H',
        // Titres de vues
        'title.dashboard': 'Tableau de bord', 'title.employees': 'Salariés', 'title.payroll': 'Paie', 'title.leaves': 'Congés & Absences',
        'title.declarations': 'Déclarations sociales & fiscales', 'title.clients': 'Clients', 'title.invoices': 'Facturation',
        'title.suppliers': 'Fournisseurs', 'title.expenses': 'Dépenses', 'title.contracts': 'Contrats', 'title.accounting': 'Comptabilité — Journal & TVA',
        // Génériques
        'mad': 'MAD', 'save': 'Enregistrer', 'cancel': 'Annuler', 'edit': 'Modifier', 'delete': 'Supprimer', 'print': 'Imprimer',
        'export': '⬇ Export CSV', 'search': 'Rechercher…', 'empty': 'Aucune donnée pour le moment.', 'confirm.delete': 'Confirmer la suppression ?',
        'status.actif': 'Actif', 'status.sorti': 'Sorti', 'status.paye': 'Payé', 'status.attente': 'En attente', 'status.payee': 'Payée',
        'status.impayee': 'Impayée', 'status.partielle': 'Partielle', 'status.a_payer': 'À payer', 'status.approuve': 'Approuvé',
        'status.refuse': 'Refusé', 'status.expire': 'Expiré', 'status.cloture': 'Clôturé', 'status.encours': 'En cours', 'status.solde': 'Soldé',
        'th.statut': 'Statut', 'th.date': 'Date', 'th.montant': 'Montant', 'th.periode': 'Période', 'reste': 'reste',
        // Tableau de bord
        'kpi.headcount': 'Effectif actif', 'kpi.netPayroll': 'Masse salariale nette / mois', 'kpi.revenue': 'CA facturé — {m}',
        'kpi.receivables': 'Créances clients (impayés)', 'kpi.expenses': 'Dépenses — {m}', 'kpi.employerCost': 'Coût employeur mensuel',
        'dash.alerts': '⚠️ Alertes & échéances', 'dash.noAlert': 'Aucune alerte. Tout est à jour ✅', 'dash.chart': "📈 Chiffre d'affaires vs Sorties (6 mois)",
        'dash.legend.ca': 'CA TTC facturé', 'dash.legend.out': 'Dépenses + paie',
        'alert.empContractExpired': 'Contrat {c} de <strong>{n}</strong> expiré le {d}',
        'alert.empContractSoon': 'Contrat {c} de <strong>{n}</strong> expire dans {j} j ({d})',
        'alert.contractSoon': 'Contrat {t} « {o} » expire dans {j} j',
        'alert.cnss': 'Déclaration <strong>CNSS {m}</strong> à télédéclarer (DAMANCOM, avant le 10)',
        'alert.tva': 'Déclaration <strong>TVA {m}</strong> à déposer (SIMPL, avant le 20)',
        'alert.invoiceLate': 'Facture <strong>{n}</strong> ({c}) en retard de paiement — reste {r}',
        // Salariés
        'emp.add': '+ Nouveau salarié', 'emp.new': 'Nouveau salarié', 'emp.search': 'Rechercher un salarié…',
        'emp.th.matricule': 'Matricule', 'emp.th.name': 'Salarié', 'emp.th.poste': 'Poste', 'emp.th.contrat': 'Contrat', 'emp.th.hire': 'Embauche', 'emp.th.salary': 'Salaire brut',
        'emp.f.nom': 'Nom complet', 'emp.f.cin': 'CIN', 'emp.f.cnss': 'N° CNSS', 'emp.f.poste': 'Poste', 'emp.f.contrat': 'Type de contrat',
        'emp.f.salaire': 'Salaire brut (MAD)', 'emp.f.embauche': "Date d'embauche", 'emp.f.fin': 'Fin de contrat (si CDD)', 'emp.f.statut': 'Statut',
        'emp.confirmDelete': 'Supprimer définitivement {n} ? (préférez le statut « Sorti »)', 'emp.endDays': 'Fin {j} j',
        // Paie
        'pay.month': 'Mois de paie :', 'pay.payAll': '✅ Tout marquer payé', 'pay.totBrut': 'Total brut', 'pay.totCnss': 'CNSS + AMO (salarié)',
        'pay.totIR': 'IR à verser (DGI)', 'pay.totNet': 'Total net à payer', 'pay.th.emp': 'Salarié', 'pay.th.brut': 'Brut',
        'pay.th.net': 'Net à payer', 'pay.totals': 'Totaux', 'pay.bulletin': 'Bulletin de paie', 'pay.markPaid': 'Marquer payé', 'pay.markUnpaid': 'Marquer non payé',
        'pay.note': 'Charges patronales estimées (CNSS AF 6,40 % + PS 8,98 % plafonné + TFP 1,60 % + AMO 4,11 %) : <strong>{p}</strong> — Coût employeur total : <strong>{t}</strong>. Calculs indicatifs (barème LF 2025).',
        // Congés
        'leave.add': '+ Nouvelle demande', 'leave.new': 'Nouvelle demande de congé', 'leave.requests': 'Demandes de congés',
        'leave.balances': 'Soldes congés annuels (1,5 j/mois — Code du travail)', 'leave.th.type': 'Type', 'leave.th.duration': 'Durée',
        'leave.th.acquired': 'Acquis', 'leave.th.taken': 'Pris ({y})', 'leave.th.balance': 'Solde', 'leave.approve': 'Approuver', 'leave.refuse': 'Refuser',
        'leave.f.emp': 'Salarié', 'leave.f.type': 'Type', 'leave.f.from': 'Du', 'leave.f.to': 'Au',
        'leave.type.annuel': 'Congé annuel', 'leave.type.maladie': 'Maladie', 'leave.type.exceptionnel': 'Exceptionnel', 'leave.type.sanssolde': 'Sans solde',
        // Déclarations
        'decl.title': 'Suivi des télédéclarations mensuelles',
        'decl.hint': 'CNSS via DAMANCOM · IR via SIMPL-IR (DGI) · TVA via SIMPL-TVA. Cochez lorsque la déclaration est déposée.',
        'decl.th.month': 'Mois', 'decl.th.cnss': 'CNSS / AMO', 'decl.th.ir': 'IR (retenue à la source)', 'decl.th.tva': 'TVA',
        'decl.before10': 'avant le 10', 'decl.before20': '(avant le 20)', 'decl.done': 'Déclarée', 'decl.todo': 'À faire',
        // Clients
        'cli.add': '+ Nouveau client', 'cli.new': 'Nouveau client', 'cli.search': 'Rechercher un client…',
        'cli.th.client': 'Client', 'cli.th.contact': 'Contact', 'cli.th.city': 'Ville', 'cli.th.ca': 'CA total TTC', 'cli.th.due': 'Reste dû',
        'cli.f.nom': 'Raison sociale', 'cli.f.contact': 'Contact', 'cli.f.tel': 'Téléphone', 'cli.f.adresse': 'Ville / Adresse',
        'cli.blocked': 'Impossible : des factures sont liées à ce client.',
        // Factures
        'inv.add': '+ Nouvelle facture', 'inv.new': 'Nouvelle facture', 'inv.search': 'Rechercher une facture…',
        'inv.kpi.total': 'Total facturé TTC', 'inv.kpi.paid': 'Encaissé', 'inv.kpi.due': 'Reste à encaisser',
        'inv.th.num': 'N°', 'inv.th.product': 'Produit', 'inv.pay': 'Encaisser',
        'inv.f.num': 'N° de facture', 'inv.f.client': 'Client', 'inv.f.product': 'Produit', 'inv.f.qty': 'Quantité (tonnes)',
        'inv.f.pu': 'Prix unitaire HT (MAD/T)', 'inv.f.paid': 'Montant déjà réglé (MAD)', 'inv.needClient': "Créez d'abord un client.",
        'inv.statut.impayee': 'Impayée', 'inv.statut.partielle': 'Partiellement payée', 'inv.statut.payee': 'Payée',
        // Fournisseurs
        'sup.add': '+ Nouveau fournisseur', 'sup.new': 'Nouveau fournisseur', 'sup.search': 'Rechercher un fournisseur…',
        'sup.th.name': 'Fournisseur', 'sup.th.cat': 'Catégorie', 'sup.th.total': 'Total achats', 'sup.th.due': 'À payer',
        'sup.blocked': 'Impossible : des dépenses sont liées à ce fournisseur.',
        // Dépenses
        'exp.add': '+ Nouvelle dépense', 'exp.new': 'Nouvelle dépense', 'exp.edit': 'Modifier la dépense', 'exp.search': 'Rechercher une dépense…',
        'exp.kpi.month': 'Dépenses — {m}', 'exp.kpi.due': 'Dettes fournisseurs (à payer)',
        'exp.th.cat': 'Catégorie', 'exp.th.desc': 'Description', 'exp.th.supplier': 'Fournisseur',
        'exp.f.desc': 'Description', 'exp.f.supplier': 'Fournisseur', 'exp.f.none': '— Aucun —',
        'exp.cat.Carburant': 'Carburant', 'exp.cat.Maintenance': 'Maintenance', 'exp.cat.Pièces de rechange': 'Pièces de rechange',
        'exp.cat.Explosifs & minage': 'Explosifs & minage', 'exp.cat.Électricité': 'Électricité', 'exp.cat.Transport': 'Transport',
        'exp.cat.Loyers & redevances': 'Loyers & redevances', 'exp.cat.Assurances': 'Assurances', 'exp.cat.Fournitures': 'Fournitures', 'exp.cat.Autre': 'Autre',
        // Contrats
        'ct.add': '+ Nouveau contrat', 'ct.new': 'Nouveau contrat', 'ct.edit': 'Modifier le contrat',
        'ct.list': 'Contrats clients & fournisseurs', 'ct.cdd': 'Contrats salariés à échéance (CDD / ANAPEC)',
        'ct.th.type': 'Type', 'ct.th.party': 'Partie', 'ct.th.object': 'Objet', 'ct.expiresIn': 'Expire dans {j} j', 'ct.daysLeft': '{j} j restants',
        'ct.f.type': 'Type', 'ct.f.party': 'Partie (société)', 'ct.f.object': 'Objet du contrat', 'ct.f.start': 'Début', 'ct.f.end': 'Fin', 'ct.f.amount': 'Montant (MAD)',
        'ct.type.Client': 'Client', 'ct.type.Fournisseur': 'Fournisseur', 'ct.type.Autre': 'Autre',
        // Comptabilité
        'acc.period': 'Période :', 'acc.kpi.collected': 'TVA collectée (ventes)', 'acc.kpi.deductible': 'TVA récupérable (achats)',
        'acc.kpi.due': 'TVA due (SIMPL-TVA)', 'acc.kpi.credit': 'Crédit de TVA', 'acc.kpi.result': 'Résultat estimé — {m}',
        'acc.journal': 'Journal comptable (plan CGNC) — {m}',
        'acc.hint': 'Écritures générées automatiquement depuis la facturation, les dépenses et la paie. Montants indicatifs.',
        'acc.th.piece': 'Date / Pièce', 'acc.th.label': 'Libellé', 'acc.th.account': 'Compte (CGNC)', 'acc.th.debit': 'Débit', 'acc.th.credit': 'Crédit', 'acc.totals': 'Totaux',
        'acc.e.sale': 'Vente {p} — {c}', 'acc.e.cashin': 'Encaissement {c}', 'acc.e.payroll': 'Paie du personnel — {m}',
        'acc.a.clients': '3421 Clients', 'acc.a.sales': '7121 Ventes de biens produits', 'acc.a.tvaOut': '4455 État — TVA facturée',
        'acc.a.bank': '5141 Banque', 'acc.a.purchases': '6121 Achats de matières & fournitures', 'acc.a.tvaIn': '3455 État — TVA récupérable',
        'acc.a.suppliers': '4411 Fournisseurs', 'acc.a.wages': '6171 Rémunérations du personnel', 'acc.a.social': '6174 Charges sociales patronales',
        'acc.a.cnss': '4441 CNSS / AMO', 'acc.a.ir': '44525 État — IR source', 'acc.a.bankNet': '5141 Banque (nets payés)',
        // Divers
        'mode.demo': 'Mode démo (données locales)', 'mode.cloud': 'Connecté', 'sync.refresh': 'Actualiser'
    },

    ar: {
        'nav.group.pilotage': 'القيادة', 'nav.group.rh': 'الموارد البشرية', 'nav.group.commercial': 'التجارة والمالية', 'nav.group.compta': 'المحاسبة',
        'nav.dashboard': 'لوحة القيادة', 'nav.employees': 'الأجراء', 'nav.payroll': 'الأجور', 'nav.leaves': 'العطل والغيابات', 'nav.declarations': 'التصريحات',
        'nav.clients': 'الزبناء', 'nav.invoices': 'الفوترة', 'nav.suppliers': 'الموردون', 'nav.expenses': 'المصاريف', 'nav.contracts': 'العقود', 'nav.accounting': 'اليومية والضريبة',
        'nav.site': 'عرض الموقع', 'nav.logout': 'تسجيل الخروج', 'nav.brand': 'تدبير ح.ح',
        'title.dashboard': 'لوحة القيادة', 'title.employees': 'الأجراء', 'title.payroll': 'الأجور', 'title.leaves': 'العطل والغيابات',
        'title.declarations': 'التصريحات الاجتماعية والجبائية', 'title.clients': 'الزبناء', 'title.invoices': 'الفوترة',
        'title.suppliers': 'الموردون', 'title.expenses': 'المصاريف', 'title.contracts': 'العقود', 'title.accounting': 'المحاسبة — اليومية والضريبة',
        'mad': 'درهم', 'save': 'حفظ', 'cancel': 'إلغاء', 'edit': 'تعديل', 'delete': 'حذف', 'print': 'طباعة',
        'export': '⬇ تصدير CSV', 'search': 'بحث…', 'empty': 'لا توجد بيانات بعد.', 'confirm.delete': 'تأكيد الحذف؟',
        'status.actif': 'نشط', 'status.sorti': 'مغادر', 'status.paye': 'مؤدى', 'status.attente': 'في الانتظار', 'status.payee': 'مؤداة',
        'status.impayee': 'غير مؤداة', 'status.partielle': 'جزئية', 'status.a_payer': 'واجبة الأداء', 'status.approuve': 'موافق عليها',
        'status.refuse': 'مرفوضة', 'status.expire': 'منتهي', 'status.cloture': 'مغلق', 'status.encours': 'جارٍ', 'status.solde': 'مسدَّد',
        'th.statut': 'الحالة', 'th.date': 'التاريخ', 'th.montant': 'المبلغ', 'th.periode': 'الفترة', 'reste': 'المتبقي',
        'kpi.headcount': 'عدد الأجراء النشطين', 'kpi.netPayroll': 'كتلة الأجور الصافية / شهر', 'kpi.revenue': 'رقم المعاملات المفوتر — {m}',
        'kpi.receivables': 'مستحقات الزبناء (غير مؤداة)', 'kpi.expenses': 'المصاريف — {m}', 'kpi.employerCost': 'التكلفة الشهرية للمشغّل',
        'dash.alerts': '⚠️ تنبيهات وآجال', 'dash.noAlert': 'لا توجد تنبيهات. كل شيء محيَّن ✅', 'dash.chart': '📈 رقم المعاملات مقابل النفقات (6 أشهر)',
        'dash.legend.ca': 'رقم المعاملات المفوتر', 'dash.legend.out': 'المصاريف + الأجور',
        'alert.empContractExpired': 'عقد {c} الخاص بـ<strong>{n}</strong> انتهى في {d}',
        'alert.empContractSoon': 'عقد {c} الخاص بـ<strong>{n}</strong> ينتهي بعد {j} يوم ({d})',
        'alert.contractSoon': 'عقد {t} « {o} » ينتهي بعد {j} يوم',
        'alert.cnss': 'تصريح <strong>CNSS {m}</strong> يجب إيداعه (DAMANCOM، قبل يوم 10)',
        'alert.tva': 'تصريح <strong>الضريبة على القيمة المضافة {m}</strong> يجب إيداعه (SIMPL، قبل يوم 20)',
        'alert.invoiceLate': 'الفاتورة <strong>{n}</strong> ({c}) متأخرة الأداء — المتبقي {r}',
        'emp.add': '+ أجير جديد', 'emp.new': 'أجير جديد', 'emp.search': 'البحث عن أجير…',
        'emp.th.matricule': 'الرقم', 'emp.th.name': 'الأجير', 'emp.th.poste': 'المنصب', 'emp.th.contrat': 'العقد', 'emp.th.hire': 'التوظيف', 'emp.th.salary': 'الأجر الخام',
        'emp.f.nom': 'الاسم الكامل', 'emp.f.cin': 'ب.ت.و', 'emp.f.cnss': 'رقم CNSS', 'emp.f.poste': 'المنصب', 'emp.f.contrat': 'نوع العقد',
        'emp.f.salaire': 'الأجر الخام (درهم)', 'emp.f.embauche': 'تاريخ التوظيف', 'emp.f.fin': 'نهاية العقد (إن وجدت)', 'emp.f.statut': 'الحالة',
        'emp.confirmDelete': 'حذف {n} نهائياً؟ (يُفضَّل تغيير الحالة إلى « مغادر »)', 'emp.endDays': 'ينتهي بعد {j} يوم',
        'pay.month': 'شهر الأداء:', 'pay.payAll': '✅ تأدية الجميع', 'pay.totBrut': 'إجمالي الخام', 'pay.totCnss': 'CNSS + AMO (الأجير)',
        'pay.totIR': 'الضريبة على الدخل (DGI)', 'pay.totNet': 'الصافي الواجب أداؤه', 'pay.th.emp': 'الأجير', 'pay.th.brut': 'الخام',
        'pay.th.net': 'الصافي', 'pay.totals': 'المجاميع', 'pay.bulletin': 'ورقة الأداء', 'pay.markPaid': 'تأدية', 'pay.markUnpaid': 'إلغاء التأدية',
        'pay.note': 'التكاليف الاجتماعية للمشغّل التقديرية: <strong>{p}</strong> — التكلفة الإجمالية للمشغّل: <strong>{t}</strong>. حسابات استرشادية (قانون المالية 2025).',
        'leave.add': '+ طلب جديد', 'leave.new': 'طلب عطلة جديد', 'leave.requests': 'طلبات العطل',
        'leave.balances': 'أرصدة العطل السنوية (1,5 يوم/شهر — مدونة الشغل)', 'leave.th.type': 'النوع', 'leave.th.duration': 'المدة',
        'leave.th.acquired': 'المكتسب', 'leave.th.taken': 'المأخوذ ({y})', 'leave.th.balance': 'الرصيد', 'leave.approve': 'موافقة', 'leave.refuse': 'رفض',
        'leave.f.emp': 'الأجير', 'leave.f.type': 'النوع', 'leave.f.from': 'من', 'leave.f.to': 'إلى',
        'leave.type.annuel': 'عطلة سنوية', 'leave.type.maladie': 'مرض', 'leave.type.exceptionnel': 'استثنائية', 'leave.type.sanssolde': 'بدون أجر',
        'decl.title': 'تتبع التصريحات الشهرية',
        'decl.hint': 'CNSS عبر DAMANCOM · الضريبة على الدخل عبر SIMPL-IR · الضريبة على القيمة المضافة عبر SIMPL-TVA. ضع علامة عند إيداع التصريح.',
        'decl.th.month': 'الشهر', 'decl.th.cnss': 'CNSS / AMO', 'decl.th.ir': 'الضريبة على الدخل', 'decl.th.tva': 'الضريبة على القيمة المضافة',
        'decl.before10': 'قبل يوم 10', 'decl.before20': '(قبل يوم 20)', 'decl.done': 'مصرَّح بها', 'decl.todo': 'لم تُودَع',
        'cli.add': '+ زبون جديد', 'cli.new': 'زبون جديد', 'cli.search': 'البحث عن زبون…',
        'cli.th.client': 'الزبون', 'cli.th.contact': 'جهة الاتصال', 'cli.th.city': 'المدينة', 'cli.th.ca': 'إجمالي المعاملات', 'cli.th.due': 'المتبقي',
        'cli.f.nom': 'الاسم التجاري', 'cli.f.contact': 'جهة الاتصال', 'cli.f.tel': 'الهاتف', 'cli.f.adresse': 'المدينة / العنوان',
        'cli.blocked': 'غير ممكن: توجد فواتير مرتبطة بهذا الزبون.',
        'inv.add': '+ فاتورة جديدة', 'inv.new': 'فاتورة جديدة', 'inv.search': 'البحث عن فاتورة…',
        'inv.kpi.total': 'إجمالي الفواتير', 'inv.kpi.paid': 'المحصَّل', 'inv.kpi.due': 'المتبقي للتحصيل',
        'inv.th.num': 'الرقم', 'inv.th.product': 'المنتج', 'inv.pay': 'تحصيل',
        'inv.f.num': 'رقم الفاتورة', 'inv.f.client': 'الزبون', 'inv.f.product': 'المنتج', 'inv.f.qty': 'الكمية (طن)',
        'inv.f.pu': 'الثمن للطن (درهم)', 'inv.f.paid': 'المبلغ المؤدى (درهم)', 'inv.needClient': 'أنشئ زبوناً أولاً.',
        'inv.statut.impayee': 'غير مؤداة', 'inv.statut.partielle': 'مؤداة جزئياً', 'inv.statut.payee': 'مؤداة',
        'sup.add': '+ مورد جديد', 'sup.new': 'مورد جديد', 'sup.search': 'البحث عن مورد…',
        'sup.th.name': 'المورد', 'sup.th.cat': 'الفئة', 'sup.th.total': 'إجمالي المشتريات', 'sup.th.due': 'واجب الأداء',
        'sup.blocked': 'غير ممكن: توجد مصاريف مرتبطة بهذا المورد.',
        'exp.add': '+ مصروف جديد', 'exp.new': 'مصروف جديد', 'exp.edit': 'تعديل المصروف', 'exp.search': 'البحث عن مصروف…',
        'exp.kpi.month': 'المصاريف — {m}', 'exp.kpi.due': 'ديون الموردين (واجبة الأداء)',
        'exp.th.cat': 'الفئة', 'exp.th.desc': 'الوصف', 'exp.th.supplier': 'المورد',
        'exp.f.desc': 'الوصف', 'exp.f.supplier': 'المورد', 'exp.f.none': '— بدون —',
        'exp.cat.Carburant': 'الوقود', 'exp.cat.Maintenance': 'الصيانة', 'exp.cat.Pièces de rechange': 'قطع الغيار',
        'exp.cat.Explosifs & minage': 'المتفجرات والتفجير', 'exp.cat.Électricité': 'الكهرباء', 'exp.cat.Transport': 'النقل',
        'exp.cat.Loyers & redevances': 'الكراء والإتاوات', 'exp.cat.Assurances': 'التأمينات', 'exp.cat.Fournitures': 'اللوازم', 'exp.cat.Autre': 'أخرى',
        'ct.add': '+ عقد جديد', 'ct.new': 'عقد جديد', 'ct.edit': 'تعديل العقد',
        'ct.list': 'عقود الزبناء والموردين', 'ct.cdd': 'عقود الأجراء محددة المدة (CDD / ANAPEC)',
        'ct.th.type': 'النوع', 'ct.th.party': 'الطرف', 'ct.th.object': 'الموضوع', 'ct.expiresIn': 'ينتهي بعد {j} يوم', 'ct.daysLeft': 'بقي {j} يوم',
        'ct.f.type': 'النوع', 'ct.f.party': 'الطرف (الشركة)', 'ct.f.object': 'موضوع العقد', 'ct.f.start': 'البداية', 'ct.f.end': 'النهاية', 'ct.f.amount': 'المبلغ (درهم)',
        'ct.type.Client': 'زبون', 'ct.type.Fournisseur': 'مورد', 'ct.type.Autre': 'آخر',
        'acc.period': 'الفترة:', 'acc.kpi.collected': 'الضريبة المحصَّلة (المبيعات)', 'acc.kpi.deductible': 'الضريبة القابلة للاسترجاع (المشتريات)',
        'acc.kpi.due': 'الضريبة الواجبة (SIMPL-TVA)', 'acc.kpi.credit': 'فائض الضريبة', 'acc.kpi.result': 'النتيجة التقديرية — {m}',
        'acc.journal': 'اليومية المحاسبية (المخطط المحاسبي المغربي CGNC) — {m}',
        'acc.hint': 'قيود مولَّدة تلقائياً من الفوترة والمصاريف والأجور. مبالغ استرشادية.',
        'acc.th.piece': 'التاريخ / الوثيقة', 'acc.th.label': 'البيان', 'acc.th.account': 'الحساب (CGNC)', 'acc.th.debit': 'مدين', 'acc.th.credit': 'دائن', 'acc.totals': 'المجاميع',
        'acc.e.sale': 'بيع {p} — {c}', 'acc.e.cashin': 'تحصيل {c}', 'acc.e.payroll': 'أجور المستخدمين — {m}',
        'acc.a.clients': '3421 الزبناء', 'acc.a.sales': '7121 مبيعات المنتجات', 'acc.a.tvaOut': '4455 الدولة — الضريبة المفوترة',
        'acc.a.bank': '5141 البنك', 'acc.a.purchases': '6121 مشتريات المواد واللوازم', 'acc.a.tvaIn': '3455 الدولة — الضريبة القابلة للاسترجاع',
        'acc.a.suppliers': '4411 الموردون', 'acc.a.wages': '6171 أجور المستخدمين', 'acc.a.social': '6174 التكاليف الاجتماعية للمشغّل',
        'acc.a.cnss': '4441 CNSS / AMO', 'acc.a.ir': '44525 الدولة — الضريبة على الدخل', 'acc.a.bankNet': '5141 البنك (الصافي المؤدى)',
        'mode.demo': 'وضع تجريبي (بيانات محلية)', 'mode.cloud': 'متصل', 'sync.refresh': 'تحديث'
    }
};

let lang = localStorage.getItem('carriere-lang') === 'ar' ? 'ar' : 'fr';

function t(key, params) {
    let s = I18N[lang][key] ?? I18N.fr[key] ?? key;
    if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v);
    return s;
}

const MONTHS = {
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر']
};

const EXPENSE_CATEGORIES = ['Carburant', 'Maintenance', 'Pièces de rechange', 'Explosifs & minage', 'Électricité', 'Transport', 'Loyers & redevances', 'Assurances', 'Fournitures', 'Autre'];

// ============================================
// Données de démonstration (mode local uniquement)
// ============================================

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
            { id: 'ct1', type: 'Client', partie: 'BTP Atlas Construction', objet: 'Fourniture annuelle GNT — marché Sefrou', debut: `${y}-01-01`, fin: `${y}-12-31`, montant: 480000, statut: 'actif' },
            { id: 'ct2', type: 'Fournisseur', partie: 'Maroc Explosifs SA', objet: 'Approvisionnement explosifs & tirs', debut: `${y}-01-01`, fin: `${y}-06-30`, montant: 90000, statut: 'actif' }
        ],
        payroll: {},
        declarations: {}
    };
}

// ============================================
// Helpers
// ============================================

let db; // référence vers store.db, initialisée au boot

const $ = (sel) => document.querySelector(sel);

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtMAD(n) {
    return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + t('mad');
}

function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + (String(iso).length === 10 ? 'T00:00:00' : ''));
    return isNaN(d) ? '—' : d.toLocaleDateString('fr-FR');
}

function monthKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
    const [y, m] = key.split('-');
    return `${MONTHS[lang][Number(m) - 1]} ${y}`;
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
function statusBadge(cls, key) { return `<span class="status-badge ${cls}">${t(key)}</span>`; }

// ---------- Paie ----------

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

function payrollTotals() {
    const totals = { brut: 0, cnss: 0, amo: 0, ir: 0, net: 0, patronal: 0 };
    activeEmployees().forEach(e => {
        const p = calcPay(e.salaire);
        totals.brut += p.brut; totals.cnss += p.cnss; totals.amo += p.amo;
        totals.ir += p.ir; totals.net += p.net; totals.patronal += p.patronal;
    });
    return totals;
}

function leaveBalance(emp) {
    const start = new Date(emp.dateEmbauche);
    const now = new Date();
    const months = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth());
    const acquired = Math.min(18, months * 1.5);
    const currentYear = now.getFullYear();
    const taken = db.leaves
        .filter(l => l.empId === emp.id && l.statut === 'approuve' && l.type === 'Congé annuel' && String(l.du).startsWith(String(currentYear)))
        .reduce((s, l) => s + leaveDays(l), 0);
    return { acquired: Math.round(acquired * 10) / 10, taken };
}

// ---------- CSV ----------

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

function openModal(title, formHTML, onSubmit) {
    const modal = $('#modal');
    $('#modal-title').textContent = title;
    const form = $('#modal-form');
    form.innerHTML = formHTML + `
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" data-close>${t('cancel')}</button>
        <button type="submit" class="btn btn-primary">${t('save')}</button>
      </div>`;
    modal.hidden = false;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        closeModal();
        await onSubmit(data);
        render();
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
            return `<option value="${esc(val)}" ${String(val) === String(value ?? '') ? 'selected' : ''}>${esc(lab)}</option>`;
        }).join('')}
        </select>`;
    } else {
        input = `<input class="form-input" type="${type}" name="${name}" value="${esc(value ?? '')}" ${required ? 'required' : ''} ${step ? `step="${step}"` : ''} placeholder="${esc(placeholder)}">`;
    }
    return `<div class="form-group ${half ? 'half' : ''}">
        <label class="form-label">${esc(label)}</label>${input}
    </div>`;
}

// ============================================
// Impression (documents en français — usage légal)
// ============================================

function printHTML(html) {
    $('#print-area').innerHTML = html;
    window.print();
}

function companyHeaderHTML() {
    return `
      <div class="p-head" dir="ltr">
        <div><div class="p-brand">HH</div></div>
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
    const frMonth = `${MONTHS.fr[Number(month.split('-')[1]) - 1]} ${month.split('-')[0]}`;
    const mad = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' MAD';
    printHTML(`
      ${companyHeaderHTML()}
      <div dir="ltr">
      <h2 class="p-title">Bulletin de paie — ${frMonth}</h2>
      <table class="p-table p-info">
        <tr><td><strong>Salarié :</strong> ${esc(e.nom)}</td><td><strong>Matricule :</strong> ${esc(e.matricule)}</td></tr>
        <tr><td><strong>CIN :</strong> ${esc(e.cin)}</td><td><strong>N° CNSS :</strong> ${esc(e.cnss)}</td></tr>
        <tr><td><strong>Poste :</strong> ${esc(e.poste)}</td><td><strong>Contrat :</strong> ${esc(e.contrat)} — embauché le ${fmtDate(e.dateEmbauche)}</td></tr>
      </table>
      <table class="p-table">
        <thead><tr><th>Rubrique</th><th>Base</th><th>Taux</th><th>Retenue</th><th>Montant</th></tr></thead>
        <tbody>
          <tr><td>Salaire de base</td><td>${mad(p.brut)}</td><td>—</td><td>—</td><td>${mad(p.brut)}</td></tr>
          <tr><td>CNSS (part salariale)</td><td>${mad(Math.min(p.brut, CNSS_PLAFOND))}</td><td>4,48 %</td><td>${mad(p.cnss)}</td><td>—</td></tr>
          <tr><td>AMO (part salariale)</td><td>${mad(p.brut)}</td><td>2,26 %</td><td>${mad(p.amo)}</td><td>—</td></tr>
          <tr><td>Impôt sur le revenu (IR)</td><td>${mad(p.imposable)}</td><td>Barème</td><td>${mad(p.ir)}</td><td>—</td></tr>
        </tbody>
        <tfoot><tr><th colspan="4">Net à payer</th><th>${mad(p.net)}</th></tr></tfoot>
      </table>
      <p class="p-note">Calcul indicatif selon barème IR (LF 2025), CNSS 4,48 % (plafond 6 000 MAD), AMO 2,26 %.</p>
      <div class="p-sign"><div>Signature de l'employeur</div><div>Signature du salarié</div></div>
      </div>`);
}

function printInvoice(id) {
    const f = db.invoices.find(x => x.id === id);
    if (!f) return;
    const c = db.clients.find(x => x.id === f.clientId);
    const mad = (n) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' MAD';
    printHTML(`
      ${companyHeaderHTML()}
      <div dir="ltr">
      <h2 class="p-title">Facture N° ${esc(f.num)}</h2>
      <table class="p-table p-info">
        <tr><td><strong>Date :</strong> ${fmtDate(f.date)}</td><td><strong>Client :</strong> ${esc(c?.nom || '—')}</td></tr>
        <tr><td><strong>ICE client :</strong> ${esc(c?.ice || '—')}</td><td><strong>Adresse :</strong> ${esc(c?.adresse || '—')}</td></tr>
      </table>
      <table class="p-table">
        <thead><tr><th>Désignation</th><th>Quantité (T)</th><th>P.U. HT</th><th>Montant HT</th></tr></thead>
        <tbody>
          <tr><td>${esc(f.produit)}</td><td>${esc(f.quantite)}</td><td>${mad(f.pu)}</td><td>${mad(invoiceHT(f))}</td></tr>
        </tbody>
        <tfoot>
          <tr><td colspan="3">Total HT</td><td>${mad(invoiceHT(f))}</td></tr>
          <tr><td colspan="3">TVA 20 %</td><td>${mad(invoiceTVA(f))}</td></tr>
          <tr><th colspan="3">Total TTC</th><th>${mad(invoiceTTC(f))}</th></tr>
        </tfoot>
      </table>
      <p class="p-note">Arrêtée la présente facture à la somme de : <strong>${mad(invoiceTTC(f))}</strong> toutes taxes comprises.</p>
      <div class="p-sign"><div>Cachet & signature</div><div></div></div>
      </div>`);
}

// ============================================
// Vues
// ============================================

const VIEWS = ['dashboard', 'employees', 'payroll', 'leaves', 'declarations', 'clients', 'invoices', 'suppliers', 'expenses', 'contracts', 'accounting'];

const state = {
    view: 'dashboard',
    payrollMonth: monthKey(),
    accountingMonth: monthKey(),
    search: ''
};

function render() {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Sidebar
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('.nav-item[data-view]').forEach(a => {
        a.classList.toggle('active', a.dataset.view === state.view);
    });

    $('#view-title').textContent = t('title.' + state.view);
    $('#lang-text').textContent = lang === 'fr' ? 'العربية' : 'Français';
    $('#header-date').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const renderer = {
        dashboard: renderDashboard, employees: renderEmployees, payroll: renderPayroll,
        leaves: renderLeaves, declarations: renderDeclarations, clients: renderClients,
        invoices: renderInvoices, suppliers: renderSuppliers, expenses: renderExpenses,
        contracts: renderContracts, accounting: renderAccounting
    }[state.view] || renderDashboard;
    $('#view').innerHTML = renderer();
}

// ---------- Tableau de bord ----------

function renderDashboard() {
    const month = monthKey();
    const totals = payrollTotals();
    const caMois = db.invoices.filter(f => String(f.date).startsWith(month)).reduce((s, f) => s + invoiceTTC(f), 0);
    const impayes = db.invoices.reduce((s, f) => s + invoiceReste(f), 0);
    const depensesMois = db.expenses.filter(d => String(d.date).startsWith(month)).reduce((s, d) => s + Number(d.montant), 0);

    const alerts = [];
    db.employees.filter(e => e.statut === 'actif' && e.finContrat).forEach(e => {
        const d = daysUntil(e.finContrat);
        if (d < 0) alerts.push({ icon: '🔴', text: t('alert.empContractExpired', { c: esc(e.contrat), n: esc(e.nom), d: fmtDate(e.finContrat) }) });
        else if (d <= 30) alerts.push({ icon: '⚠️', text: t('alert.empContractSoon', { c: esc(e.contrat), n: esc(e.nom), j: d, d: fmtDate(e.finContrat) }) });
    });
    db.contracts.filter(c => c.statut === 'actif').forEach(c => {
        const d = daysUntil(c.fin);
        if (d >= 0 && d <= 30) alerts.push({ icon: '⚠️', text: t('alert.contractSoon', { t: t('ct.type.' + c.type), o: esc(c.objet), j: d }) });
    });
    const prevMonth = lastMonths(2)[0];
    const decl = db.declarations[prevMonth] || {};
    if (!decl.cnss) alerts.push({ icon: '📑', text: t('alert.cnss', { m: monthLabel(prevMonth) }) });
    if (!decl.tva) alerts.push({ icon: '📑', text: t('alert.tva', { m: monthLabel(prevMonth) }) });
    db.invoices.filter(f => invoiceReste(f) > 0 && daysUntil(f.date) < -30).forEach(f => {
        alerts.push({ icon: '💰', text: t('alert.invoiceLate', { n: esc(f.num), c: esc(clientName(f.clientId)), r: fmtMAD(invoiceReste(f)) }) });
    });

    const months = lastMonths(6);
    const series = months.map(mk => {
        const ca = db.invoices.filter(f => String(f.date).startsWith(mk)).reduce((s, f) => s + invoiceTTC(f), 0);
        const dep = db.expenses.filter(d => String(d.date).startsWith(mk)).reduce((s, d) => s + Number(d.montant), 0)
            + (Object.keys(db.payroll[mk] || {}).length ? payrollTotals().net : 0);
        return { mk, ca, dep };
    });
    const maxVal = Math.max(1, ...series.flatMap(s => [s.ca, s.dep]));

    return `
      <div class="stats-grid">
        ${kpi('👥', t('kpi.headcount'), activeEmployees().length)}
        ${kpi('💵', t('kpi.netPayroll'), fmtMAD(totals.net))}
        ${kpi('🧾', t('kpi.revenue', { m: monthLabel(month) }), fmtMAD(caMois))}
        ${kpi('⏳', t('kpi.receivables'), fmtMAD(impayes))}
        ${kpi('💸', t('kpi.expenses', { m: monthLabel(month) }), fmtMAD(depensesMois))}
        ${kpi('🏦', t('kpi.employerCost'), fmtMAD(totals.brut + totals.patronal))}
      </div>

      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h3>${t('dash.alerts')}</h3></div>
          ${alerts.length ? `<ul class="alert-list">${alerts.map(a => `<li><span>${a.icon}</span><div>${a.text}</div></li>`).join('')}</ul>`
            : `<p class="empty">${t('dash.noAlert')}</p>`}
        </div>

        <div class="panel">
          <div class="panel-head"><h3>${t('dash.chart')}</h3></div>
          <div class="chart">
            ${series.map(s => `
              <div class="chart-col">
                <div class="chart-bars">
                  <div class="bar bar-ca" style="height:${Math.round(s.ca / maxVal * 100)}%" title="${fmtMAD(s.ca)}"></div>
                  <div class="bar bar-dep" style="height:${Math.round(s.dep / maxVal * 100)}%" title="${fmtMAD(s.dep)}"></div>
                </div>
                <span class="chart-label">${MONTHS[lang][Number(s.mk.split('-')[1]) - 1].slice(0, 5)}</span>
              </div>`).join('')}
          </div>
          <div class="chart-legend">
            <span><i class="dot dot-ca"></i> ${t('dash.legend.ca')}</span>
            <span><i class="dot dot-dep"></i> ${t('dash.legend.out')}</span>
          </div>
        </div>
      </div>`;
}

function kpi(icon, label, value) {
    return `
      <div class="stat-card">
        <div class="stat-icon">${icon}</div>
        <div class="stat-info"><h3>${label}</h3><div class="value">${value}</div></div>
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
                ? (d < 0 ? statusBadge('status-error', 'status.expire')
                    : d <= 30 ? `<span class="status-badge status-warning">${t('emp.endDays', { j: d })}</span>`
                        : `<span class="status-badge status-success">${esc(e.contrat)}</span>`)
                : `<span class="status-badge status-success">${esc(e.contrat)}</span>`;
            return `<tr>
              <td>${esc(e.matricule)}</td>
              <td><strong>${esc(e.nom)}</strong><br><small>${esc(e.cin)} · CNSS ${esc(e.cnss)}</small></td>
              <td>${esc(e.poste)}</td>
              <td>${contratBadge}</td>
              <td>${fmtDate(e.dateEmbauche)}</td>
              <td>${fmtMAD(e.salaire)}</td>
              <td>${e.statut === 'actif' ? statusBadge('status-success', 'status.actif') : statusBadge('status-error', 'status.sorti')}</td>
              <td class="row-actions">
                <button class="icon-btn" title="${t('edit')}" data-action="edit-employee" data-id="${e.id}">✏️</button>
                <button class="icon-btn" title="${t('delete')}" data-action="delete-employee" data-id="${e.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar(t('emp.search'), [
        `<button class="btn btn-ghost" data-action="export-employees">${t('export')}</button>`,
        `<button class="btn btn-primary" data-action="add-employee">${t('emp.add')}</button>`
    ])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('emp.th.matricule')}</th><th>${t('emp.th.name')}</th><th>${t('emp.th.poste')}</th><th>${t('emp.th.contrat')}</th><th>${t('emp.th.hire')}</th><th>${t('emp.th.salary')}</th><th>${t('th.statut')}</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(8)}</tbody>
        </table>
      </div>`;
}

function employeeForm(e = {}) {
    return `<div class="form-grid">
      ${field(t('emp.f.nom'), 'nom', { value: e.nom, half: true })}
      ${field(t('emp.f.cin'), 'cin', { value: e.cin, half: true })}
      ${field(t('emp.f.cnss'), 'cnss', { value: e.cnss, half: true, required: false })}
      ${field(t('emp.f.poste'), 'poste', { value: e.poste, half: true })}
      ${field(t('emp.f.contrat'), 'contrat', { value: e.contrat || 'CDI', options: ['CDI', 'CDD', 'ANAPEC', 'Intérim'], half: true })}
      ${field(t('emp.f.salaire'), 'salaire', { value: e.salaire, type: 'number', step: '0.01', half: true })}
      ${field(t('emp.f.embauche'), 'dateEmbauche', { value: e.dateEmbauche, type: 'date', half: true })}
      ${field(t('emp.f.fin'), 'finContrat', { value: e.finContrat, type: 'date', required: false, half: true })}
      ${field(t('emp.f.statut'), 'statut', { value: e.statut || 'actif', options: [['actif', t('status.actif')], ['sorti', t('status.sorti')]], half: true })}
    </div>`;
}

// ---------- Paie ----------

function renderPayroll() {
    const month = state.payrollMonth;
    const paid = db.payroll[month] || {};
    const totals = payrollTotals();

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
          <td>${isPaid ? statusBadge('status-success', 'status.paye') : statusBadge('status-warning', 'status.attente')}</td>
          <td class="row-actions">
            <button class="icon-btn" title="${t('pay.bulletin')}" data-action="print-bulletin" data-id="${e.id}">🖨️</button>
            <button class="icon-btn" title="${isPaid ? t('pay.markUnpaid') : t('pay.markPaid')}" data-action="toggle-paid" data-id="${e.id}">${isPaid ? '↩️' : '✅'}</button>
          </td>
        </tr>`;
    }).join('');

    return `
      <div class="toolbar">
        <label class="month-picker">${t('pay.month')}
          <input type="month" class="form-input" id="payroll-month" value="${month}">
        </label>
        <div class="toolbar-actions">
          <button class="btn btn-ghost" data-action="export-payroll">${t('export')}</button>
          <button class="btn btn-primary" data-action="pay-all">${t('pay.payAll')}</button>
        </div>
      </div>

      <div class="stats-grid">
        ${kpi('💰', t('pay.totBrut'), fmtMAD(totals.brut))}
        ${kpi('🏥', t('pay.totCnss'), fmtMAD(totals.cnss + totals.amo))}
        ${kpi('🏛️', t('pay.totIR'), fmtMAD(totals.ir))}
        ${kpi('💵', t('pay.totNet'), fmtMAD(totals.net))}
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('pay.th.emp')}</th><th>${t('pay.th.brut')}</th><th>CNSS 4,48 %</th><th>AMO 2,26 %</th><th>IR</th><th>${t('pay.th.net')}</th><th>${t('th.statut')}</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(8)}</tbody>
          <tfoot><tr><th>${t('pay.totals')}</th><th>${fmtMAD(totals.brut)}</th><th>${fmtMAD(totals.cnss)}</th><th>${fmtMAD(totals.amo)}</th><th>${fmtMAD(totals.ir)}</th><th>${fmtMAD(totals.net)}</th><th colspan="2"></th></tr></tfoot>
        </table>
      </div>
      <p class="hint-note">${t('pay.note', { p: fmtMAD(totals.patronal), t: fmtMAD(totals.brut + totals.patronal) })}</p>`;
}

// ---------- Congés ----------

function renderLeaves() {
    const typeLabel = (type) => {
        const key = { 'Congé annuel': 'leave.type.annuel', 'Maladie': 'leave.type.maladie', 'Exceptionnel': 'leave.type.exceptionnel', 'Sans solde': 'leave.type.sanssolde' }[type];
        return key ? t(key) : type;
    };
    const rows = db.leaves
        .slice().sort((a, b) => String(b.du).localeCompare(String(a.du)))
        .map(l => {
            const e = employee(l.empId);
            const badge = { approuve: ['status-success', 'status.approuve'], attente: ['status-warning', 'status.attente'], refuse: ['status-error', 'status.refuse'] }[l.statut] || ['status-warning', 'status.attente'];
            return `<tr>
              <td><strong>${esc(e?.nom || '—')}</strong></td>
              <td>${typeLabel(l.type)}</td>
              <td>${fmtDate(l.du)} → ${fmtDate(l.au)}</td>
              <td>${leaveDays(l)} j</td>
              <td>${statusBadge(badge[0], badge[1])}</td>
              <td class="row-actions">
                ${l.statut === 'attente' ? `
                  <button class="icon-btn" title="${t('leave.approve')}" data-action="approve-leave" data-id="${l.id}">✅</button>
                  <button class="icon-btn" title="${t('leave.refuse')}" data-action="refuse-leave" data-id="${l.id}">❌</button>` : ''}
                <button class="icon-btn" title="${t('delete')}" data-action="delete-leave" data-id="${l.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    const balances = activeEmployees().map(e => {
        const b = leaveBalance(e);
        return `<tr><td>${esc(e.nom)}</td><td>${b.acquired} j</td><td>${b.taken} j</td><td><strong>${Math.max(0, b.acquired - b.taken).toFixed(1)} j</strong></td></tr>`;
    }).join('');

    return `
      ${toolbar(null, [`<button class="btn btn-primary" data-action="add-leave">${t('leave.add')}</button>`])}
      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h3>${t('leave.requests')}</h3></div>
          <div class="table-container flat">
            <table class="data-table">
              <thead><tr><th>${t('pay.th.emp')}</th><th>${t('leave.th.type')}</th><th>${t('th.periode')}</th><th>${t('leave.th.duration')}</th><th>${t('th.statut')}</th><th></th></tr></thead>
              <tbody>${rows || emptyRow(6)}</tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>${t('leave.balances')}</h3></div>
          <div class="table-container flat">
            <table class="data-table">
              <thead><tr><th>${t('pay.th.emp')}</th><th>${t('leave.th.acquired')}</th><th>${t('leave.th.taken', { y: new Date().getFullYear() })}</th><th>${t('leave.th.balance')}</th></tr></thead>
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
        const totals = payrollTotals();
        const tva = tvaSummary(mk);
        return `<tr>
          <td><strong>${monthLabel(mk)}</strong></td>
          <td>${checkbox(mk, 'cnss', d.cnss)} <small>${t('decl.before10')}</small></td>
          <td>${checkbox(mk, 'ir', d.ir)} <small>${fmtMAD(totals.ir)}</small></td>
          <td>${checkbox(mk, 'tva', d.tva)} <small>${fmtMAD(Math.max(0, tva.due))} ${t('decl.before20')}</small></td>
        </tr>`;
    }).join('');

    return `
      <div class="panel">
        <div class="panel-head">
          <h3>${t('decl.title')}</h3>
          <p class="hint-note">${t('decl.hint')}</p>
        </div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>${t('decl.th.month')}</th><th>${t('decl.th.cnss')}</th><th>${t('decl.th.ir')}</th><th>${t('decl.th.tva')}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
}

function checkbox(month, kind, checked) {
    return `<label class="check">
      <input type="checkbox" data-action="toggle-declaration" data-month="${month}" data-kind="${kind}" ${checked ? 'checked' : ''}>
      <span>${checked ? t('decl.done') : t('decl.todo')}</span>
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
              <td>${esc(c.contact)}<br><small dir="ltr">${esc(c.tel)}</small></td>
              <td>${esc(c.adresse || '—')}</td>
              <td>${fmtMAD(ca)}</td>
              <td>${reste > 0 ? `<span class="status-badge status-warning">${fmtMAD(reste)}</span>` : statusBadge('status-success', 'status.solde')}</td>
              <td class="row-actions">
                <button class="icon-btn" title="${t('edit')}" data-action="edit-client" data-id="${c.id}">✏️</button>
                <button class="icon-btn" title="${t('delete')}" data-action="delete-client" data-id="${c.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar(t('cli.search'), [`<button class="btn btn-primary" data-action="add-client">${t('cli.add')}</button>`])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('cli.th.client')}</th><th>${t('cli.th.contact')}</th><th>${t('cli.th.city')}</th><th>${t('cli.th.ca')}</th><th>${t('cli.th.due')}</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(6)}</tbody>
        </table>
      </div>`;
}

function clientForm(c = {}) {
    return `<div class="form-grid">
      ${field(t('cli.f.nom'), 'nom', { value: c.nom })}
      ${field('ICE', 'ice', { value: c.ice, half: true, required: false })}
      ${field(t('cli.f.contact'), 'contact', { value: c.contact, half: true, required: false })}
      ${field(t('cli.f.tel'), 'tel', { value: c.tel, half: true, required: false })}
      ${field('Email', 'email', { value: c.email, type: 'email', half: true, required: false })}
      ${field(t('cli.f.adresse'), 'adresse', { value: c.adresse, required: false })}
    </div>`;
}

// ---------- Factures ----------

function renderInvoices() {
    const q = state.search.toLowerCase();
    const rows = db.invoices
        .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .filter(f => !q || `${f.num} ${clientName(f.clientId)} ${f.produit}`.toLowerCase().includes(q))
        .map(f => {
            const badge = { payee: ['status-success', 'status.payee'], impayee: ['status-error', 'status.impayee'], partielle: ['status-warning', 'status.partielle'] }[f.statut];
            return `<tr>
              <td><strong>${esc(f.num)}</strong></td>
              <td>${esc(clientName(f.clientId))}</td>
              <td>${fmtDate(f.date)}</td>
              <td>${esc(f.produit)}<br><small>${esc(f.quantite)} T × ${fmtMAD(f.pu)}</small></td>
              <td>${fmtMAD(invoiceHT(f))}</td>
              <td><strong>${fmtMAD(invoiceTTC(f))}</strong></td>
              <td>${statusBadge(badge[0], badge[1])}${invoiceReste(f) > 0 ? `<br><small>${t('reste')} ${fmtMAD(invoiceReste(f))}</small>` : ''}</td>
              <td class="row-actions">
                <button class="icon-btn" title="${t('print')}" data-action="print-invoice" data-id="${f.id}">🖨️</button>
                <button class="icon-btn" title="${t('inv.pay')}" data-action="pay-invoice" data-id="${f.id}">💰</button>
                <button class="icon-btn" title="${t('edit')}" data-action="edit-invoice" data-id="${f.id}">✏️</button>
                <button class="icon-btn" title="${t('delete')}" data-action="delete-invoice" data-id="${f.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    const totalTTC = db.invoices.reduce((s, f) => s + invoiceTTC(f), 0);
    const totalReste = db.invoices.reduce((s, f) => s + invoiceReste(f), 0);

    return `
      ${toolbar(t('inv.search'), [
        `<button class="btn btn-ghost" data-action="export-invoices">${t('export')}</button>`,
        `<button class="btn btn-primary" data-action="add-invoice">${t('inv.add')}</button>`
    ])}
      <div class="stats-grid">
        ${kpi('🧾', t('inv.kpi.total'), fmtMAD(totalTTC))}
        ${kpi('✅', t('inv.kpi.paid'), fmtMAD(totalTTC - totalReste))}
        ${kpi('⏳', t('inv.kpi.due'), fmtMAD(totalReste))}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('inv.th.num')}</th><th>${t('cli.th.client')}</th><th>${t('th.date')}</th><th>${t('inv.th.product')}</th><th>HT</th><th>TTC</th><th>${t('th.statut')}</th><th></th></tr></thead>
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
      ${field(t('inv.f.num'), 'num', { value: f.num || nextInvoiceNum(), half: true })}
      ${field(t('th.date'), 'date', { value: f.date || new Date().toISOString().slice(0, 10), type: 'date', half: true })}
      ${field(t('inv.f.client'), 'clientId', { value: f.clientId, options: db.clients.map(c => [c.id, c.nom]) })}
      ${field(t('inv.f.product'), 'produit', { value: f.produit || PRODUCTS[0], options: PRODUCTS, half: true })}
      ${field(t('inv.f.qty'), 'quantite', { value: f.quantite, type: 'number', step: '0.01', half: true })}
      ${field(t('inv.f.pu'), 'pu', { value: f.pu, type: 'number', step: '0.01', half: true })}
      ${field(t('th.statut'), 'statut', { value: f.statut || 'impayee', options: [['impayee', t('inv.statut.impayee')], ['partielle', t('inv.statut.partielle')], ['payee', t('inv.statut.payee')]], half: true })}
      ${field(t('inv.f.paid'), 'montantRegle', { value: f.montantRegle || 0, type: 'number', step: '0.01', required: false, half: true })}
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
              <td>${t('exp.cat.' + s.categorie) !== 'exp.cat.' + s.categorie ? t('exp.cat.' + s.categorie) : esc(s.categorie)}</td>
              <td>${esc(s.contact || '—')}<br><small dir="ltr">${esc(s.tel || '')}</small></td>
              <td>${fmtMAD(total)}</td>
              <td>${aPayer > 0 ? `<span class="status-badge status-warning">${fmtMAD(aPayer)}</span>` : statusBadge('status-success', 'status.solde')}</td>
              <td class="row-actions">
                <button class="icon-btn" title="${t('edit')}" data-action="edit-supplier" data-id="${s.id}">✏️</button>
                <button class="icon-btn" title="${t('delete')}" data-action="delete-supplier" data-id="${s.id}">🗑️</button>
              </td>
            </tr>`;
        }).join('');

    return `
      ${toolbar(t('sup.search'), [`<button class="btn btn-primary" data-action="add-supplier">${t('sup.add')}</button>`])}
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('sup.th.name')}</th><th>${t('sup.th.cat')}</th><th>${t('cli.th.contact')}</th><th>${t('sup.th.total')}</th><th>${t('sup.th.due')}</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(6)}</tbody>
        </table>
      </div>`;
}

function supplierForm(s = {}) {
    return `<div class="form-grid">
      ${field(t('cli.f.nom'), 'nom', { value: s.nom })}
      ${field(t('sup.th.cat'), 'categorie', { value: s.categorie || EXPENSE_CATEGORIES[0], options: EXPENSE_CATEGORIES.map(c => [c, t('exp.cat.' + c)]), half: true })}
      ${field('ICE', 'ice', { value: s.ice, half: true, required: false })}
      ${field(t('cli.f.contact'), 'contact', { value: s.contact, half: true, required: false })}
      ${field(t('cli.f.tel'), 'tel', { value: s.tel, half: true, required: false })}
      ${field('Email', 'email', { value: s.email, type: 'email', required: false })}
    </div>`;
}

// ---------- Dépenses ----------

function renderExpenses() {
    const q = state.search.toLowerCase();
    const month = monthKey();
    const rows = db.expenses
        .slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .filter(d => !q || `${d.categorie} ${d.description} ${supplierName(d.supplierId)}`.toLowerCase().includes(q))
        .map(d => `<tr>
          <td>${fmtDate(d.date)}</td>
          <td>${t('exp.cat.' + d.categorie) !== 'exp.cat.' + d.categorie ? t('exp.cat.' + d.categorie) : esc(d.categorie)}</td>
          <td>${esc(d.description)}</td>
          <td>${d.supplierId ? esc(supplierName(d.supplierId)) : '—'}</td>
          <td><strong>${fmtMAD(d.montant)}</strong></td>
          <td>${d.statut === 'payee' ? statusBadge('status-success', 'status.payee') : statusBadge('status-warning', 'status.a_payer')}</td>
          <td class="row-actions">
            <button class="icon-btn" data-action="toggle-expense" data-id="${d.id}">${d.statut === 'payee' ? '↩️' : '✅'}</button>
            <button class="icon-btn" title="${t('edit')}" data-action="edit-expense" data-id="${d.id}">✏️</button>
            <button class="icon-btn" title="${t('delete')}" data-action="delete-expense" data-id="${d.id}">🗑️</button>
          </td>
        </tr>`).join('');

    const totalMois = db.expenses.filter(d => String(d.date).startsWith(month)).reduce((s, d) => s + Number(d.montant), 0);
    const aPayer = db.expenses.filter(d => d.statut === 'a_payer').reduce((s, d) => s + Number(d.montant), 0);

    return `
      ${toolbar(t('exp.search'), [
        `<button class="btn btn-ghost" data-action="export-expenses">${t('export')}</button>`,
        `<button class="btn btn-primary" data-action="add-expense">${t('exp.add')}</button>`
    ])}
      <div class="stats-grid">
        ${kpi('💸', t('exp.kpi.month', { m: monthLabel(month) }), fmtMAD(totalMois))}
        ${kpi('⏳', t('exp.kpi.due'), fmtMAD(aPayer))}
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>${t('th.date')}</th><th>${t('exp.th.cat')}</th><th>${t('exp.th.desc')}</th><th>${t('exp.th.supplier')}</th><th>${t('th.montant')}</th><th>${t('th.statut')}</th><th></th></tr></thead>
          <tbody>${rows || emptyRow(7)}</tbody>
        </table>
      </div>`;
}

function expenseForm(d = {}) {
    return `<div class="form-grid">
      ${field(t('th.date'), 'date', { value: d.date || new Date().toISOString().slice(0, 10), type: 'date', half: true })}
      ${field(t('exp.th.cat'), 'categorie', { value: d.categorie || EXPENSE_CATEGORIES[0], options: EXPENSE_CATEGORIES.map(c => [c, t('exp.cat.' + c)]), half: true })}
      ${field(t('exp.f.desc'), 'description', { value: d.description })}
      ${field(t('exp.f.supplier'), 'supplierId', { value: d.supplierId || '', required: false, options: [['', t('exp.f.none')], ...db.suppliers.map(s => [s.id, s.nom])], half: true })}
      ${field(t('th.montant') + ' (' + t('mad') + ')', 'montant', { value: d.montant, type: 'number', step: '0.01', half: true })}
      ${field(t('th.statut'), 'statut', { value: d.statut || 'a_payer', options: [['a_payer', t('status.a_payer')], ['payee', t('status.payee')]], half: true })}
    </div>`;
}

// ---------- Contrats ----------

function renderContracts() {
    const rows = db.contracts
        .slice().sort((a, b) => String(a.fin).localeCompare(String(b.fin)))
        .map(c => {
            const d = daysUntil(c.fin);
            const badge = c.statut !== 'actif' ? statusBadge('status-error', 'status.cloture')
                : d < 0 ? statusBadge('status-error', 'status.expire')
                    : d <= 30 ? `<span class="status-badge status-warning">${t('ct.expiresIn', { j: d })}</span>`
                        : statusBadge('status-success', 'status.actif');
            return `<tr>
              <td><span class="status-badge ${c.type === 'Client' ? 'status-success' : 'status-warning'}">${t('ct.type.' + c.type)}</span></td>
              <td><strong>${esc(c.partie)}</strong></td>
              <td>${esc(c.objet)}</td>
              <td>${fmtDate(c.debut)} → ${fmtDate(c.fin)}</td>
              <td>${fmtMAD(c.montant)}</td>
              <td>${badge}</td>
              <td class="row-actions">
                <button class="icon-btn" title="${t('edit')}" data-action="edit-contract" data-id="${c.id}">✏️</button>
                <button class="icon-btn" title="${t('delete')}" data-action="delete-contract" data-id="${c.id}">🗑️</button>
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
              <td>${d < 0 ? statusBadge('status-error', 'status.expire') : d <= 30 ? `<span class="status-badge status-warning">${t('ct.daysLeft', { j: d })}</span>` : statusBadge('status-success', 'status.encours')}</td>
            </tr>`;
        }).join('');

    return `
      ${toolbar(null, [`<button class="btn btn-primary" data-action="add-contract">${t('ct.add')}</button>`])}
      <div class="panel">
        <div class="panel-head"><h3>${t('ct.list')}</h3></div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>${t('ct.th.type')}</th><th>${t('ct.th.party')}</th><th>${t('ct.th.object')}</th><th>${t('th.periode')}</th><th>${t('th.montant')}</th><th>${t('th.statut')}</th><th></th></tr></thead>
            <tbody>${rows || emptyRow(7)}</tbody>
          </table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>${t('ct.cdd')}</h3></div>
        <div class="table-container flat">
          <table class="data-table">
            <thead><tr><th>${t('pay.th.emp')}</th><th>${t('ct.th.type')}</th><th>${t('th.periode')}</th><th>${t('th.statut')}</th></tr></thead>
            <tbody>${cddRows || emptyRow(4)}</tbody>
          </table>
        </div>
      </div>`;
}

function contractForm(c = {}) {
    return `<div class="form-grid">
      ${field(t('ct.f.type'), 'type', { value: c.type || 'Client', options: [['Client', t('ct.type.Client')], ['Fournisseur', t('ct.type.Fournisseur')], ['Autre', t('ct.type.Autre')]], half: true })}
      ${field(t('ct.f.party'), 'partie', { value: c.partie, half: true })}
      ${field(t('ct.f.object'), 'objet', { value: c.objet })}
      ${field(t('ct.f.start'), 'debut', { value: c.debut, type: 'date', half: true })}
      ${field(t('ct.f.end'), 'fin', { value: c.fin, type: 'date', half: true })}
      ${field(t('ct.f.amount'), 'montant', { value: c.montant, type: 'number', step: '0.01', half: true, required: false })}
      ${field(t('th.statut'), 'statut', { value: c.statut || 'actif', options: [['actif', t('status.actif')], ['cloture', t('status.cloture')]], half: true })}
    </div>`;
}

// ---------- Comptabilité ----------

function tvaSummary(month) {
    const collectee = db.invoices.filter(f => String(f.date).startsWith(month)).reduce((s, f) => s + invoiceTVA(f), 0);
    const deductible = db.expenses.filter(d => String(d.date).startsWith(month))
        .reduce((s, d) => s + Number(d.montant) * TVA_RATE / (1 + TVA_RATE), 0);
    return { collectee, deductible, due: collectee - deductible };
}

function journalEntries(month) {
    const entries = [];
    db.invoices.filter(f => String(f.date).startsWith(month)).forEach(f => {
        entries.push({
            date: f.date, piece: f.num, libelle: t('acc.e.sale', { p: esc(f.produit), c: esc(clientName(f.clientId)) }),
            lines: [
                { compte: t('acc.a.clients'), debit: invoiceTTC(f), credit: 0 },
                { compte: t('acc.a.sales'), debit: 0, credit: invoiceHT(f) },
                { compte: t('acc.a.tvaOut'), debit: 0, credit: invoiceTVA(f) }
            ]
        });
        if (Number(f.montantRegle) > 0 || f.statut === 'payee') {
            const regle = f.statut === 'payee' ? invoiceTTC(f) : Number(f.montantRegle);
            entries.push({
                date: f.date, piece: f.num, libelle: t('acc.e.cashin', { c: esc(clientName(f.clientId)) }),
                lines: [
                    { compte: t('acc.a.bank'), debit: regle, credit: 0 },
                    { compte: t('acc.a.clients'), debit: 0, credit: regle }
                ]
            });
        }
    });
    db.expenses.filter(d => String(d.date).startsWith(month)).forEach(d => {
        const ht = Number(d.montant) / (1 + TVA_RATE);
        const tva = Number(d.montant) - ht;
        entries.push({
            date: d.date, piece: '—', libelle: `${t('exp.cat.' + d.categorie) !== 'exp.cat.' + d.categorie ? t('exp.cat.' + d.categorie) : esc(d.categorie)} — ${esc(d.description)}`,
            lines: [
                { compte: t('acc.a.purchases'), debit: ht, credit: 0 },
                { compte: t('acc.a.tvaIn'), debit: tva, credit: 0 },
                { compte: d.statut === 'payee' ? t('acc.a.bank') : t('acc.a.suppliers'), debit: 0, credit: Number(d.montant) }
            ]
        });
    });
    const paid = db.payroll[month] || {};
    if (Object.values(paid).some(v => v === 'paye')) {
        const tot = payrollTotals();
        entries.push({
            date: `${month}-28`, piece: 'PAIE', libelle: t('acc.e.payroll', { m: monthLabel(month) }),
            lines: [
                { compte: t('acc.a.wages'), debit: tot.brut, credit: 0 },
                { compte: t('acc.a.social'), debit: tot.patronal, credit: 0 },
                { compte: t('acc.a.cnss'), debit: 0, credit: tot.cnss + tot.amo + tot.patronal },
                { compte: t('acc.a.ir'), debit: 0, credit: tot.ir },
                { compte: t('acc.a.bankNet'), debit: 0, credit: tot.net }
            ]
        });
    }
    return entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function renderAccounting() {
    const month = state.accountingMonth;
    const tva = tvaSummary(month);
    const entries = journalEntries(month);
    const totalDebit = entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.debit, 0), 0);
    const totalCredit = entries.reduce((s, e) => s + e.lines.reduce((x, l) => x + l.credit, 0), 0);

    const caHT = db.invoices.filter(f => String(f.date).startsWith(month)).reduce((s, f) => s + invoiceHT(f), 0);
    const chargesHT = db.expenses.filter(d => String(d.date).startsWith(month)).reduce((s, d) => s + Number(d.montant) / (1 + TVA_RATE), 0);
    const paie = Object.values(db.payroll[month] || {}).some(v => v === 'paye') ? payrollTotals() : null;
    const resultat = caHT - chargesHT - (paie ? paie.brut + paie.patronal : 0);

    const rows = entries.map(e => e.lines.map((l, i) => `
      <tr>
        ${i === 0 ? `<td rowspan="${e.lines.length}">${fmtDate(e.date)}<br><small>${esc(e.piece)}</small></td>
        <td rowspan="${e.lines.length}">${e.libelle}</td>` : ''}
        <td>${l.compte}</td>
        <td>${l.debit ? fmtMAD(l.debit) : ''}</td>
        <td>${l.credit ? fmtMAD(l.credit) : ''}</td>
      </tr>`).join('')).join('');

    return `
      <div class="toolbar">
        <label class="month-picker">${t('acc.period')}
          <input type="month" class="form-input" id="accounting-month" value="${month}">
        </label>
      </div>

      <div class="stats-grid">
        ${kpi('🧾', t('acc.kpi.collected'), fmtMAD(tva.collectee))}
        ${kpi('📥', t('acc.kpi.deductible'), fmtMAD(tva.deductible))}
        ${kpi('🏛️', tva.due >= 0 ? t('acc.kpi.due') : t('acc.kpi.credit'), fmtMAD(Math.abs(tva.due)))}
        ${kpi(resultat >= 0 ? '📈' : '📉', t('acc.kpi.result', { m: monthLabel(month) }), fmtMAD(resultat))}
      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>${t('acc.journal', { m: monthLabel(month) })}</h3>
          <p class="hint-note">${t('acc.hint')}</p>
        </div>
        <div class="table-container flat">
          <table class="data-table journal">
            <thead><tr><th>${t('acc.th.piece')}</th><th>${t('acc.th.label')}</th><th>${t('acc.th.account')}</th><th>${t('acc.th.debit')}</th><th>${t('acc.th.credit')}</th></tr></thead>
            <tbody>${rows || emptyRow(5)}</tbody>
            <tfoot><tr><th colspan="3">${t('acc.totals')}</th><th>${fmtMAD(totalDebit)}</th><th>${fmtMAD(totalCredit)}</th></tr></tfoot>
          </table>
        </div>
      </div>`;
}

// ---------- Fragments ----------

function toolbar(searchPlaceholder, actions = []) {
    return `<div class="toolbar">
      ${searchPlaceholder ? `<input type="search" class="form-input search-input" id="search-input" placeholder="${esc(searchPlaceholder)}" value="${esc(state.search)}">` : '<span></span>'}
      <div class="toolbar-actions">${actions.join('')}</div>
    </div>`;
}

function emptyRow(cols) {
    return `<tr><td colspan="${cols}" class="empty">${t('empty')}</td></tr>`;
}

// ============================================
// Actions (CRUD → store)
// ============================================

function nextMatricule() {
    const nums = db.employees.map(e => Number(e.matricule)).filter(n => !isNaN(n));
    return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
}

const actions = {
    'add-employee': () => openModal(t('emp.new'), employeeForm(), data =>
        store.insert('employees', { matricule: nextMatricule(), ...data, salaire: Number(data.salaire) })),
    'edit-employee': ({ id }) => {
        const e = employee(id);
        openModal(`${t('edit')} — ${e.nom}`, employeeForm(e), data =>
            store.update('employees', id, { ...data, salaire: Number(data.salaire) }));
    },
    'delete-employee': async ({ id }) => {
        const e = employee(id);
        if (confirm(t('emp.confirmDelete', { n: e.nom }))) {
            await store.remove('employees', id);
            render();
        }
    },
    'export-employees': () => exportCSV('salaries.csv',
        ['Matricule', 'Nom', 'CIN', 'CNSS', 'Poste', 'Contrat', 'Embauche', 'Fin contrat', 'Salaire brut', 'Statut'],
        db.employees.map(e => [e.matricule, e.nom, e.cin, e.cnss, e.poste, e.contrat, e.dateEmbauche, e.finContrat, e.salaire, e.statut])),

    'toggle-paid': async ({ id }) => {
        const m = state.payrollMonth;
        const cur = db.payroll[m]?.[id];
        await store.setPayroll(m, id, cur === 'paye' ? 'attente' : 'paye');
        render();
    },
    'pay-all': async () => {
        const m = state.payrollMonth;
        for (const e of activeEmployees()) await store.setPayroll(m, e.id, 'paye');
        render();
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

    'add-leave': () => openModal(t('leave.new'), `<div class="form-grid">
        ${field(t('leave.f.emp'), 'empId', { options: activeEmployees().map(e => [e.id, e.nom]) })}
        ${field(t('leave.f.type'), 'type', { options: [['Congé annuel', t('leave.type.annuel')], ['Maladie', t('leave.type.maladie')], ['Exceptionnel', t('leave.type.exceptionnel')], ['Sans solde', t('leave.type.sanssolde')]], half: true })}
        ${field(t('th.statut'), 'statut', { value: 'attente', options: [['attente', t('status.attente')], ['approuve', t('status.approuve')]], half: true })}
        ${field(t('leave.f.from'), 'du', { type: 'date', half: true })}
        ${field(t('leave.f.to'), 'au', { type: 'date', half: true })}
      </div>`, data => store.insert('leaves', data)),
    'approve-leave': async ({ id }) => { await store.update('leaves', id, { statut: 'approuve' }); render(); },
    'refuse-leave': async ({ id }) => { await store.update('leaves', id, { statut: 'refuse' }); render(); },
    'delete-leave': async ({ id }) => { await store.remove('leaves', id); render(); },

    'toggle-declaration': async ({ month, kind }) => {
        await store.setDeclaration(month, kind, !db.declarations[month]?.[kind]);
        render();
    },

    'add-client': () => openModal(t('cli.new'), clientForm(), data => store.insert('clients', data)),
    'edit-client': ({ id }) => {
        const c = db.clients.find(x => x.id === id);
        openModal(`${t('edit')} — ${c.nom}`, clientForm(c), data => store.update('clients', id, data));
    },
    'delete-client': async ({ id }) => {
        if (db.invoices.some(f => f.clientId === id)) return alert(t('cli.blocked'));
        if (confirm(t('confirm.delete'))) { await store.remove('clients', id); render(); }
    },

    'add-invoice': () => {
        if (!db.clients.length) return alert(t('inv.needClient'));
        openModal(t('inv.new'), invoiceForm(), data =>
            store.insert('invoices', { ...data, quantite: Number(data.quantite), pu: Number(data.pu), montantRegle: Number(data.montantRegle) || 0 }));
    },
    'edit-invoice': ({ id }) => {
        const f = db.invoices.find(x => x.id === id);
        openModal(`${t('edit')} — ${f.num}`, invoiceForm(f), data =>
            store.update('invoices', id, { ...data, quantite: Number(data.quantite), pu: Number(data.pu), montantRegle: Number(data.montantRegle) || 0 }));
    },
    'pay-invoice': async ({ id }) => {
        const f = db.invoices.find(x => x.id === id);
        await store.update('invoices', id, { statut: 'payee', montantRegle: invoiceTTC(f) });
        render();
    },
    'delete-invoice': async ({ id }) => {
        if (confirm(t('confirm.delete'))) { await store.remove('invoices', id); render(); }
    },
    'print-invoice': ({ id }) => printInvoice(id),
    'export-invoices': () => exportCSV('factures.csv',
        ['N°', 'Client', 'Date', 'Produit', 'Quantité', 'PU', 'HT', 'TVA', 'TTC', 'Réglé', 'Statut'],
        db.invoices.map(f => [f.num, clientName(f.clientId), f.date, f.produit, f.quantite, f.pu,
        invoiceHT(f).toFixed(2), invoiceTVA(f).toFixed(2), invoiceTTC(f).toFixed(2), f.montantRegle, f.statut])),

    'add-supplier': () => openModal(t('sup.new'), supplierForm(), data => store.insert('suppliers', data)),
    'edit-supplier': ({ id }) => {
        const s = db.suppliers.find(x => x.id === id);
        openModal(`${t('edit')} — ${s.nom}`, supplierForm(s), data => store.update('suppliers', id, data));
    },
    'delete-supplier': async ({ id }) => {
        if (db.expenses.some(d => d.supplierId === id)) return alert(t('sup.blocked'));
        if (confirm(t('confirm.delete'))) { await store.remove('suppliers', id); render(); }
    },

    'add-expense': () => openModal(t('exp.new'), expenseForm(), data =>
        store.insert('expenses', { ...data, supplierId: data.supplierId || null, montant: Number(data.montant) })),
    'edit-expense': ({ id }) => {
        const d = db.expenses.find(x => x.id === id);
        openModal(t('exp.edit'), expenseForm(d), data =>
            store.update('expenses', id, { ...data, supplierId: data.supplierId || null, montant: Number(data.montant) }));
    },
    'toggle-expense': async ({ id }) => {
        const d = db.expenses.find(x => x.id === id);
        await store.update('expenses', id, { statut: d.statut === 'payee' ? 'a_payer' : 'payee' });
        render();
    },
    'delete-expense': async ({ id }) => {
        if (confirm(t('confirm.delete'))) { await store.remove('expenses', id); render(); }
    },
    'export-expenses': () => exportCSV('depenses.csv',
        ['Date', 'Catégorie', 'Description', 'Fournisseur', 'Montant', 'Statut'],
        db.expenses.map(d => [d.date, d.categorie, d.description, supplierName(d.supplierId), d.montant, d.statut])),

    'add-contract': () => openModal(t('ct.new'), contractForm(), data =>
        store.insert('contracts', { ...data, montant: Number(data.montant) || 0 })),
    'edit-contract': ({ id }) => {
        const c = db.contracts.find(x => x.id === id);
        openModal(t('ct.edit'), contractForm(c), data =>
            store.update('contracts', id, { ...data, montant: Number(data.montant) || 0 }));
    },
    'delete-contract': async ({ id }) => {
        if (confirm(t('confirm.delete'))) { await store.remove('contracts', id); render(); }
    }
};

// ============================================
// Bootstrap
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Garde d'authentification (mode cloud uniquement)
    if (isCloud) {
        const session = await getSession();
        if (!session) { location.href = './login.html'; return; }
    }

    // Badge de mode (démo / connecté)
    const badge = $('#mode-badge');
    if (badge) {
        badge.textContent = isCloud ? '● ' + t('mode.cloud') : t('mode.demo');
        badge.classList.add(isCloud ? 'mode-cloud' : 'mode-demo');
    }

    try {
        await store.init(seed);
    } catch (err) {
        alert('Erreur de chargement des données : ' + err.message);
        return;
    }
    db = store.db;

    // Routing par hash
    const applyHash = () => {
        const view = location.hash.replace('#', '') || 'dashboard';
        if (VIEWS.includes(view)) {
            state.view = view;
            state.search = '';
            render();
        }
    };
    window.addEventListener('hashchange', applyHash);
    applyHash();

    // Sélecteur de langue
    $('#lang-switcher').addEventListener('click', () => {
        lang = lang === 'fr' ? 'ar' : 'fr';
        localStorage.setItem('carriere-lang', lang);
        render();
    });

    // Déconnexion
    $('#logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut();
        location.href = './login.html';
    });

    // Délégation des actions
    $('#view').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.matches('input[type="checkbox"]')) return;
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
