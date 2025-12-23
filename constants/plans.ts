/**
 * FUTURE: Stripe Plans Configuration
 *
 * Este archivo contiene la configuración de planes de suscripción para Stripe.
 * ACTUALMENTE NO SE USA. Los pagos se gestionarán a través de webhooks de n8n.
 *
 * Cuando se implemente el webhook de Stripe en n8n, esta configuración será
 * utilizada para crear sesiones de checkout.
 *
 * Referencia: Ver lib/n8n-webhooks.ts función createStripeCheckout()
 */

export const plans = [
  {
    name: 'Monthly',
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
    productId: import.meta.env.VITE_STRIPE_MONTHLY_PRODUCT_ID,
  },
  {
    name: 'Annual',
    priceId: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID,
    productId: import.meta.env.VITE_STRIPE_ANNUAL_PRODUCT_ID,
  },
];

// Nota: El nombre de la exportación anterior "प्लांस" (en Hindi) ha sido cambiado a "plans"
// para mantener consistencia con el código en inglés.
