import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Verse — Learn, connect, create",
  description:
    "1,000 original DSA exercises, an interactive C, Java and Python function lab, adaptive learning, and worldwide hackathon news.",
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
              "try{var t=localStorage.getItem('dsa-theme');if(!['atelier','midnight','botanical','gallery'].includes(t))t=matchMedia('(prefers-color-scheme: dark)').matches?'midnight':'atelier';document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
