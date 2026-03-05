import { createClient } from '@supabase/supabase-js'

// 1. Go to supabase.com and create a free account
// 2. Create a new project
// 3. Go to SQL Editor and run this to create the scores table:
//    CREATE TABLE arcade_scores (
//      id SERIAL PRIMARY KEY,
//      initials VARCHAR(2) NOT NULL,
//      score INTEGER NOT NULL,
//      created_at TIMESTAMP DEFAULT NOW()
//    );
// 4. Go to Project Settings → API
//    Copy: Project URL → VITE_SUPABASE_URL in client/.env
//    Copy: anon/public key → VITE_SUPABASE_ANON_KEY in client/.env
// 5. In Supabase → Authentication → Policies, enable Row Level Security
//    and add a policy to allow public inserts and selects on arcade_scores

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Global leaderboard will use localStorage fallback.')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null
