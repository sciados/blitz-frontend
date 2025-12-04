// app/layout.tsx
import "src/app/globals.css";
import { ThemeProvider } from "src/contexts/ThemeContext";
import { Providers } from "src/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
