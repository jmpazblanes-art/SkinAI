
import { createClient } from "npm:@supabase/supabase-js@^2.39.7"
import Stripe from "npm:stripe@^14.16.0"

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

Deno.serve(async (req) => {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
        apiVersion: '2023-10-16',
    })

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET ?? ''
        )

        console.log(`Processing event: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const userId = session.metadata?.user_id;
            const customerEmail = session.customer_details?.email;

            console.log(`🔔 Checkout completed for: ${customerEmail} (ID: ${userId})`);

            const supabaseUrl = Deno.env.get('SUPABASE_URL');
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            const supabase = createClient(supabaseUrl!, supabaseKey!);

            if (userId) {
                console.log(`🚀 Upgrading user by ID: ${userId}`);
                const { error } = await supabase
                    .from('users')
                    .update({ subscription_tier: 'pro' })
                    .eq('id', userId);

                if (error) {
                    console.error(`❌ Error updating user by ID ${userId}:`, error.message);
                } else {
                    console.log(`✅ User ${userId} successfully upgraded to Pro.`);
                }
            } else if (customerEmail) {
                console.log(`🔍 No user_id in metadata. Searching by email: ${customerEmail}`);
                const { data: userData, error: fetchError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', customerEmail)
                    .single();

                if (fetchError || !userData) {
                    console.error(`❌ Could not find user with email ${customerEmail}:`, fetchError?.message);
                } else {
                    console.log(`🚀 Upgrading user found by email: ${userData.id}`);
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ subscription_tier: 'pro' })
                        .eq('id', userData.id);

                    if (updateError) {
                        console.error(`❌ Error updating user by email:`, updateError.message);
                    } else {
                        console.log(`✅ User with email ${customerEmail} upgraded to Pro.`);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
