import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeContext";
import { BrandProvider } from "@/providers/BrandContext";
import { TenantProvider } from "@/providers/TenantContext";
import { AuthProvider } from "@/providers/AuthContext";
import { NotificationProvider } from "@/providers/NotificationContext";

export const metadata: Metadata = {
  title: "Workspace Portal",
  description: "Secure institutional management workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <BrandProvider>
            <TenantProvider>
              <AuthProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </AuthProvider>
            </TenantProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
