-- Create a slugify function
create or replace function public.slugify(v text)
returns text
language plpgsql
strict immutable as $$
begin
    -- 1. Lowercase
    -- 2. Replace non-alphanumeric with hyphens
    -- 3. Trim hyphens from start/end
    -- 4. Collapse multiple hyphens
    return trim(both '-' from regexp_replace(lower(v), '[^a-z0-9]+', '-', 'g'));
end;
$$;

-- Update stories with null slugs
update public.stories
set slug = slugify(title)
where slug is null and title is not null;
