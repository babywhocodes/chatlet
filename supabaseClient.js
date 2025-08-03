// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ynohmquweeyazfatviux.supabase.co', // from Supabase project settings
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlub2htcXV3ZWV5YXpmYXR2aXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjEwMDksImV4cCI6MjA2ODU5NzAwOX0.lLlqpcQNET9N_8Z1aCrEurkIkuDIF0ZuaW-sSXTHvg4'                  // from Supabase > API > anon key
);
