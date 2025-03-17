import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your-secret-key-here';
const stripe = new Stripe(STRIPE_SECRET_KEY); 

export const processPayment = async (req, res) => {
    try {
        const { amount, currency, token } = req.body; // Token comes from the request body

        // Create the PaymentIntent with the token (payment method ID)
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: token, // Use the token received from frontend
            confirmation_method: 'manual',  // Manual confirmation (for 3D Secure, etc.)
            confirm: true,  // Automatically confirm the payment
        });

        res.json({ clientSecret: paymentIntent.client_secret });  // Send the clientSecret to frontend
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const webhookConfirmation = (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === "payment_intent.succeeded") {
            console.log("Payment was successful!", event.data.object);
            
            // Notify the frontend via WebSocket
            io.emit("paymentSuccess", { message: "Payment successful!", paymentId: event.data.object.id });
            
            // Update the database
            updateOrderStatus(event.data.object.id, "paid");
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
}



