export const TITLE_MATCH =
  /rapid monthly(?: anime)? osu! tournament #(?<iteration>\d+) (?<type>\d+v\d+) (?<hrank>\d+k?)-(?<lrank>\d+k?)/i;

export const DESCRIPTION_RANKS_MATCH =
  /this\s+tournament\s+only\s+allows\s+players\s+with\s+a\s+global\s+ranking\s+of\s+#?(?<high>\d+k?(,\d+)?)\s+to\s+#?(?<low>\d+k?(,\d+)?)\.\s*participants\s+may\s+exceed\s+this\s+limit\s+by\s+(?<buffer>\d+k?(,\d+)?)/i;

export const MAP_SELECTOR_MATCH = /picked by (?<selector>.+)/i;

export const MAP_ID_MATCH =
  /osu\.ppy\.sh\/(?:b|beatmaps|beatmapsets\/\d+#osu)\/(?<id>\d+)/i;

export const SET_ID_MATCH = /osu\.ppy\.sh\/(?:s|beatmapsets)\/(?<id>\d+)/i;

export const FORUM_ID_MATCH =
  /osu\.ppy\.sh\/community\/forums\/topics\/(?<id>\d+)/i;

export const RANK_BUFFER_MATCH =
  /participants\s+may\s+exceed\s+this\s+limit\s+by\s+(?<buffer>\d+(,\d+)?k?)/i;

export const OSU_USER_ID_MATCH = /osu\.ppy\.sh\/u(?:sers)\/(?<id>\d+)/i;
