import * as cheerio from "cheerio";
import customDateFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";
import dayjs from "dayjs";

dayjs.extend(utc);
dayjs.extend(customDateFormat);

const DATE_SELECTORS = {
  VERY_OLD: ["strong:nth(1)", "strong:nth(2)", "strong:nth(3)"],
  CURRENT: ["strong:first", "strong:nth(1)", "strong:nth(2)"],
};

/**
 * @param {string} scheduleHTML
 */
export function parseSchedule(scheduleHTML) {
  const schedule = cheerio.load(scheduleHTML, {}, false);

  // * workaround for rmoat#1
  const dateSelector =
    schedule("strong:first > a").length > 0
      ? DATE_SELECTORS.VERY_OLD
      : DATE_SELECTORS.CURRENT;

  const registrationStartDate = schedule(dateSelector[0]).text();
  const registrationEndDate = schedule(dateSelector[1]).text();
  const tournamentStartDate = schedule(dateSelector[2]).text();

  const registrationStartDateTime = convertTimeStringToDate(
    "00:00",
    registrationStartDate,
  );
  const registrationEndDateTime = convertTimeStringToDate(
    schedule("u:first").text(),
    registrationEndDate,
  );
  const bracketShuffleDateTime = convertTimeStringToDate(
    schedule("u:nth(1)").text(),
    tournamentStartDate,
  );
  const tournamentStartDateTime = convertTimeStringToDate(
    schedule("u:nth(2)").text(),
    tournamentStartDate,
  );

  return {
    regStart: registrationStartDateTime,
    regEnd: registrationEndDateTime,
    playPreStart: bracketShuffleDateTime,
    playStart: tournamentStartDateTime,
  };
}

/**
 * @param {string} timeString
 * @param {string} dateString
 */
function convertTimeStringToDate(timeString, dateString = null) {
  const dateTimeString = `${dateString} ${timeString
    .replace("UTC", "")
    .replace("GMT", "")
    .trim()}`;

  return dayjs.utc(dateTimeString, "D.M.YYYY HH:mm", true).valueOf();
}

/** @param {string} dateString  */
export function utcDate(dateString) {
  return dayjs.utc(dateString);
}
