Phase 1: The URL Overhaul 

1. Database Schema Update

[ ] Add a slug column to Stories database table.

[ ] Run a script to backfill slugs for existing stories (e.g., convert "Willow and the Woods" -> willow-and-the-woods).

[ ] Update the Story Generation Code: When AI creates a new story, auto-generate and save the slug immediately.

2. Story Page Routing

[ ] Update the route handler to look up stories by slug instead of ID.

[ ] Verify the new URL works: https://bedtimestories.productmama.dev/story/willow-and-the-woods.


3. Category Page Routing

[ ] Create a dynamic route for categories (e.g., /topics/[tag] or /library/[tag]).

[ ] Ensure this route queries the same data as current ?tag= filter.

[ ] Crucial: Ensure the H1 tag on this page dynamically changes. (If I visit /topics/nature, the H1 must say "Nature Bedtime Stories").

Phase 2: Metadata & Schema

1. Dynamic Meta Tags (Story Pages)

[ ] Title Tag: Set to {Story Title} | Free Bedtime Story.

[ ] Description: Set to "Read {Story Title}, a free short bedtime story for kids about {Tag}. 5-minute read."

[ ] Canonical Tag: Add <link rel="canonical" href=".../story/{slug}" />.

2. Dynamic Meta Tags (Category Pages)

[ ] Title Tag: Set to Best {Tag Name} Bedtime Stories for Kids.

[ ] Description: Set to "Browse our collection of {Tag Name} stories. Gentle tales generated daily for toddlers and children."

3. JSON-LD Schema Implementation

[ ] Add the CreativeWork or ShortStory schema script to the <head> of every individual story page.

[ ] Validate one page using the Google Rich Results Test to ensure no errors.

4. XML Sitemap

[ ] specific generation of a sitemap.xml file.

[ ] Include all new Story URLs (/story/slug).

[ ] Include all new Category URLs (/topics/tag).


Phase 3: Internal Linking & UX


1. "Related Stories" Component

[ ] At the bottom of every story, add a section: "More Stories Like This."

[ ] Logic: Display 3 other links from the same tag/category.

2. Category Descriptions

[ ] Add a conditional logic block to Category Page template.

[ ] If Tag == "Nature", render specific intro text: "Calming stories about forests, animals, and the outdoors..."

[ ] If Tag == "Magic", render: "Tales of wizards, fairies, and wonder..."

[ ] Why: This unique text prevents Google from seeing these pages as duplicates.