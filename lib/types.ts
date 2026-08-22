export type StockStatus = "in_stock" | "limited" | "sold_out";

export type VariantOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  size: string;
  image: string;
  galleryImages: string[];
  videoUrl?: string;
  variants: VariantOption[];
  stockStatus: StockStatus;
  isFeatured: boolean;
  isActive: boolean;
  isComingSoon: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  comingSoon: boolean;
  sortOrder: number;
};

export type HomepageWhyItem = {
  icon: string;
  title: string;
  desc: string;
};

export type HomepageStep = {
  title: string;
  desc: string;
};

export type HomepageContent = {
  availableTitle: string;
  availableSubtitle: string;
  whyTitle: string;
  whyItems: HomepageWhyItem[];
  howToOrderTitle: string;
  steps: HomepageStep[];
  deliveryTitle: string;
  comingSoonTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
};

export type SiteSettings = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  businessHours: string;
  deliveryAreas: string[];
  deliveryNote: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
  bannerImage: string;
  bannerBadge: string;
  bannerHeadline: string;
  bannerSubheading: string;
  bannerTemplate: "classic" | "split";
  homepageContent: HomepageContent;
};

export type AdminPermissions = {
  products: boolean;
  content: boolean;
  users: boolean;
};

export type AdminUser = {
  id: string;
  username: string;
  isOwner: boolean;
  permissions: AdminPermissions;
  createdAt: string;
};
