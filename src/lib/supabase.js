import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://duprswelncthgihuyjvi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cHJzd2VsbmN0aGdpaHV5anZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTE4NTEsImV4cCI6MjA5NTM2Nzg1MX0.MMFYK14v1neEqUu-VngmehjcIC6R1Yjcr3UOG5ldWdc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
