"use strict";

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SOP Error: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (atau SUPABASE_KEY) belum diset di file .env!");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;