// This file is currently unused as registration is handled via Supabase triggers.
// Keeping file for potential future n8n integrations.
export const registerUserWithN8N = async () => {
  console.warn('registerUserWithN8N is deprecated. Registration is handled by Supabase triggers.');
  return { success: true, user_id: 'deprecated' };
};