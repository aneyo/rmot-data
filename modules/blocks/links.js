/**
 * @param {string[]} links
 */
export function resolvePostLinks(links) {
  const linksMap = new Map();
  for (const link of links) {
    if (typeof link !== "string") continue;
    const url = new URL(link);
    switch (url.hostname) {
      case "discord.gg":
      case "discord.com":
        linksMap.set("discord", url.toString());
        break;

      case "twitch.tv":
      case "www.twitch.tv":
        linksMap.set("twitch", url.toString());
        break;

      case "challonge.com":
        linksMap.set("challonge", url.toString());
        break;
    }
  }

  return Object.fromEntries(linksMap.entries());
}
