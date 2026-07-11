// Mirrors the color tokens used in voiceflow-ai-web/app/globals.css, so the phone app
// and the web dashboard read as the same product.
export const COLORS = {
  navy: "#1E2740",
  navyDeep: "#131A2C",
  navySoft: "#2C3654",
  amber: "#D89B3C",
  amberDeep: "#B87F28",
  teal: "#2F9E8F",
  red: "#C94F4F",
  // Clean, high-contrast yellow for the "AI is listening" pulse dot - distinct from
  // `amber` (a muted gold used as the brand accent elsewhere).
  signal: "#FACC15",
  paper: "#F7F7F5",
  panel: "#FFFFFF",
  ink: "#171B26",
  inkSoft: "#4B5165",
};

// Shared header styling so every stack navigator (tabs root, appointment/customer
// sub-stacks, settings sub-screens) renders the same navy header as the web sidebar.
export const headerScreenOptions = {
  headerStyle: { backgroundColor: COLORS.navy },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
  headerBackButtonDisplayMode: "minimal" as const,
};
