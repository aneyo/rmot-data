import path from "path";
import parseDuration from "parse-duration";

export function expectNumberFromString(stringValue, fallbackNumber) {
  if (typeof stringValue !== "string" || isNaN(+stringValue))
    return fallbackNumber;
  return +stringValue;
}

export function expectBoolFromString(stringValue, fallbackBoolean) {
  if (typeof stringValue !== "string") return fallbackBoolean;
  return stringValue.toLowerCase() === "true";
}

export function expectString(stringValue, fallbackString) {
  if (typeof stringValue !== "string") return fallbackString;
  return stringValue;
}

export function expectNumber(numberValue, fallbackNumber) {
  if (typeof numberValue !== "number" || isNaN(numberValue))
    return fallbackNumber;
  return numberValue;
}

export function expectPathFromString(stringValue, fallbackPath) {
  return path.resolve(
    typeof stringValue !== "string" ? fallbackPath : stringValue,
  );
}

export function expectDurationFromString(stringValue, fallbackString) {
  return parseDuration(expectString(stringValue, fallbackString));
}
