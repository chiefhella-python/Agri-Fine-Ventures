// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client only if credentials are provided
let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('[YOUR-')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      // Global fetch config for production
      global: {
        headers: {
          'apikey': supabaseKey
        }
      }
    });
  } catch (err) {
    console.warn('⚠️ Supabase client initialization failed:', err.message);
  }
}

// Test connection (optional - for debugging)
async function testSupabaseConnection() {
  if (!supabase) {
    console.log('ℹ️ Supabase not configured - skipping connection test');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
}

module.exports = {
  supabase,
  testSupabaseConnection
};