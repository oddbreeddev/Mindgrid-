
import { createClient } from '@supabase/supabase-js';

// These should be set in your environment variables (Vercel/Netlify)
// If not provided, the app will fall back to a "Mock Mode" for development
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA (Run this in Supabase SQL Editor):
 * 
 * -- Profiles table
 * create table profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   full_name text,
 *   university text,
 *   department text,
 *   updated_at timestamp with time zone
 * );
 * 
 * -- Timetables table
 * create table timetables (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   goal text,
 *   data jsonb,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- CGPA History
 * create table cgpa_records (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   semester_label text,
 *   gpa numeric,
 *   units integer,
 *   courses jsonb,
 *   created_at timestamp with time zone default now()
 * );
 */
