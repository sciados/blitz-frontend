// (landing)/layout.tsx
// Minimal layout for landing pages
// No header, sidebar, or navigation - pure marketing content

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
