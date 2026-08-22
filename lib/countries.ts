// Curated list of countries for the phone number field.
// `digits` is the exact number of digits required *after* the country code
// (Nepal mobile numbers are always 10 digits, e.g. 98XXXXXXXX).
export type Country = {
  code: string; // ISO code, used as the <option> key
  name: string;
  dial: string; // e.g. "+977"
  flag: string;
  digits: number; // required digit count for the local number
};

export const COUNTRIES: Country[] = [
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵", digits: 10 },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳", digits: 10 },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸", digits: 10 },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", digits: 10 },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺", digits: 9 },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪", digits: 9 },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦", digits: 9 },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦", digits: 8 },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "🇰🇼", digits: 8 },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾", digits: 9 },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵", digits: 10 },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳", digits: 11 },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩", digits: 10 },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰", digits: 10 },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", digits: 10 },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪", digits: 10 },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬", digits: 8 },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷", digits: 10 }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Nepal

export function findCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) || DEFAULT_COUNTRY;
}

export function findCountryByDial(dial: string): Country {
  return COUNTRIES.find((c) => c.dial === dial) || DEFAULT_COUNTRY;
}

// Strips everything except digits.
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Validates a local phone number (without dial code) against the selected country.
export function isValidPhoneForCountry(phone: string, countryCode: string): boolean {
  const country = findCountry(countryCode);
  const digits = onlyDigits(phone);
  return digits.length === country.digits;
}
