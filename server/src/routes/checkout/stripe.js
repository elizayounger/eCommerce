import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your-secret-key-here';
const stripe = Stripe(STRIPE_SECRET_KEY); 

export const processPaymentSuccess = async (req, res) => {
    const { token } = req.body; // This will be the payment method (from Stripe Elements, for instance)

    try {
        // Create a Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000, // Amount in cents (this would be $10.00)
            currency: 'usd', 
            payment_method: token, // Token is provided by frontend
            confirm: true, // Confirm the payment immediately (auto confirm in test mode)
        });

        // Simulate success 
        res.json({
            status: paymentIntent.status, // This will give 'succeeded' in case of successful payment
            message: 'Payment processed successfully in test mode',
        });
    } catch (error) {
        
        res.status(500).json({
            error: error.message, // The error message returned by Stripe
            message: 'Payment failed (mock)',
        });
    }
};
