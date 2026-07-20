// ============================================
// Couche de données — Supabase (multi-utilisateurs)
// avec repli automatique sur localStorage (mode démo)
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export const isCloud = !!supabase;

const STORAGE_KEY = 'hh-admin-v1';
const COLLECTIONS = ['employees', 'clients', 'suppliers', 'invoices', 'expenses', 'leaves', 'contracts'];

export function uid() {
    return (crypto.randomUUID && crypto.randomUUID())
        || Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// db : { employees: [], ..., payroll: {month:{empId:statut}}, declarations: {month:{kind:bool}} }
export const store = {
    db: null,

    async init(seedFactory) {
        if (isCloud) {
            await this._loadCloud();
        } else {
            this._loadLocal(seedFactory);
        }
        return this.db;
    },

    // ---------- Chargement ----------

    _loadLocal(seedFactory) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) { this.db = JSON.parse(raw); return; }
        } catch { /* re-seed */ }
        this.db = seedFactory();
        this._persistLocal();
    },

    async _loadCloud() {
        const results = await Promise.all([
            ...COLLECTIONS.map(c => supabase.from(c).select('*').order('created_at', { ascending: true })),
            supabase.from('payroll').select('*'),
            supabase.from('declarations').select('*')
        ]);
        const err = results.find(r => r.error);
        if (err) throw new Error(err.error.message);

        this.db = {};
        COLLECTIONS.forEach((c, i) => { this.db[c] = results[i].data || []; });

        this.db.payroll = {};
        (results[COLLECTIONS.length].data || []).forEach(r => {
            this.db.payroll[r.month] = this.db.payroll[r.month] || {};
            this.db.payroll[r.month][r.empId] = r.statut;
        });

        this.db.declarations = {};
        (results[COLLECTIONS.length + 1].data || []).forEach(r => {
            this.db.declarations[r.month] = this.db.declarations[r.month] || {};
            this.db.declarations[r.month][r.kind] = r.done;
        });
    },

    _persistLocal() {
        if (!isCloud) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    },

    // ---------- CRUD collections ----------

    async insert(collection, obj) {
        const row = { id: uid(), ...obj };
        this.db[collection].push(row);
        this._persistLocal();
        if (isCloud) {
            const { error } = await supabase.from(collection).insert(this._clean(collection, row));
            if (error) return this._fail(error);
        }
        return row;
    },

    async update(collection, id, patch) {
        const row = this.db[collection].find(r => r.id === id);
        if (row) Object.assign(row, patch);
        this._persistLocal();
        if (isCloud) {
            const { error } = await supabase.from(collection).update(this._clean(collection, patch)).eq('id', id);
            if (error) return this._fail(error);
        }
        return row;
    },

    async remove(collection, id) {
        this.db[collection] = this.db[collection].filter(r => r.id !== id);
        this._persistLocal();
        if (isCloud) {
            const { error } = await supabase.from(collection).delete().eq('id', id);
            if (error) return this._fail(error);
        }
    },

    // ---------- Paie & déclarations ----------

    async setPayroll(month, empId, statut) {
        this.db.payroll[month] = this.db.payroll[month] || {};
        this.db.payroll[month][empId] = statut;
        this._persistLocal();
        if (isCloud) {
            const { error } = await supabase.from('payroll').upsert({ month, empId, statut });
            if (error) return this._fail(error);
        }
    },

    async setDeclaration(month, kind, done) {
        this.db.declarations[month] = this.db.declarations[month] || {};
        this.db.declarations[month][kind] = done;
        this._persistLocal();
        if (isCloud) {
            const { error } = await supabase.from('declarations').upsert({ month, kind, done });
            if (error) return this._fail(error);
        }
    },

    // ---------- Utilitaires ----------

    // Retire les clés inconnues (dates vides → null pour Postgres)
    _clean(collection, obj) {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            if (k === 'created_at') continue;
            out[k] = (v === '' && /date|debut|fin|du|au/i.test(k)) ? null : v;
        }
        return out;
    },

    _fail(error) {
        console.error('Supabase:', error);
        alert('Erreur de synchronisation : ' + error.message + '\nRechargez la page.');
    }
};

// ---------- Authentification ----------

export async function getSession() {
    if (!isCloud) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
}

export async function signOut() {
    if (isCloud) await supabase.auth.signOut();
}
