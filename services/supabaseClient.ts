import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vpowylnsixtzrypncpqf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwb3d5bG5zaXh0enJ5cG5jcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTEyNTIsImV4cCI6MjA3OTU2NzI1Mn0.Lm05POEQZ8XY_rKlqRu4F79mXJl4STQO2n4jM0UlwvA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);