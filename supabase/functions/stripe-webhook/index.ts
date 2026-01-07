
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
            const session = event.data.object
            const userId = session.metadata?.user_id

            if (userId) {
                console.log(`Upgrading user ${userId} to Pro...`)

                const supabaseUrl = Deno.env.get('SUPABASE_URL')
                const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
                const supabase = createClient(supabaseUrl!, supabaseKey!)

                const { error } = await supabase
                    .from('users')
                    .update({ subscription_tier: 'pro' })
                    .eq('id', userId)

                if (error) {
                    console.error(`Error updating user ${userId}:`, error.message)
                    return new Response('Error updating user', { status: 500 })
                }

                console.log(`User ${userId} successfully upgraded to Pro.`)
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
