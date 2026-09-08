import "./globals.css";

export const metadata = {
  title: "CNED Hub — Première 2026-2027",
  description: "Planning, cours et suivi des devoirs CNED",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3730a3" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="CNED Hub" />
      </head>
      <body className="bg-stone-50 dark:bg-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
