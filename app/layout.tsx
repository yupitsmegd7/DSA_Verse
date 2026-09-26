import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Verse — Learn, connect, create",
  description:
    "An artistic DSA studio with C, Java, Python, adaptive learning, a skill constellation, and worldwide hackathon news.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('dsa-theme');if(['atelier','midnight','botanical','gallery'].includes(t))document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
