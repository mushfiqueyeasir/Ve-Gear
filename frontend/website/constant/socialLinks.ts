import React from "react";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/Common/Icons";

export interface SocialLinkType {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  url: string;
  label: string;
}

export const socialLinks: SocialLinkType[] = [
  {
    icon: FacebookIcon,
    url: "http://www.facebook.com/atorsbd",
    label: "Facebook",
  },
  {
    icon: InstagramIcon,
    url: "https://www.instagram.com/atorsbd/",
    label: "Instagram",
  },
  {
    icon: TikTokIcon,
    url: "https://www.tiktok.com/@atorsbd",
    label: "TikTok",
  },
  {
    icon: WhatsAppIcon,
    url: "https://wa.me/8801570200858",
    label: "WhatsApp",
  },
];
