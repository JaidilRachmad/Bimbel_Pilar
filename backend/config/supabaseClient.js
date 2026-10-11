const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
    throw new Error('SOP Error: Salah satu dari SUPABASE_URL, SUPABASE_KEY, atau SUPABASE_SERVICE_ROLE_KEY belum diset di file .env!');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;