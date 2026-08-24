import { supabaseAdmin } from "./supabaseClient";
import type {
  Product,
  Category,
  SiteSettings,
  AdminUser,
  AdminPermissions,
  HomepageContent,
  BannerSlide,
  Customer,
  ProductComment,
  CustomerOrder,
  CustomerOrderItem
} from "./types";

// ---- row <-> app-type mapping ----

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  availableTitle: "Available now",
  availableSubtitle: "Explore our currently available aquarium fish.",
  whyTitle: "Why choose Maccha Bazar",
  whyItems: [
    { icon: "Egg", title: "Home bred", desc: "Fish are raised with care in a controlled home environment." },
    { icon: "Fish", title: "Carefully raised", desc: "We focus on maintaining healthy fish and proper aquarium conditions." },
    { icon: "Camera", title: "Real fish photos", desc: "We use actual product photos whenever possible." },
    { icon: "Truck", title: "Valley delivery", desc: "Convenient live fish delivery inside Kathmandu Valley." }
  ],
  howToOrderTitle: "How to order",
  steps: [
    { title: "Choose your fish", desc: "Browse available fish." },
    { title: "Send your order", desc: "Message us through WhatsApp." },
    { title: "Confirm details", desc: "We confirm availability, price and delivery." },
    { title: "Receive your fish", desc: "Get your fish delivered safely." }
  ],
  deliveryTitle: "Safe live fish delivery",
  comingSoonTitle: "More coming soon",
  ctaTitle: "Looking for a specific fish?",
  ctaSubtitle: "Can't find what you're looking for? Message us and ask about current availability."
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_slug: string;
  description: string;
  short_description: string;
  size: string;
  image: string;
  gallery_images: string[];
  video_url: string | null;
  variants: Product["variants"];
  stock_status: Product["stockStatus"];
  is_featured: boolean;
  is_active: boolean;
  is_coming_soon: boolean;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  coming_soon: boolean;
  sort_order: number;
};

type SettingsRow = {
  id: number;
  business_name: string;
  tagline: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  business_hours: string;
  delivery_areas: string[];
  delivery_note: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string | null;
  logo_size: string | null;
  banner_image: string | null;
  banner_badge: string | null;
  banner_headline: string | null;
  banner_subheading: string | null;
  banner_template: string | null;
  banner_slides: BannerSlide[] | null;
  primary_color: string | null;
  accent_color: string | null;
  highlight_color: string | null;
  site_font: string | null;
  homepage_content: HomepageContent | null;
  show_about_page: boolean | null;
  show_delivery_page: boolean | null;
};

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  is_owner: boolean;
  can_manage_products: boolean;
  can_manage_content: boolean;
  can_manage_users: boolean;
  created_at: string;
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    categorySlug: r.category_slug,
    description: r.description,
    shortDescription: r.short_description,
    size: r.size,
    image: r.image,
    galleryImages: r.gallery_images,
    videoUrl: r.video_url || undefined,
    variants: r.variants,
    stockStatus: r.stock_status,
    isFeatured: r.is_featured,
    isActive: r.is_active,
    isComingSoon: r.is_coming_soon,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    category_slug: p.categorySlug,
    description: p.description,
    short_description: p.shortDescription,
    size: p.size,
    image: p.image,
    gallery_images: p.galleryImages,
    video_url: p.videoUrl || null,
    variants: p.variants,
    stock_status: p.stockStatus,
    is_featured: p.isFeatured,
    is_active: p.isActive,
    is_coming_soon: p.isComingSoon,
    created_at: p.createdAt,
    updated_at: p.updatedAt
  };
}

function rowToCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    active: r.active,
    comingSoon: r.coming_soon,
    sortOrder: r.sort_order
  };
}

function rowToSettings(r: SettingsRow): SiteSettings {
  return {
    businessName: r.business_name,
    tagline: r.tagline,
    phone: r.phone,
    whatsappNumber: r.whatsapp_number,
    email: r.email,
    address: r.address,
    businessHours: r.business_hours,
    deliveryAreas: r.delivery_areas,
    deliveryNote: r.delivery_note,
    facebookUrl: r.facebook_url,
    instagramUrl: r.instagram_url,
    logoUrl: r.logo_url || "",
    logoSize: r.logo_size === "small" || r.logo_size === "large" ? r.logo_size : "medium",
    bannerImage: r.banner_image || "",
    bannerBadge: r.banner_badge || "Kathmandu Valley delivery",
    bannerHeadline: r.banner_headline || "Bring home something beautiful.",
    bannerSubheading: r.banner_subheading || "Healthy, carefully raised aquarium fish for your home.",
    bannerTemplate: (["classic", "split", "centered", "card", "gradient", "carousel"].includes(r.banner_template || "")
      ? r.banner_template
      : "classic") as SiteSettings["bannerTemplate"],
    bannerSlides: Array.isArray(r.banner_slides) ? r.banner_slides.slice(0, 5) : [],
    primaryColor: r.primary_color || "#2B1B33",
    accentColor: r.accent_color || "#D65E8C",
    highlightColor: r.highlight_color || "#F0B84C",
    siteFont: r.site_font || "Inter",
    homepageContent: r.homepage_content
      ? { ...DEFAULT_HOMEPAGE_CONTENT, ...r.homepage_content }
      : DEFAULT_HOMEPAGE_CONTENT,
    showAboutPage: r.show_about_page !== false,
    showDeliveryPage: r.show_delivery_page !== false
  };
}

function settingsToRow(s: SiteSettings): SettingsRow {
  return {
    id: 1,
    business_name: s.businessName,
    tagline: s.tagline,
    phone: s.phone,
    whatsapp_number: s.whatsappNumber,
    email: s.email,
    address: s.address,
    business_hours: s.businessHours,
    delivery_areas: s.deliveryAreas,
    delivery_note: s.deliveryNote,
    facebook_url: s.facebookUrl,
    instagram_url: s.instagramUrl,
    logo_url: s.logoUrl || null,
    logo_size: s.logoSize || "medium",
    banner_image: s.bannerImage || null,
    banner_badge: s.bannerBadge || null,
    banner_headline: s.bannerHeadline || null,
    banner_subheading: s.bannerSubheading || null,
    banner_template: s.bannerTemplate || "classic",
    banner_slides: s.bannerSlides || [],
    primary_color: s.primaryColor || null,
    accent_color: s.accentColor || null,
    highlight_color: s.highlightColor || null,
    site_font: s.siteFont || null,
    homepage_content: s.homepageContent || null,
    show_about_page: s.showAboutPage !== false,
    show_delivery_page: s.showDeliveryPage !== false
  };
}

function rowToAdminUser(r: AdminUserRow): AdminUser {
  return {
    id: r.id,
    username: r.username,
    isOwner: r.is_owner,
    permissions: {
      products: r.can_manage_products,
      content: r.can_manage_content,
      users: r.can_manage_users
    },
    createdAt: r.created_at
  };
}

// ---- products ----

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.isActive && !p.isComingSoon);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : undefined;
}

export async function addProduct(product: Product): Promise<Product> {
  const { data, error } = await supabaseAdmin.from("products").insert(productToRow(product)).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined> {
  const existing = await supabaseAdmin.from("products").select("*").eq("id", id).maybeSingle();
  if (existing.error) throw existing.error;
  if (!existing.data) return undefined;

  const merged: Product = { ...rowToProduct(existing.data as ProductRow), ...patch, updatedAt: new Date().toISOString() };
  const { data, error } = await supabaseAdmin.from("products").update(productToRow(merged)).eq("id", id).select().single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---- categories ----

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(rowToCategory);
}

// ---- settings ----

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return rowToSettings(data as SettingsRow);
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { error } = await supabaseAdmin.from("site_settings").upsert(settingsToRow(settings));
  if (error) throw error;
}

// ---- admin users ----

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as AdminUserRow[]).map(rowToAdminUser);
}

export async function getAdminUserByUsername(username: string): Promise<(AdminUser & { passwordHash: string }) | undefined> {
  const { data, error } = await supabaseAdmin.from("admin_users").select("*").eq("username", username).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const row = data as AdminUserRow;
  return { ...rowToAdminUser(row), passwordHash: row.password_hash };
}

export async function createAdminUser(input: {
  username: string;
  passwordHash: string;
  isOwner: boolean;
  permissions: AdminPermissions;
}): Promise<AdminUser> {
  const row = {
    id: `u${Date.now()}`,
    username: input.username,
    password_hash: input.passwordHash,
    is_owner: input.isOwner,
    can_manage_products: input.permissions.products,
    can_manage_content: input.permissions.content,
    can_manage_users: input.permissions.users,
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabaseAdmin.from("admin_users").insert(row).select().single();
  if (error) throw error;
  return rowToAdminUser(data as AdminUserRow);
}

export async function deleteAdminUser(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id);
  if (error) throw error;
}
// ---- page content ----

type PageContentRow = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  updated_at: string;
};

export type PageContent = {
  id: string;
  title: string;
  content: string;
  image: string;
  updatedAt: string;
};

export async function getPageContent(id: string): Promise<PageContent | null> {
  const { data, error } = await supabaseAdmin
    .from("page_content")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = data as PageContentRow;
  return { id: r.id, title: r.title, content: r.content, image: r.image || "", updatedAt: r.updated_at };
}

export async function savePageContent(id: string, title: string, content: string, image: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("page_content")
    .upsert({ id, title, content, image: image || null, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getAllPageContent(): Promise<PageContent[]> {
  const { data, error } = await supabaseAdmin
    .from("page_content")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data as PageContentRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    image: r.image || "",
    updatedAt: r.updated_at,
  }));
}

// ---- customers ----

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  phone_country_code: string;
  email: string;
  password_hash: string;
  address: string;
  delivery_area: string;
  notes: string;
  avatar_url: string | null;
  email_verified: boolean;
  verification_code_hash: string | null;
  verification_expires_at: string | null;
  verification_sent_at: string | null;
  reset_code_hash: string | null;
  reset_expires_at: string | null;
  reset_sent_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToCustomer(r: CustomerRow): Customer {
  return {
    id: r.id,
    name: r.name || "",
    phone: r.phone || "",
    phoneCountryCode: r.phone_country_code || "+977",
    email: r.email,
    passwordHash: r.password_hash,
    address: r.address || "",
    deliveryArea: r.delivery_area || "",
    notes: r.notes || "",
    avatarUrl: r.avatar_url || "",
    emailVerified: !!r.email_verified,
    verificationCodeHash: r.verification_code_hash,
    verificationExpiresAt: r.verification_expires_at,
    verificationSentAt: r.verification_sent_at,
    resetCodeHash: r.reset_code_hash,
    resetExpiresAt: r.reset_expires_at,
    resetSentAt: r.reset_sent_at,
    lastLoginAt: r.last_login_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CustomerRow[]).map(rowToCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const { data, error } = await supabaseAdmin.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data as CustomerRow) : undefined;
}

export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data as CustomerRow) : undefined;
}

export async function createCustomer(input: {
  name: string;
  phone?: string;
  phoneCountryCode?: string;
  email: string;
  passwordHash: string;
  address?: string;
  deliveryArea?: string;
  emailVerified?: boolean;
  verificationCodeHash?: string;
  verificationExpiresAt?: string;
}): Promise<Customer> {
  const now = new Date().toISOString();
  const row = {
    id: `c${Date.now()}`,
    name: input.name,
    phone: input.phone || "",
    phone_country_code: input.phoneCountryCode || "+977",
    email: input.email.toLowerCase().trim(),
    password_hash: input.passwordHash,
    address: input.address || "",
    delivery_area: input.deliveryArea || "",
    notes: "",
    avatar_url: "",
    email_verified: input.emailVerified ?? false,
    verification_code_hash: input.verificationCodeHash || null,
    verification_expires_at: input.verificationExpiresAt || null,
    verification_sent_at: input.verificationCodeHash ? now : null,
    created_at: now,
    updated_at: now
  };
  const { data, error } = await supabaseAdmin.from("customers").insert(row).select().single();
  if (error) throw error;
  return rowToCustomer(data as CustomerRow);
}

export async function updateCustomer(
  id: string,
  patch: Partial<{
    name: string;
    phone: string;
    phoneCountryCode: string;
    address: string;
    deliveryArea: string;
    notes: string;
    avatarUrl: string;
  }>
): Promise<Customer | undefined> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.phoneCountryCode !== undefined) row.phone_country_code = patch.phoneCountryCode;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.deliveryArea !== undefined) row.delivery_area = patch.deliveryArea;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;

  const { data, error } = await supabaseAdmin.from("customers").update(row).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data as CustomerRow) : undefined;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function touchCustomerLogin(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customers")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ---- customer email verification ----

export async function getCustomerVerificationState(email: string): Promise<{
  name: string;
  emailVerified: boolean;
  verificationCodeHash: string | null;
  verificationExpiresAt: string | null;
  verificationSentAt: string | null;
} | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;
  return {
    name: customer.name,
    emailVerified: customer.emailVerified,
    verificationCodeHash: customer.verificationCodeHash,
    verificationExpiresAt: customer.verificationExpiresAt,
    verificationSentAt: customer.verificationSentAt
  };
}

export async function setCustomerVerificationCode(
  email: string,
  codeHash: string,
  expiresAt: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customers")
    .update({
      verification_code_hash: codeHash,
      verification_expires_at: expiresAt,
      verification_sent_at: new Date().toISOString()
    })
    .eq("email", email.toLowerCase().trim());
  if (error) throw error;
}

export async function markCustomerEmailVerified(email: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customers")
    .update({
      email_verified: true,
      verification_code_hash: null,
      verification_expires_at: null
    })
    .eq("email", email.toLowerCase().trim());
  if (error) throw error;
}

// ---- customer password reset ----

export async function getCustomerResetState(email: string): Promise<{
  name: string;
  resetCodeHash: string | null;
  resetExpiresAt: string | null;
  resetSentAt: string | null;
} | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;
  return {
    name: customer.name,
    resetCodeHash: customer.resetCodeHash,
    resetExpiresAt: customer.resetExpiresAt,
    resetSentAt: customer.resetSentAt
  };
}

export async function setCustomerResetCode(email: string, codeHash: string, expiresAt: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customers")
    .update({
      reset_code_hash: codeHash,
      reset_expires_at: expiresAt,
      reset_sent_at: new Date().toISOString()
    })
    .eq("email", email.toLowerCase().trim());
  if (error) throw error;
}

export async function resetCustomerPassword(email: string, passwordHash: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customers")
    .update({
      password_hash: passwordHash,
      reset_code_hash: null,
      reset_expires_at: null
    })
    .eq("email", email.toLowerCase().trim());
  if (error) throw error;
}

// ---- product comments / reviews ----

type ProductCommentRow = {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

function rowToComment(r: ProductCommentRow): ProductComment {
  return {
    id: r.id,
    productId: r.product_id,
    customerId: r.customer_id,
    customerName: r.customer_name || "",
    customerAvatar: r.customer_avatar || "",
    rating: r.rating,
    comment: r.comment || "",
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export async function getAllProductComments(): Promise<ProductComment[]> {
  const { data, error } = await supabaseAdmin
    .from("product_comments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProductCommentRow[]).map(rowToComment);
}

export async function getCommentsByProductId(productId: string): Promise<ProductComment[]> {
  const { data, error } = await supabaseAdmin
    .from("product_comments")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProductCommentRow[]).map(rowToComment);
}

export async function getCommentByCustomerForProduct(
  productId: string,
  customerId: string
): Promise<ProductComment | undefined> {
  const { data, error } = await supabaseAdmin
    .from("product_comments")
    .select("*")
    .eq("product_id", productId)
    .eq("customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToComment(data as ProductCommentRow) : undefined;
}

export async function addProductComment(input: {
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
}): Promise<ProductComment> {
  const now = new Date().toISOString();
  const row = {
    id: `pc${Date.now()}`,
    product_id: input.productId,
    customer_id: input.customerId,
    customer_name: input.customerName,
    customer_avatar: input.customerAvatar || "",
    rating: input.rating,
    comment: input.comment,
    created_at: now,
    updated_at: now
  };
  const { data, error } = await supabaseAdmin.from("product_comments").insert(row).select().single();
  if (error) throw error;
  return rowToComment(data as ProductCommentRow);
}

export async function updateProductComment(
  id: string,
  customerId: string,
  patch: { rating: number; comment: string }
): Promise<ProductComment | undefined> {
  const { data, error } = await supabaseAdmin
    .from("product_comments")
    .update({ rating: patch.rating, comment: patch.comment, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("customer_id", customerId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToComment(data as ProductCommentRow) : undefined;
}

export async function deleteProductComment(id: string, customerId?: string): Promise<void> {
  let query = supabaseAdmin.from("product_comments").delete().eq("id", id);
  if (customerId) query = query.eq("customer_id", customerId);
  const { error } = await query;
  if (error) throw error;
}

// ---- customer orders (activity log) ----

type CustomerOrderRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  delivery_area: string;
  items: CustomerOrderItem[];
  total_price: number;
  item_count: number;
  created_at: string;
};

function rowToOrder(r: CustomerOrderRow): CustomerOrder {
  return {
    id: r.id,
    customerId: r.customer_id,
    customerName: r.customer_name || "",
    customerPhone: r.customer_phone || "",
    customerEmail: r.customer_email || "",
    customerAddress: r.customer_address || "",
    deliveryArea: r.delivery_area || "",
    items: r.items || [],
    totalPrice: r.total_price || 0,
    itemCount: r.item_count || 0,
    createdAt: r.created_at
  };
}

export async function createCustomerOrder(input: {
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  deliveryArea: string;
  items: CustomerOrderItem[];
  totalPrice: number;
}): Promise<CustomerOrder> {
  const itemCount = input.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const row = {
    id: `o${Date.now()}`,
    customer_id: input.customerId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    customer_address: input.customerAddress,
    delivery_area: input.deliveryArea,
    items: input.items,
    total_price: input.totalPrice,
    item_count: itemCount,
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabaseAdmin.from("customer_orders").insert(row).select().single();
  if (error) throw error;
  return rowToOrder(data as CustomerOrderRow);
}

export async function getOrdersByCustomerId(customerId: string): Promise<CustomerOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("customer_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CustomerOrderRow[]).map(rowToOrder);
}

export async function getAllCustomerOrders(limit = 50): Promise<CustomerOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("customer_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as CustomerOrderRow[]).map(rowToOrder);
}

export async function getCustomerOrderCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin.from("customer_orders").select("customer_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data as { customer_id: string | null }[]) {
    if (!row.customer_id) continue;
    counts[row.customer_id] = (counts[row.customer_id] || 0) + 1;
  }
  return counts;
}
