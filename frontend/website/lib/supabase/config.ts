export const BUCKETS = {
  product: "product-images",
  category: "category-images",
  review: "review-images",
  promotion: "promotion-images",
  branding: "branding",
  banner: "banner-images",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];
