// (auth)/layout.tsx
// Minimal layout for authentication pages (login, register)
// No header, sidebar, or navigation - pages control their own full-width styling

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
