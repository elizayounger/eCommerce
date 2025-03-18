import Stripe from 'stripe';
import dotenv from 'dotenv';
import { updateOrderStatus } from "../orders/orders.js";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your-secret-key-here';
const stripe = new Stripe(STRIPE_SECRET_KEY); 

export const processPayment = async (req, res, next) => {
    try {
        const { amount, currency, paymentMethod } = req.body; // Order ID passed from addOrderPending

        // Create the PaymentIntent with the token (payment method ID)
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethod, // Token from Stripe Elements
            confirm: true,
            automatic_payment_methods: {
                enabled: true,  // Enable automatic payment methods for the customer
                allow_redirects: 'never'
            },
        });

        req.body.transaction_id = paymentIntent.id;
        res.locals.response.clientSecret = paymentIntent.client_secret;
        
        return next();

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const webhookConfirmation = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        // Verify the webhook signature to ensure it's from Stripe
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        // Check for successful payment event
        if (event.type === "payment_intent.succeeded") {
            console.log("✅ Payment was successful!", event.data.object);

            const transactionId = event.data.object.id;

            const updatedOrder = await updateOrderStatus(transactionId, "succeeded");

            if (updatedOrder) {
                console.log(`🎉 Order with transaction ID ${transactionId} updated to 'succeeded'`);
                
                io.emit("paymentSuccess", {
                    message: "Payment successful!",
                    paymentId: transactionId,
                });
            } else {
                console.warn(`⚠️ No order found for transaction ID: ${transactionId}`);
            }
        }
        res.json({ received: true });
    } catch (err) {
        console.error("❌ Webhook error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};


// {
//     "id": "evt_1NFJXXX2eZvKYlo2CdfXyz123",
//     "object": "event",
//     "type": "payment_intent.succeeded",
//     "data": {
//       "object": {
//         "id": "pi_1NFJXXX2eZvKYlo2CdfXyz123",  // <-- This is your transaction_id
//         "object": "payment_intent",
//         "amount": 2000,
//         "currency": "usd",
//         "status": "succeeded",
//         "metadata": {
//           "order_id": "12345"  // Optional metadata for reference
//         }
//       }
//     }
//   }
  

