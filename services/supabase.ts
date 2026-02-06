
import { createClient } from '@supabase/supabase-js';

// Using the keys you provided
const supabaseUrl = 'https://rsvvkwsqvoukjjflnqcu.supabase.co';
const supabaseAnonKey = 'sb_publishable_8DCplz8MO7FPRPG-DYQX5g_RvxDgtzo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REMINDER (Run in Supabase SQL Editor):
 * 
 * -- 1. Profiles (Student Info)
 * create table profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   full_name text,
 *   university text,
 *   department text,
 *   updated_at timestamp with time zone
 * );
 * 
 * -- 2. Timetables (AI Generated Schedules)
 * create table timetables (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade,
 *   goal text,
 *   data jsonb,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 3. CGPA Records (Semester tracking)
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
 * -- 4. Curated Articles (AI Generated Content)
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
 * 
 * -- 5. Newsletter Subscribers
 * create table newsletter_subscribers (
 *   id uuid default uuid_generate_v4() primary key,
 *   email text unique not null,
 *   interests text[],
 *   platform text default 'email',
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 6. Broadcast Logs (Campaign Tracking)
 * create table broadcast_logs (
 *   id uuid default uuid_generate_v4() primary key,
 *   title text,
 *   content text,
 *   reach integer,
 *   sent_at timestamp with time zone default now()
 * );
 */
