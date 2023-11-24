# rmot data repo

> everything here was coded in one day by sleep-deprived @aneyo  
> _update: i broke my sleeping schedule_

---

this repo contains basic tournament data about each [Rapid Tournaments](https://discord.gg/9sKe7nF) RMoT _(Rapid Monthly osu! Tournament)_ iteration.  
_data updates automatically._

## environment variables

- `OSU_API_KEY` - super-duper secret API key to use with [osu!APIv1](https://github.com/ppy/osu-api/wiki#api-version-10)
- `FORUM_URL` - forum url to search from. Defaults to [`https://osu.ppy.sh/community/forums/55`](https://osu.ppy.sh/community/forums/55)
- `MAX_PAGE_DEPTH` - max page count to search for. Default is `3`.
- `API_WAIT_TIME` - time to wait between beatmap API requests. Default is `1.5s`.
- `PAGE_WAIT_TIME` - time to wait between forum page requests. Default is `5s`.
- `PUBLIC_DIR_PATH` - relative path to the `public` directory. Default is `./public`.
- `STATE_DIR_PATH` - relative path to the `state` directory. Default is `./state`.
- `POOL_OUTDATED_TIME` - time to consider the pool to be outdated. Default is `7d`.

## scripts

- [`tools/lookup.js`](https://github.com/aneyo/rmot-data/tree/main/tools/lookup.js) - search forum listing for matching tournament posts and add them to the `state/lookup` file.
- [`tools/fetch.js`](https://github.com/aneyo/rmot-data/tree/main/tools/fetch.js) - fetch all posts from the `state/lookup` file.
- [`tools/generate/meta.js`](https://github.com/aneyo/rmot-data/tree/main/tools/generate/meta.js) - generate listing and meta files.
- [`tools/generate/readme.js`](https://github.com/aneyo/rmot-data/tree/main/tools/generate/readme.js) - generate [`readme.md`](https://github.com/aneyo/rmot-data/tree/data/readme.md) file from [`templates/tournament.md`](https://github.com/aneyo/rmot-data/tree/main/tools/templates/tournament.js) template for the latest tournament data.

## [data](https://github.com/aneyo/rmot-data/tree/data) branch structure

you can access latest data using:

- **GitHub Pages** - https://aneyo.github.io/rmot-data/<...>
- ...or just raw links, like: https://raw.githubusercontent.com/aneyo/rmot-data/data/tournaments/502525.json

data structure:

- [`/tournaments`](https://github.com/aneyo/rmot-data/tree/data/tournaments) ~ ([pages link](https://aneyo.github.io/rmot-data/tournaments/))
  - [`/<forumPostID>.json`](#tournament-data-file)
  - [`/index.json`](https://github.com/aneyo/rmot-data/tree/data/tournaments/index.json) - [listing file](#listing-file-indexjson)
- [`/pool`](https://github.com/aneyo/rmot-data/tree/data/pool) ~ ([pages link](https://aneyo.github.io/rmot-data/pool/))
  - [`/<forumPostID>.json`](#pool-data-file)
  - [`/index.json`](https://github.com/aneyo/rmot-data/tree/data/pool/index.json) - [listing file](#listing-file-indexjson)
- [`/meta.json`](https://github.com/aneyo/rmot-data/tree/data/meta.json) - [meta file](#meta-file-metajson) ~ ([pages link](https://aneyo.github.io/rmot-data/meta.json))
- [`/readme.md`](https://github.com/aneyo/rmot-data/tree/data/readme.md) - latest tournament cheatsheet ~ ([pages link](https://aneyo.github.io/rmot-data/))

## tournament data file

`/tournaments/<forumPostID>.json`

for example: [`/tournaments/992673.json`](https://github.com/aneyo/rmot-data/tree/data/tournaments/992673.json) <sup>as of 24.11.2023</sup>

```jsonc
{
  "ver": "1.1.0", // script package version, used to check for outdated data format
  "updated": 1700797899992, // update timestamp
  "forumID": "992673", // forum post id
  "tournamentID": 40, // tournament iteration
  "url": "https://osu.ppy.sh/community/forums/topics/992673", // forum post url
  "postedDate": 1575302099000, // forum post posted date
  "postedBy": {
    "id": "3328606", // forum post author id
    "name": "Redavor" // forum post author name (at the time of updating)
  },
  "cover": "https://assets.ppy.sh/topic-covers/5149/74665bcd89389ab19a1b08ebe858a368337e6fea8b528d2f293ae6fa009e3f6a.png", // forum post cover (could be null)
  "name": "Rapid Monthly osu! Tournament #40 1v1 30k-70k", // tournament title
  "banner": "https://i.ppy.sh/37d08a061c7eb8b449989b94f41507edfebbdfd1/68747470733a2f2f696d6775722d617263686976652e7070792e73682f347a47524642342e706e67", // forum post banner (could be null)
  "ranks": {
    "high": 30000, // highest rank boundary
    "low": 70000, // lowest rank boundary
    "buffer": 2000 // rank "buffer", could be 0
  },
  "links": {
    /* self-explanatory */
    "discord": "https://discord.gg/9sKe7nF",
    "twitch": "https://www.twitch.tv/rapid_tournaments",
    "challonge": "http://challonge.com/rmosutourney40"
  },
  "schedule": {
    /* registration timestamps */
    "regStart": 1575244800000,
    "regEnd": 1576274400000,
    /* bracket timestamps */
    "playPreStart": 1576335000000, // bracket shuffle
    "playStart": 1576335600000 // tournament start
  },
  "pool": {
    /* map pool metadata */
    "nm": [
      {
        "id": "2185147", // map id (could be null)
        "set": "1039791", // set id (could be null)
        "deleted": false, // is map deleted or not found
        "pickedBy": "Lefafel", // map selector
        "modSlot": "nm", // map's mod slot
        "modEnum": 0, // mod enum flag (see: https://github.com/ppy/osu-api/wiki#mods)
      }, ...
    ],
    "hd": [ ... ],
    "hr": [ ... ],
    "dt": [ ... ],
    "fm": [ ... ], // FreeMod is used up until (and including) rmot#44
    "tb": [ ... ],
    /* "<mod>": [ <maps> ] */
  }
}
```

> [!NOTE]
> To access more detailed pool data, you need to open the [pool data file](#pool-data-file), in this example it's [`/pool/992673.json`](https://github.com/aneyo/rmot-data/tree/data/pool/992673.json)

## pool data file

`/pool/<forumPostID>.json`

for example: [`/pool/1686102.json`](https://github.com/aneyo/rmot-data/tree/data/pool/1686102.json) <sup>as of 24.11.2023</sup>

```jsonc
{
  "ver": "1.1.0", // script package version, used to check for outdated data format
  "updated": 1700798670033, // update timestamp
  "forumID": "1686102", // forum post id
  "pool": {
    /* pool data for each mod-slot */
    "nm": [
      /* mod-slot maps in correct order */
      {
        /* data from osu!APIv1 /api/get_beatmaps */
        /* https://github.com/ppy/osu-api/wiki#response */

        "approved": "1", // 4 = loved, 3 = qualified, 2 = approved, 1 = ranked, 0 = pending, -1 = WIP, -2 = graveyard
        "submit_date": "2022-07-18 15:06:33", // date submitted, in UTC
        "approved_date": "2022-10-01 01:45:09", // date ranked, in UTC
        "last_update": "2022-09-18 10:07:34", // last update date, in UTC. May be after approved_date if map was unranked and reranked.

        "artist": "Kotoha",
        "artist_unicode": "Kotoha",
        "title": "Cat Loving",
        "title_unicode": "キャットラビング",

        "beatmap_id": "3711612", // beatmap_id is per difficulty
        "beatmapset_id": "1809604", // beatmapset_id groups difficulties into a set

        "bpm": "163",
        "creator": "Kotoha",
        "creator_id": "7823498",

        "difficultyrating": "4.81674", // The number of stars the map would have in-game and on the website
        "diff_aim": "2.35223",
        "diff_speed": "2.25631",
        "diff_size": "4", // Circle size value (CS)
        "diff_overall": "8", // Overall difficulty (OD)
        "diff_approach": "7", // Approach Rate (AR)
        "diff_drain": "5", // Health drain (HP)
        "hit_length": "114", // seconds from first note to last note not including breaks

        "source": "",
        "genre_id": "5", // 0 = any, 1 = unspecified, 2 = video game, 3 = anime, 4 = rock, 5 = pop, 6 = other, 7 = novelty, 9 = hip hop, 10 = electronic, 11 = metal, 12 = classical, 13 = folk, 14 = jazz (note that there's no 8)
        "language_id": "3", // 0 = any, 1 = unspecified, 2 = english, 3 = japanese, 4 = chinese, 5 = instrumental, 6 = korean, 7 = french, 8 = german, 9 = swedish, 10 = spanish, 11 = italian, 12 = russian, 13 = polish, 14 = other
        "total_length": "114", // seconds from first note to last note including breaks
        "version": "bongo's Insane", // difficulty name

        "file_md5": "79ac3bd2dd4e13d2445c67ea5a0f8eff", // md5 hash of the beatmap

        "mode": "0", // game mode
        "tags": "blitzifyyy mocaotic bongo ayucchi japanese pop j-pop jpop cat rubbing 香椎モイミ moimi kashii hakoniwalily ハコニワリリィ honeyworks ハニーワークス ハニワ kamitsubaki studio 神椿スタジオ", // Beatmap tags separated by spaces.
        "favourite_count": "387", // Number of times the beatmap was favourited. (Americans: notice the ou!)
        "rating": "8.77027",
        "playcount": "72469", // Number of times the beatmap was played
        "passcount": "10638", // Number of times the beatmap was passed, completed (the user didn't fail or retry)

        "count_normal": "385",
        "count_slider": "101",
        "count_spinner": "0",
        "max_combo": "588", // The maximum combo a user can reach playing this beatmap.

        "storyboard": "0", // If this beatmap has a storyboard
        "video": "0", // If this beatmap has a video
        "download_unavailable": "0", // If the download for this beatmap is unavailable (old map, etc.)
        "audio_unavailable": "0", // If the audio for this beatmap is unavailable (DMCA takedown, etc.)

        "packs": "S1225",

        /* fetch data */
        "updated_at": 1700798670311, // fetch update time
        "mod_enum": 0, // mod enum flag (see: https://github.com/ppy/osu-api/wiki#mods)
        "mod_slot": "nm", // map's mod
        "picked_by": "Lefafel", // who picked this map
        "was_set_link": false // was this map linked as a set (osu.ppy.sh/s/123456)

        /* deleted: <boolean> - if deleted is true, no API data will be presented */
      }, ...
    ],
    "hd": [ ... ],
    "hr": [ ... ],
    "dt": [ ... ],
    "tb": [ ... ],
    /* "<mod>": [ <maps> ] */
  }
}
```

## listing file `index.json`

```jsonc
{
  "version": "1.0.0", // script package version, used to check for outdated data format
  "latest": "1845106", // latest forum post ID(from listing data), use this to get the latest tournament data
  "updated": 1700842915316, // update timestamp
  "listing": [
    /* forum ids listing, order is from new to old */
    ...,
    "992673"
  ],
  "hash": "8ed2de7edd394c1349d450f4e531112e" // listing hash, sum of all data files mtime hashed with md5
}
```

## meta file [`meta.json`](https://github.com/aneyo/rmot-data/blob/data/meta.json)

```jsonc
{
  "version": "1.0.0", // script package version, used to check for outdated data format
  "updated": 1700842915317, // update timestamp
  "latest": "1845106", // latest forum post ID, use this to get the latest tournament data
  "hash": "76075095236cb307620390f87714be35" // meta hash, sum of tournament and pool listing hashes hashed with md5
}
```

## things to do

- [ ] Include players data
- [ ] (?) Include brackets data.
- [ ] Generate statistics

---

(❁´◡`❁) _good luck and have fun!_
