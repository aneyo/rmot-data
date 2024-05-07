# <%= tournament.name %>

> tournament data updated @ `<%= getUTCTime(tournament.updated) %>`  
> pool data updated @ `<%= getUTCTime(pool.updated) %>`

## Links

<%= getLinks().map(l => `[**${l.name}**](${l.url})`).join(" | ") %>

## Schedule

### [**Check current UTC/GMT time**](https://www.utctime.net)

- `<%= getUTCTime(tournament.postedDate) %>` - registration start
- `<%= getUTCTime(tournament.schedule.regEnd) %>` - registration end
- `<%= getUTCTime(tournament.schedule.playPreStart) %>` - bracket shuffle
- `<%= getUTCTime(tournament.schedule.playStart) %>` - start of the tournament
- _add ~30 minutes to each round after that_

<%_ if(pool != null) { _%>

## Mappool

<%_ if(true){} _%>
| | Map | ID | Command | Download |
| --- | --- | --- | ------- | -------- |
<%_ const mods = Object.keys(pool.pool); _%>
<%_ for(let m = 0; m < mods.length; m++) { _%>
<%_ const mod = mods[m]; _%>
| | | | `!mp mods <%= resolveSlot(mod) %>` |
<%_ for(let i = 0; i < pool.pool[mod].length; i++) { _%>
<%_ const map = pool.pool[mod][i] _%>
| **<%= mod.toUpperCase() + (i+1) %>** | [<%= map.title %> - <%= map.artist %> [<%= map.version %>]](<%= generateDownloadLink(map, 4) %>) | `<%= map.beatmap_id %>` | `!mp map <%= map.beatmap_id %>` | [BeatConnect](<%= generateDownloadLink(map, 1) %>) \| [NeriNyan](<%= generateDownloadLink(map, 2)  %>) \| [Chimu.moe](<%= generateDownloadLink(map, 3) %>) |
<%_ } _%>
<%_ } _%>

---

<%_ } _%>

## Useful multiplayer commands

`!mp where <playername>` - used to check if the user is online.  
`!mp invite <playername>` - invite player to current multiplayer room.  
`!mp set 2 0 2` - set multiplayer room to `TeamVS`, winning parameter to `Score` and room size to `2` players.  
`!mp start 10` - start a map after `10` seconds.

---

(❁´◡`❁) _good luck and have fun!_
