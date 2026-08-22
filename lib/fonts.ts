// Curated Google Fonts the site owner can pick between. Keep this list small
// and all-modern so every option looks good without extra design work.
export type FontOption = {
  name: string;
  /** Value used in the Google Fonts CSS2 API URL, e.g. "Poppins:wght@400;500;600;700" */
  googleParam: string;
  /** CSS font-family stack applied site-wide. */
  stack: string;
  preview: string;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    name: "Inter",
    googleParam: "Inter:wght@400;500;600;700",
    stack: "'Inter', system-ui, sans-serif",
    preview: "Clean & neutral (default)"
  },
  {
    name: "Poppins",
    googleParam: "Poppins:wght@400;500;600;700",
    stack: "'Poppins', system-ui, sans-serif",
    preview: "Rounded, friendly, modern"
  },
  {
    name: "DM Sans",
    googleParam: "DM+Sans:wght@400;500;600;700",
    stack: "'DM Sans', system-ui, sans-serif",
    preview: "Geometric, minimal"
  },
  {
    name: "Nunito",
    googleParam: "Nunito:wght@400;600;700;800",
    stack: "'Nunito', system-ui, sans-serif",
    preview: "Soft, rounded, approachable"
  },
  {
    name: "Quicksand",
    googleParam: "Quicksand:wght@400;500;600;700",
    stack: "'Quicksand', system-ui, sans-serif",
    preview: "Playful, light, airy"
  },
  {
    name: "Work Sans",
    googleParam: "Work+Sans:wght@400;500;600;700",
    stack: "'Work Sans', system-ui, sans-serif",
    preview: "Sharp, professional"
  },
  {
    name: "Fraunces",
    googleParam: "Fraunces:wght@400;500;600;700",
    stack: "'Fraunces', serif",
    preview: "Elegant serif, boutique feel"
  }
];

export function getFontOption(name: string): FontOption {
  return FONT_OPTIONS.find((f) => f.name === name) || FONT_OPTIONS[0];
}
