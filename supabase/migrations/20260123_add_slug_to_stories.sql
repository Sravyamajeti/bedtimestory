-- Add slug column to stories table if it doesn't exist
alter table "public"."stories" add column if not exists "slug" text;

-- Create an index on the slug column for faster lookups
create index if not exists stories_slug_idx on stories (slug);
