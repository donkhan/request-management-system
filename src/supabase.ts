import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvkrijsprcwvguhocwke.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a3JpanNwcmN3dmd1aG9jd2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzEwOTQsImV4cCI6MjA4NzI0NzA5NH0.kN5mQ9XGWv7CUE1q4h6ijPfrVAWEX_bGfSMtHcmFskw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
