// Mirrors the dashboard-shell palette in voiceflow-ai-web/app/globals.css.
export const COLORS = {
  navy: "#2563EB",
  navyDeep: "#1D4ED8",
  navySoft: "#3B82F6",
  amber: "#2563EB",
  amberDeep: "#1D4ED8",
  amberSoft: "#EAF2FF",
  teal: "#168669",
  tealSoft: "#DFF4ED",
  red: "#A8403A",
  redSoft: "#F4DFDB",
  signal: "#FACC15",
  paper: "#F7FAFF",
  cream: "#EFF5FD",
  panel: "#FFFFFF",
  border: "#DFE8F5",
  ink: "#111827",
  inkSoft: "#536078",
};

// Shared header styling keeps stack screens in step with the dashboard's blue brand.
export const headerScreenOptions = {
  headerStyle: { backgroundColor: COLORS.navyDeep },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
  headerBackButtonDisplayMode: "minimal" as const,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.paper },
};
