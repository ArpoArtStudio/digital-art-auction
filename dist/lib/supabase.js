"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key is missing. Please check your environment variables.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
