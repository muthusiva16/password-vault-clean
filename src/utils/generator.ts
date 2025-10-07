const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUM = "23456789";
const SYM = "!@#$%^&*()-_=+[]{};:,.<>/?";

export function generatePassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}) {
  const { length, upper, lower, numbers, symbols } = opts;
  let alphabet = "";
  if (upper) alphabet += UPPER;
  if (lower) alphabet += LOWER;
  if (numbers) alphabet += NUM;
  if (symbols) alphabet += SYM;
  if (!alphabet) return "";

  let out = "";
  const arr = new Uint32Array(length);
  window.crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    out += alphabet[arr[i] % alphabet.length];
  }
  return out;
}
