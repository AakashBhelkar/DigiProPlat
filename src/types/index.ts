export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  subscription: SubscriptionPlan;
  walletBalance: number;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'pro' | 'business';
  price: number;
  features: string[];
  limits: {
    products: number;
    storage: number; // in GB
    customDomain: boolean;
    aiGenerations: number;
  };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  files: ProductFile[];
  landingPageId?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
  sales: number;
  revenue: number;
}

export interface ProductFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  downloadCount: number;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  productId: string;
  userId: string;
  sections: PageSection[];
  customDomain?: string;
  isPublished: boolean;
  analytics: PageAnalytics;
  createdAt: string;
  updatedAt: string;
}

type PageSectionType =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'pricing'
  | 'gallery'
  | 'video'
  | 'countdown'
  | 'contact'
  | 'newsletter'
  | 'social'
  | 'custom';

type HeroContent = { title: string; subtitle: string; buttonText: string; backgroundImage: string };
type FeaturesContent = { title: string; features: { title: string; description: string }[] };
type TestimonialsContent = { title: string; testimonials: { name: string; quote: string; avatar?: string }[] };
type FAQContent = { title: string; faqs: { question: string; answer: string }[] };
type CTAContent = { title: string; subtitle: string; buttonText: string };
export type Currency = 'INR' | 'USD';
export type PricingPlan = { name: string; price: string; features: string[] };
type PricingContent = { title: string; plans: PricingPlan[]; currency: Currency };
type GalleryContent = { title: string; images: string[] };
type VideoContent = { title: string; videoUrl: string };
type CountdownContent = { title: string; endDate: string };
type ContactContent = { title: string; fields: { label: string; type: string; required: boolean }[]; integrations?: { googleSheets?: { connected: boolean; sheetName: string; sheetId: string } } };
type NewsletterContent = { title: string; description: string; placeholder: string; integrations?: { googleSheets?: { connected: boolean; sheetName: string; sheetId: string } } };
type SocialContent = { title: string; logos: string[] };
type CustomContent = { html: string };

type PageSectionContent =
  | HeroContent
  | FeaturesContent
  | TestimonialsContent
  | FAQContent
  | CTAContent
  | PricingContent
  | GalleryContent
  | VideoContent
  | CountdownContent
  | ContactContent
  | NewsletterContent
  | SocialContent
  | CustomContent;

type PageSectionStyles = {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  // Add more specific style keys here as needed
};

export interface PageSection {
  id: string;
  type: PageSectionType;
  content: PageSectionContent;
  styles: PageSectionStyles;
  order: number;
}

export interface PageAnalytics {
  views: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  productId?: string;
  userId: string;
  createdAt: string;
  paymentMethod: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  productId?: string;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  isActive: boolean;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  sections: PageSection[];
  category: TemplateCategory;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory =
  | 'SaaS'
  | 'Ecommerce'
  | 'Portfolio'
  | 'Agency'
  | 'App'
  | 'Event'
  | 'Personal'
  | 'Other';