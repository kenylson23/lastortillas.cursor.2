"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.testSupabaseConnection = testSupabaseConnection;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ROLE;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Test Supabase connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await exports.supabase.from('menu_items').select('count').limit(1);
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        console.log('✓ Supabase connection successful');
        return true;
    }
    catch (error) {
        console.error('Supabase connection error:', error);
        return false;
    }
}
