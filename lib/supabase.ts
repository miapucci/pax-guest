import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkuwtrgiccizasjwkidi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdXd0cmdpY2NpemFzandraWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzIxNjIsImV4cCI6MjA4NzAwODE2Mn0.YlezAcrbc8Of9MmqeMP9uo62B6nbCgS5QRVFC3HJVz0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
