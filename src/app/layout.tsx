import mantineTheme from "@/theme/mantineTheme";
import "@mantine/charts/styles.css";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { emotionTransform, MantineEmotionProvider } from "@mantine/emotion";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootStyleRegistry } from "./EmotionRootStyleRegistry";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Upwork Earnings Dashboard",
  description: "Track your monthly Upwork earnings and income trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${process.env.NEXT_PUBLIC_GA_ID});`}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RootStyleRegistry>
          <MantineProvider
            defaultColorScheme="dark"
            stylesTransform={emotionTransform}
            theme={mantineTheme}
          >
            <MantineEmotionProvider>{children}</MantineEmotionProvider>
          </MantineProvider>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
