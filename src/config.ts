export interface SiteConfig {
  name: string;
  shortDescription: string;
  title: string;
  description: string;
  domain: string;
  url: string;
  ogImage: string;
  themeColor: string;
  author: string;
  keywords: string[];
  socials: {
    twitter?: string;
    github?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "ActualSizeRuler",
  shortDescription: "Accurate Screen Measurement Tool",
  title: "Online Ruler - Actual Size On-Screen Measuring Tool (cm/inch)",
  description: "Measure physical objects on your screen with our accurate actual size online ruler. Calibrate instantly with a credit card, coin, or screen size in cm, mm, and inches.",
  domain: "onlineruler.org",
  url: "https://onlineruler.org",
  ogImage: "/og-image.png",
  themeColor: "#4f46e5",
  author: "MANISH",
  keywords: [
    "online ruler",
    "actual size ruler",
    "virtual ruler",
    "ruler on screen",
    "screen measurement",
    "cm ruler actual size",
    "inches ruler actual size",
    "calibrated screen ruler"
  ],
  socials: {
    github: "https://github.com/manish/online-ruler",
    twitter: "https://twitter.com/manish"
  }
};
