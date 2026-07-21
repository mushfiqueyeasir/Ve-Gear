export interface ContactInfoType {
  icon: string;
  label: string;
  value: string;
}

export interface FooterSectionType {
  title: string;
  type: "contact" | "links" | "social";
  items?: ContactInfoType[];
  links?: { label: string; href: string }[];
}

export interface DeveloperInfoType {
  text: string;
  name: string;
  url: string;
}

export interface FooterDataType {
  sections: FooterSectionType[];
  copyright: string;
  developer: DeveloperInfoType;
}

export const footerData: FooterDataType = {
  sections: [
    {
      title: "VE GEAR INFO",
      type: "contact",
      items: [
        {
          icon: "📧",
          label: "E-mail:",
          value: "hello@vegear.com",
        },
      ],
    },
    {
      title: "POLICIES",
      type: "links",
      links: [
        {
          label: "Refund Policy",
          href: "/refund-policy",
        },
        {
          label: "Privacy Policy",
          href: "/privacy-policy",
        },
        {
          label: "Terms of Service",
          href: "/terms-of-service",
        },
        {
          label: "Contact Us",
          href: "/contact-us",
        },
      ],
    },
    {
      title: "FOLLOW US",
      type: "social",
    },
  ],
  copyright: "© 2025, VE Gear",
  developer: {
    text: "Developed by",
    name: "Mushfique Yeasir",
    url: "https://mushfique-yeasir.netlify.app/",
  },
};
