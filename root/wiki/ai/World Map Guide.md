# World Map Guide: Omnis Map Development Instructions

> **Note:** This map world is designed to be used alongside the in-world vocabulary and concepts found in the Purpose Taxonomy.html (located in the Scape Wiki). Refer to that resource for definitions and context as you explore or develop the Omnis Map.

> **Integration with the Scape Wiki:**
>
> The world map is designed to work closely with the Scape Wiki. Scattered throughout the maps should be buttons and links that take users to relevant wiki entries or to other sections of the world map. This approach is inspired by the Runeterra world map (https://map.leagueoflegends.com/en_US), where users can read and learn about the world through interactive map elements. Information may be presented as popups, sidebars, or small excerpts and images directly on the map, or by linking out to full wiki pages for deeper exploration.

## Overview
This guide outlines the structure and development plan for the Omnis Map—a navigable map system representing the entire universe. The Omnis Map is designed to allow users to zoom in and out, exploring from the macrocosm (the whole universe) to the microcosm (individual cities, battlemaps, etc.).

## Omnis Structure
- **Omnis (The Universe)**
  - **Bin 0: Scape** (focus of current development)
    - Contains all maps and spatial dimensions for the Scape
  - **Bin 1: Other Side** (to be developed in the far future)

> **Note:** All current development will focus exclusively on Bin 0 (Scape). Bin 1 is reserved for future expansion.

## Scape (Bin 0) Map Hierarchy
Within the Scape, there are three main spatial basins:
- **sacrus_map** (First Dimension)
- **fractal_waters_map** (Second Dimension)
- **swehel_map** (Third Dimension)

### Development Focus
- Begin with **sacrus_map**
- Within sacrus_map, focus on the **toman_ecoss_map**
- Skip the development of individual planes and focus on the **toma_eco_map**
- Continue to magnify into:
  - Continents
  - Planes
  - Cities
  - Battlemaps
  - And so on, as needed

## Navigation Principle
- The map system should allow users to continuously click in and out of maps, moving from the largest scale (the Omnis) to the smallest (battlemaps, cities, etc.), and vice versa.
- Each map is a node in a hierarchy, with links to its parent (zoom out) and children (zoom in).
- Within each map, users should be able to zoom in and out to see more or less detail, without switching to a new map. This allows for exploration of different levels of detail before navigating to a different map in the hierarchy.

## Development Roadmap
1. **Start with the toma_eco_map** (an eco within toma_ecoss_map)
2. Build navigation to allow zooming in/out between:
    - toma_eco_map → continent_map → city_map → battlemap_map
3. Expand the map system as needed, following the macro-to-micro structure

## Recommended File Structure for the Omnis Map Project

To support the hierarchical, interactive, and extensible nature of the Omnis Map, the following file structure is recommended. This structure is designed to keep map data, navigation logic, and wiki integration organized and maintainable.

### 1. Root Folders
- `/maps/` — Contains all map data and configuration files (SVGs, JSON, etc.)
- `/js/` — JavaScript files for map rendering, navigation, and interactivity
- `/css/` — Stylesheets for map and UI appearance
- `/wiki/` — Scape Wiki content (HTML/MD files)
- `/json/` — Indexes and metadata for maps and wiki entries

### 2. Maps Folder Structure
```
maps/
  omnis_map.svg                # The universe-level map (macrocosm)
  scape/
    sacrus_map.svg             # First dimension map
    fractal_waters_map.svg     # Second dimension map
    swehel_map.svg             # Third dimension map
    toman_ecoss_map.svg        # Ecosystem map (collection of planes)
    toma_eco_map.svg           # Focused eco map
    continents/
      continent1_map.svg
      ...
    cities/
      city1_map.svg
      ...
    battlemaps/
      battle1_map.svg
      ...
```

### 3. JavaScript Structure (Implemented Scripts)
- `js/scape_world_map.js` — Main logic for rendering and navigating the world map
- `js/map_navigation.js` — Handles zooming, clicking, and map transitions (created)
- `js/wiki_integration.js` — Handles popups, sidebars, and links to wiki content (created)
- `js/map_data_loader.js` — Loads map data and metadata from `/maps/` and `/json/` (created)

> The above scripts have been created as part of the initial setup. Each script contains placeholders and example functions to be expanded as development continues. See the respective files for details and update this guide as the codebase evolves.

### 4. JSON/Metadata
- `json/map_index.json` — Hierarchical index of all maps and their relationships
- `json/wiki_index.json` — Index of wiki entries for quick lookup and linking
- `json/map_metadata.json` — Metadata for each map (dimensions, available zoom levels, etc.)

### 5. Wiki Integration
- Wiki entries should be referenced by unique IDs in both map data and navigation logic
- Buttons/links in SVGs or rendered overlays should use these IDs to open popups or navigate to `/wiki/` content

### 6. Interconnections
- Map navigation JS should reference `map_index.json` to determine parent/child relationships
- Wiki integration JS should reference `wiki_index.json` for linking and popups
- CSS should ensure consistent styling for overlays, popups, and navigation UI
- SVGs can include IDs/classes for clickable regions, which JS can use to trigger navigation or wiki popups

### 7. Example Workflow
1. User loads `scape_world_map.html`, which loads the main SVG and JS
2. User clicks a region (e.g., a continent) — JS loads the relevant SVG and updates navigation state
3. User clicks a wiki button — JS opens a popup/sidebar with content from `/wiki/`
4. User zooms in/out within a map — JS adjusts the viewBox or uses overlays for detail

---

*This guide should be updated as the project evolves and new map layers or navigation features are added.*
