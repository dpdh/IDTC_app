import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TwinLearn | Belajar Digital Twin",
  description: "Platform pembelajaran modern untuk Digital Twin, IoT, AI, dan analitik prediktif.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
