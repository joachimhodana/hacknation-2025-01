# Database Seeding

This directory contains JSON seed files for populating the database with initial data.

## Seed Files

- **`characters.json`** - Character definitions (guides, companions, etc.)
- **`points.json`** - Map points/geofences with narration, rewards, and character associations
- **`paths.json`** - Route/path definitions
- **`path-points.json`** - Relationships between paths and points (defines the order of stops)

## Running Seeds

### Automatic (Docker)
Seeds run automatically when the Docker container starts via `docker-entrypoint.sh`.

### Manual
```bash
# From apps/core directory
bun run seed
```

### Force Reset
To force re-seeding (deletes existing data first):
```bash
FORCE_RESET_SEEDS=true bun run seed
```

## Seed File Structure

### characters.json
```json
[
  {
    "name": "Character Name",
    "avatarUrl": "/path/to/avatar.png",
    "description": "Character description"
  }
]
```

### points.json
```json
[
  {
    "latitude": 53.1226,
    "longitude": 18.0013,
    "radiusMeters": 50,
    "locationLabel": "Location Name",
    "narrationText": "Text shown when user enters geofence",
    "audioUrl": "/path/to/audio.mp3",
    "rewardLabel": "Reward Name",
    "rewardIconUrl": "/path/to/icon.png",
    "isPublic": false,
    "characterId": 0  // Index in characters.json array (0-based), or null
  }
]
```

### paths.json
```json
[
  {
    "pathId": "route_010",
    "title": "Route Title",
    "shortDescription": "Brief description",
    "longDescription": "Detailed description",
    "category": "Category Name",
    "difficulty": "Easy",
    "totalTimeMinutes": 40,
    "distanceMeters": 1200,
    "thumbnailUrl": "/path/to/thumbnail.png",
    "isPublished": true,
    "stylePreset": "historic",
    "markerIconUrl": "/path/to/marker.png"
  }
]
```

### path-points.json
```json
[
  {
    "pathId": "route_010",
    "pointOrder": [
      {
        "locationLabel": "Location Name from points.json",
        "orderIndex": 0
      }
    ]
  }
]
```

## Important Notes

1. **Character References**: In `points.json`, `characterId` refers to the **index** (0-based) in the `characters.json` array, not the database ID.

2. **Point References**: In `path-points.json`, points are referenced by their `locationLabel` from `points.json`.

3. **Path References**: In `path-points.json`, paths are referenced by their `pathId` from `paths.json`.

4. **Admin User**: Seeds require an admin user to exist. The script uses the user with email from `DEFAULT_ADMIN_EMAIL` environment variable (default: `admin@admin.com`).

5. **Idempotency**: By default, the seed script is idempotent - it won't create duplicates. Use `FORCE_RESET_SEEDS=true` to force recreation.

## Adding New Seeds

1. Edit the appropriate JSON file(s)
2. Restart the Docker container or run `bun run seed` manually
3. If you need to reset existing data, use `FORCE_RESET_SEEDS=true bun run seed`

