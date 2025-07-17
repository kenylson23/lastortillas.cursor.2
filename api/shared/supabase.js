"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Configuração do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Cliente para uso público (frontend)
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Cliente para uso administrativo (backend)
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Configuração da database URL para Drizzle
const getDatabaseUrl = () => {
    return process.env.DATABASE_URL || 'postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
};
exports.getDatabaseUrl = getDatabaseUrl;
