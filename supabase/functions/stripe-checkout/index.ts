
import Stripe from "npm:stripe@^14.16.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2023-10-16',
        })

        const { price_id, user_id, return_url } = await req.json()

        if (!price_id || !user_id) {
            throw new Error('Missing price_id or user_id')
        }

        console.log(`Creating checkout session for user ${user_id} and price ${price_id}`)

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: `${return_url || 'http://localhost:3000'}/profile?success=true`,
            cancel_url: `${return_url || 'http://localhost:3000'}/subscription?canceled=true`,
            metadata: {
                user_id: user_id,
            },
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('❌ Stripe checkout error:', error);
        return new Response(
            JSON.stringify({
                error: error.message,
                type: error.type,
                code: error.code
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
