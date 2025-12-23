/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_N8N_BASE_URL: string
  // FUTURE: Stripe configuration (managed by N8N, not currently used)
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_STRIPE_ANNUAL_PRICE_ID?: string
  readonly VITE_STRIPE_ANNUAL_PRODUCT_ID?: string
  readonly VITE_STRIPE_MONTHLY_PRICE_ID?: string
  readonly VITE_STRIPE_MONTHLY_PRODUCT_ID?: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
