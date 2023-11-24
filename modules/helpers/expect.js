import path from "path";

export function expectNumberFromString(stringValue, defaultNumber) {
  if (typeof stringValue !== "string" || isNaN(+stringValue))
    return defaultNumber;
  return +stringValue;
}

export function expectBoolFromString(stringValue, defaultBoolean) {
  if (typeof stringValue !== "string") return defaultBoolean;
  return stringValue.toLowerCase() === "true";
}

export function expectString(stringValue, defaultString) {
  if (typeof stringValue !== "string") return defaultString;
  return stringValue;
}

export function expectNumber(numberValue, defaultNumber) {
  if (typeof numberValue !== "number" || isNaN(numberValue))
    return defaultNumber;
  return numberValue;
}

export function expectPathFromString(stringValue, defaultPath) {
  return path.resolve(
    typeof stringValue !== "string" ? defaultPath : stringValue,
  );
}
