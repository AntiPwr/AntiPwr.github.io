# Scape Wiki

<!-- no-search -->

# Scape Wiki 

Welcome to the Scape Wiki! This document outlines the formatting and content expectations for all wiki pages. Following these guidelines ensures a consistent reading experience and helps maintain the integrity of the worldbuilding.

## CSS Structure and Guidelines

The Scape Wiki uses a single global stylesheet: `scape_wiki_base.css`.

**This file contains all global, wiki-wide, and shared styles for the Scape Wiki site.**

### CSS File Structure
- 1. CSS Variables & Resets
- 2. Global Layout & Typography
- 3. Navbar, Sidebar, and Search
- 4. Wiki Content (headings, paragraphs, images, links)
- 5. Feathermark Styles
- 6. Collapsible Sections
- 7. Lightbox/Modal
- 8. Taxonomy Table
- 9. Responsive & Miscellaneous

**Guidelines:**
- Only add styles to `scape_wiki_base.css` that are global, wiki-wide, or shared across multiple wiki pages.
- Do **not** add page-specific, unrelated, or experimental styles to this file.
- Use the section comments in the CSS to keep the file organized. Add new rules in the appropriate section.
- For page-specific or feature-specific styles, create a new, clearly named CSS file and document its purpose.
- If you add a new global feature, add a new section and update this README.

**Best Practices:**
- Keep selectors as specific as needed, but avoid unnecessary specificity.
- Use variables and shared color/font definitions where possible.
- Comment any non-obvious rules or overrides.
- Regularly review for duplicate or obsolete rules.

---

## Page Structure

Each wiki page should follow this structure (excluding ```):

```
<!-- wiki-header-section:start -->
# Page Title
Nickname, Alternative Titles

<img src="wiki_images/PageName.png"></img>

> "Quote from the fictional world"
> —Quote Attribution

> "Quote from the real world"
> —Quote Attribution

Introductory paragraph that summarizes the subject. If the page title appears in the introductory paragraph, it should be **bolded** (e.g., **Tildohsi**).
<!-- wiki-header-section:end -->

<!-- taxonomy-table-section:start -->
If the page title appears in the taxonomy table, it should be **bolded** (e.g., **Tildohsi**)
<div class="taxonomy-table">
  <table>
    <tr>
      <th colspan="3">Purpose Taxonomy</th>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/bin.svg" class="taxon-icon">Bin:</td>
      <td class="taxon-content" colspan="2">{{Bin}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/basin.svg" class="taxon-icon">Basin:</td>
      <td class="taxon-content" colspan="2">{{Basin}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/eco.svg" class="taxon-icon">Eco:</td>
      <td class="taxon-content" colspan="2">{{Eco}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/kingdom.svg" class="taxon-icon">Kingdom:</td>
      <td class="taxon-content" colspan="2">{{Kingdom}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/phylum.svg" class="taxon-icon">Phylum:</td>
      <td class="taxon-content" colspan="2">{{Phylum}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/class.svg" class="taxon-icon">Class:</td>
      <td class="taxon-content" colspan="2">{{Class}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/order.svg" class="taxon-icon">Order:</td>
      <td class="taxon-content" colspan="2">{{Order}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/family.svg" class="taxon-icon">Family:</td>
      <td class="taxon-content" colspan="2">{{Family}}</td>
    </tr>
    <tr>
      <td class="taxon-label"><img src="../svg/essa.svg" class="taxon-icon">Essa:</td>
      <td class="taxon-content" colspan="2">{{Essa}}</td>
    </tr>
  </table>
</div>
<!-- taxonomy-table-section:end -->

## Main Section

Content organized by sections...

## Images

## Inspiration

<!-- not-for-live-publishing:start -->
<!--
This section is for content, lore, or discoveries that are NOT meant for live publishing to the site. 
Leave this empty unless specifically requested. Use this to stage information that will be revealed to players later.
-->
<!-- not-for-live-publishing:end -->
```

## Search Bar Indexing

> **Note:** Only the page title (the first H1, e.g. `# Page Title`) is indexed and shown in search bar results. Nicknames, alternative titles, quotes, or any other content are not included in search results. This ensures that search suggestions are clear and unambiguous.

### Excluding Pages from Search

To prevent a page from appearing in the search bar or advanced taxon search, add the following tag anywhere in the page's Markdown or HTML:

```
<!-- no-search -->
```

Any page containing this tag will be completely excluded from all search results, including both the main search bar and advanced taxonomy-based search. Use this for pages that are drafts, internal documentation, meta-guides, or otherwise not intended for public discovery via search.

**Best Practices:**
- Use `<!-- no-search -->` sparingly and only for pages that should be hidden from all user-facing search features.
- Document the reason for exclusion in a comment if it is not obvious.
- Do not use this tag to hide spoilers or lore; use the `not-for-live-publishing` section for that purpose.

## Purpose Taxonomy

Every page should include the appropriate taxonomic classification based on the [Purpose Taxonomy](root/wiki/Purpose%20Taxonomy.md) system. Include only the relevant taxonomic levels for your subject:

- **Bin:** Universe
- **Basin:** Dimension
- **Eco:** Plane
- **Kingdom:** Inhabitant (by Empire Function)
- **Phylum:** Ideology
- **Class:** Government
- **Order:** Civilization
- **Family:** Community
- **Essa:** Soul's Purpose

If a subject doesn't neatly fit a taxonomic category, mark it as "EB" (Exception-Branching) until further evidence supports a standard categorization.

## Content Expectations

### Depth and Detail
Wiki pages should maximize detail, especially when describing smaller sections of the world. For example, when writing about a location, some detailed and useful content to address would be:
- Local resources and how they're acquired
- Trade relationships and history
- Effects of wars and conflicts
- Cultural practices and beliefs
- Notable architecture and landmarks
- Relationships with neighboring regions

### Cross-Referencing
When content overlaps with another wiki page's subject:
- Provide a brief summary
- Link to the dedicated page for in-depth information
- Focus on aspects directly relevant to your page's subject

For example, if writing about trade between regions A and B, and there's a separate page about a war between them, mention how the war affected trade without extensively detailing the war itself.

### Wiki Links
Use double brackets to create links to other wiki pages: `[[Page Name]]`

For links with different display text: `[[Page Name|Display Text]]`

## Writing Styles

The Scape Wiki supports three distinct writing styles for content creation. Note that these styles apply only to the content of wiki pages, not to their formatting or structure.

#### Default Writing Style
The default style focuses on clear, informative content that balances detail with readability. This style is recommended for most wiki entries, especially those focused on technical or historical information.

#### Amplified Writing Style
The Amplified Writing Style embraces grandeur and atmospheric depth, similar to the narrative worlds of Elden Ring or Dune. This style is characterized by:

- Rich, evocative descriptions that immerse readers in the environment
- Elevated, formal language that conveys the weight of history and significance
- Deliberate pacing that allows for contemplation of cosmic or existential themes
- Mythic undertones that hint at greater forces and ancient mysteries
- A sense of scale that positions the subject within a vast, complex universe

Use this style when describing legendary locations, cosmic forces, ancient civilizations, or moments of profound historical importance.

#### Wilder Writing Style
The Wilder Writing Style fuses theatrical eccentricity with sharp cynicism, political subtext, and poetic dread. Named after Gene Wilder, whose portrayals balanced manic charm with eerie ambiguity, this style blends childlike whimsy with adult disillusionment. Key characteristics include:

- Figurative language focused on flow, including frequent use of alliteration and rhyming
- A balance of colorful imagery and grayscale despair
- Humor that masks deeper, often uncomfortable truths
- Characters who are exaggerated, performative, and unpredictable
- Speech patterns that swing between poetic monologue, riddle-like phrasing, and childlike wonder
- Content that dances along the border of the absurd and the profound
- Narratives that expose the rot beneath polished surfaces, the shadows behind curtains, and the madness within order

#### Dark Writing Style
The Dark Writing Style confronts the vastness of suffering and its profound impact on individuals and societies. It is characterized by:
- Unflinching exploration of difficult truths and their consequences
- Human-centric, empathetic stance toward trauma and hardship
- Deep, scholarly vocabulary and nuanced descriptions
- Precise articulation of emotional and psychological states
- Rare, strategic use of humor to punctuate or emphasize severity
- Academic framing of disturbing content without diminishing its weight
- Emphasis on the ripple effects of events through time and across populations

## Example Page Components

### Images
Images should be stored in the `wiki_images` directory and referenced using:
```html
<img src="wiki_images/PageName.png"><i>Image caption here</i></img>
```

The image filename should match the page title. For example:
- For a page titled "Scender", use "Scender.png"
- For a page titled "Sol Unita", use "Sol Unita.png"

This naming convention ensures consistency and makes it easier to manage image assets.

### Section Structure

Organize content with clear section headings. The main page structure should be:

1. **Header Section** (`.wiki-header-section`): Nicknames, image, quotes, summary.
2. **Taxonomy Section** (`.taxonomy-table-section`): Purpose taxonomy table.
3. **Main Content**: Sections, images, related pages, etc.

### Lists
Use bulleted or numbered lists for series of related items:
```markdown
- Item one
- Item two
  - Sub-item
```

### Feathermarks: Corvi's Commentary

Throughout the wiki, you'll find special commentary sections called **Feathermarks** - insights, observations, and asides from the character Corvi. Similar to how characters like Xanathar or Tasha provide notes in D&D sourcebooks, Corvi's Feathermarks add flavor and perspective to wiki entries.

Feathermarks should:
- Be clearly separate from the main content
- Provide additional context, insights, or alternative perspectives
- Be formatted in their own visually distinct panels
- Use one of the specialized writing styles described below

To add a Feathermark to a wiki page, use the following HTML structure:

```html
<div class="feathermark">
    <p class="feathermark-attribution">Corvi's Feathermark</p>
    <p>Your Feathermark text goes here...</p>
</div>
```

#### Feathermark Writing Styles

Corvi's Feathermarks can use any of the following writing styles:

##### Amplified Writing Style
The Amplified Writing Style embraces grandeur and atmospheric depth, similar to the narrative worlds of Elden Ring or Dune. This style is characterized by:
- Rich, evocative descriptions that immerse readers in the environment
- Elevated, formal language that conveys the weight of history and significance
- Deliberate pacing that allows for contemplation of cosmic or existential themes
- Mythic undertones that hint at greater forces and ancient mysteries
- A sense of scale that positions the subject within a vast, complex universe

##### Wilder Writing Style
The Wilder Writing Style fuses theatrical eccentricity with sharp cynicism, political subtext, and poetic dread. Named after Gene Wilder, whose portrayals balanced manic charm with eerie ambiguity, this style blends childlike whimsy with adult disillusionment. Key characteristics include:
- Figurative language focused on flow, including frequent use of alliteration and rhyming
- A balance of colorful imagery and grayscale despair
- Humor that masks deeper, often uncomfortable truths
- Characters who are exaggerated, performative, and unpredictable
- Speech patterns that swing between poetic monologue, riddle-like phrasing, and childlike wonder
- Content that dances along the border of the absurd and the profound
- Narratives that expose the rot beneath polished surfaces, the shadows behind curtains, and the madness within order

##### Dark Writing Style
The Dark Writing Style confronts the vastness of suffering and its profound impact on individuals and societies. It is characterized by:
- Unflinching exploration of difficult truths and their consequences
- Human-centric, empathetic stance toward trauma and hardship
- Deep, scholarly vocabulary and nuanced descriptions
- Precise articulation of emotional and psychological states
- Rare, strategic use of humor to punctuate or emphasize severity
- Academic framing of disturbing content without diminishing its weight
- Emphasis on the ripple effects of events through time and across populations

## Not For Live Publishing Section

At the end of every page, include a commented-out section labeled `not-for-live-publishing`. This section is reserved for lore, spoilers, or discoveries that should not be visible to players or the public until you decide to reveal them. Leave it empty unless you are specifically staging content for future release.

Example:

```
<!-- not-for-live-publishing:start -->
<!--
This section is for content, lore, or discoveries that are NOT meant for live publishing to the site. 
Leave this empty unless specifically requested. Use this to stage information that will be revealed to players later.
-->
<!-- not-for-live-publishing:end -->
```