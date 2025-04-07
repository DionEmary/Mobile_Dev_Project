import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Access EAS secrets via Constants.expoConfig.extra
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ?? '';
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key. Ensure EAS secrets are configured.');
}

const supabase = createClient(supabaseUrl, supabaseKey);


export default supabase;