import express from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Initialize Stripe with a test key (replace with env var in production)
// This is the "Secret Key", it should never be exposed to the frontend!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_local_dev', {
    apiVersion: '2023-10-16' as any,
});

// @route   POST /orders/create-payment-intent
// @desc    Initiate a checkout flow for a specific product
// @access  Private (Buyer must be logged in)
router.post('/create-payment-intent', authenticate, async (req: AuthRequest, res) => {
    const { productId } = req.body;
    const buyerId = req.user?.id;

    if (!buyerId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 1. Fetch the product to get the accurate price (never trust the frontend price!)
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || product.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Product is unavailable' });
        }

        // 2. Prevent users from buying their own items
        if (product.sellerId === buyerId) {
            return res.status(400).json({ error: 'You cannot buy your own product' });
        }

        // 3. Create a Stripe PaymentIntent
        // Stripe expects amounts in the smallest currency unit (e.g., cents for USD)
        const amountInCents = Math.round(product.price * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                productId: product.id,
                buyerId: buyerId,
                sellerId: product.sellerId,
            },
            // In a real marketplace, we would use Stripe Connect to route funds to the seller here:
            // transfer_data: { destination: sellerStripeAccountId }
        });

        // 4. Create an Order record in our database marked as 'PENDING'
        const order = await prisma.order.create({
            data: {
                buyerId,
                productId,
                stripePaymentIntentId: paymentIntent.id,
                status: 'PENDING',
            },
        });

        // 5. Send the client secret back to the frontend so Stripe Elements can render the checkout form
        res.json({
            clientSecret: paymentIntent.client_secret,
            orderId: order.id,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// @route   POST /orders/webhook
// @desc    Stripe calls this endpoint automatically when a payment succeeds
// @note    In production, this needs express.raw() middleware to verify Stripe signatures
router.post('/webhook', express.json(), async (req, res) => {
    const event = req.body; // Mocking the webhook for local dev

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            // Update our database: Mark order as PAID and product as SOLD
            if (paymentIntent.metadata.productId) {
                await prisma.$transaction([
                    prisma.order.updateMany({
                        where: { stripePaymentIntentId: paymentIntent.id },
                        data: { status: 'PAID' }
                    }),
                    prisma.product.update({
                        where: { id: paymentIntent.metadata.productId },
                        data: { status: 'SOLD' }
                    })
                ]);
                console.log('✅ Payment succeeded, order marked as PAID');
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

export default router;
