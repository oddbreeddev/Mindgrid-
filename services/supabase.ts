
import { createClient } from '@supabase/supabase-js';

// Using the keys you provided
const supabaseUrl = 'https://rsvvkwsqvoukjjflnqcu.supabase.co';
const supabaseAnonKey = 'sb_publishable_8DCplz8MO7FPRPG-DYQX5g_RvxDgtzo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

/**
 * DATABASE SCHEMA REMINDER (Run in Supabase SQL Editor):
 * 
 * -- 1. Profiles (Student Info)
 * create table profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   full_name text,
 *   university text,
 *   department text,
 *   selected_tech_track text,
 *   updated_at timestamp with time zone
 * );
 * 
 * -- 2. Social Posts (The Feed)
 * create table social_posts (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   user_email text,
 *   content text not null,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 3. Timetables (AI Generated Schedules)
 * create table timetables (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   goal text,
 *   data jsonb,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 4. CGPA Records (Semester tracking)
 * create table cgpa_records (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   semester_label text,
 *   gpa numeric,
 *   units integer,
 *   courses jsonb,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 5. Curated Articles (AI Generated Content)
 * create table curated_articles (
 *   id uuid default uuid_generate_v4() primary key,
 *   title text not null,
 *   excerpt text,
 *   content text not null,
 *   category text,
 *   author_name text default 'MindGrid AI',
 *   image_id text,
 *   suggested_by text,
 *   created_at timestamp with time zone default now()
 * );
 */
