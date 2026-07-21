import type { SeoContentType } from "@/type/seoType";
import { appConfig } from "@/lib/config";

const siteUrl = appConfig.siteUrl;

export const SeoContent: SeoContentType = {
  baseSeo: {
    title: "VE Gear – Premium Gear & Essentials",
    description:
      "Shop premium gear and everyday essentials at VE Gear. Thoughtfully designed, high-quality pieces built to move with you.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}`,
    keywords: [
      "VE Gear",
      "Premium Gear",
      "Everyday Essentials",
      "Performance Wear",
      "Online Store",
      "Quality Gear",
      "Modern Design",
      "Lifestyle Brand",
    ],
  },
  aboutUsSeo: {
    title: "About Us | VE Gear",
    description:
      "Learn about VE Gear - where modern design meets everyday performance. Discover our mission to craft premium, dependable essentials with quality materials and contemporary design.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/about-us`,
    keywords: [
      "VE Gear",
      "About VE Gear",
      "Modern Design",
      "Quality Gear",
      "Contemporary Design",
      "Everyday Essentials",
      "Brand Story",
      "Brand Mission",
    ],
  },
  productSeo: {
    title: "Shop | VE Gear",
    description:
      "Explore the VE Gear collection of premium gear and essentials. Shop the latest drops, featured pieces, and best sellers.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/product`,
    keywords: [
      "VE Gear",
      "Collections",
      "Premium Gear",
      "New Drops",
      "Featured Products",
      "Online Shopping",
      "Best Sellers",
    ],
  },
  cartSeo: {
    title: "Shopping Cart | VE Gear",
    description:
      "Review your selected items in your VE Gear shopping cart. Continue shopping or proceed to a secure checkout.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/cart`,
    keywords: [
      "VE Gear",
      "Shopping Cart",
      "Online Shopping",
      "E-commerce",
      "Shopping Bag",
    ],
  },
  wishlistSeo: {
    title: "Favorites | VE Gear",
    description:
      "Your saved VE Gear favorites — kept on this device so you can come back anytime.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/wishlist`,
    keywords: [
      "VE Gear",
      "Favorites",
      "Wishlist",
      "Saved Products",
      "Streetwear",
    ],
  },
  checkoutSeo: {
    title: "Checkout | VE Gear",
    description:
      "Complete your purchase at VE Gear with a fast, secure checkout.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/checkout`,
    keywords: [
      "VE Gear",
      "Checkout",
      "Secure Checkout",
      "Online Payment",
      "E-commerce",
    ],
  },
  contactUsSeo: {
    title: "Contact Us | VE Gear",
    description:
      "Get in touch with VE Gear. Have questions? Contact us for customer support, inquiries, or feedback.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/contact-us`,
    keywords: [
      "VE Gear",
      "Contact VE Gear",
      "Customer Support",
      "Inquiries",
      "Customer Service",
    ],
  },
  reviewsSeo: {
    title: "Customer Reviews | VE Gear",
    description:
      "Read authentic customer reviews and see real photos from the VE Gear community. Discover what customers say about quality, comfort, and design.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/reviews`,
    keywords: [
      "VE Gear",
      "Customer Reviews",
      "Product Reviews",
      "Customer Testimonials",
      "Community",
    ],
  },
  privacyPolicySeo: {
    title: "Privacy Policy | VE Gear",
    description:
      "Read the VE Gear privacy policy to understand how we collect, use, and protect your personal information.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/privacy-policy`,
    keywords: [
      "VE Gear",
      "Privacy Policy",
      "Data Protection",
      "Privacy",
      "Personal Information",
      "Cookies",
      "Data Security",
    ],
  },
  termsOfServiceSeo: {
    title: "Terms and Conditions | VE Gear",
    description:
      "Read the VE Gear terms and conditions covering accounts, products, pricing, shipping, returns, and intellectual property.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/terms-of-service`,
    keywords: [
      "VE Gear",
      "Terms and Conditions",
      "Terms of Service",
      "User Agreement",
      "E-commerce Terms",
      "Legal Terms",
    ],
  },
  refundPolicySeo: {
    title: "Shipping & Return Policy | VE Gear",
    description:
      "Learn about VE Gear shipping and return policy. Find information about shipping options, delivery times, order tracking, and returns.",
    image: "/images/seoThumbnail/home.png",
    siteUrl: `${siteUrl}/refund-policy`,
    keywords: [
      "VE Gear",
      "Shipping Policy",
      "Return Policy",
      "Refund Policy",
      "Order Tracking",
      "Shipping Fees",
    ],
  },
  developer: {
    name: "Mushfique Yeasir",
    website: "https://mushfique-yeasir.netlify.app/",
    email: "mushfiqueyeasir@gmail.com",
  },
};
