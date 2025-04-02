import Stripe from 'stripe';
import dotenv from 'dotenv';
import { updateOrderStatus } from "../orders/orders.js";
import { clearCart } from "../cart.js";
import { io } from "../../app.js"; 

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your-secret-key-here';
const stripe = new Stripe(STRIPE_SECRET_KEY); 

export const processPayment = async (req, res, next) => {
    try {
        const { amount, currency, paymentMethod } = req.body; // Order ID passed from addOrderPending
        const user_id = req.user.id;
        const user_email = req.user.email;

        const items = req.user.cart;
        if (!items || items.length < 1) {
            console.log(`Empty cart for user: ${req.user.id}`);
            return res.status(400).json({ message: `cart empty, nothing to purchase` });
        }

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
            metadata: {
                userId: user_id,
                customerEmail: user_email,
            },
        });

        req.body.transaction_id = paymentIntent.id;
        res.locals.response.paymentIntent = paymentIntent;
        // res.locals.response.clientSecret = paymentIntent.client_secret;
        // res.locals.response.status = paymentIntent.status;
        // frontend: if (status === "requires_action") {}
        
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

        console.log(`event type: ${event.type}`);

        if (event.type !== "payment_intent.succeeded") {
            return res.status(200).json({ received: true });
        }

        // Respond to Stripe first to prevent retries
        res.status(200).json({ received: true });
        // charge.succeeded, payment_intent.succeeded, payment_intent.created, charge.updated

        const status = event.data.object.status;
        const user_id = event.data.object.metadata?.userId;
        const transactionId = event.data.object.payment_intent;
        // console.log(`event: ${JSON.stringify(event)}`);

        const updatedOrder = await updateOrderStatus(transactionId, status);
        const clearUserCart = await clearCart(user_id);
        if (!clearUserCart) {
            console.log(`Failed to clear cart for user ${user_id}`);
            
            io.emit(`clear user ${user_id} cart unsuccessful`, {
                message: `user${user_id}`
            });
        }

        if (updatedOrder) {
            console.log(`Order with transaction ID ${transactionId} updated to ${status}`);
            
            io.emit(`payment${status}`, {
                message: `payment${status}`,
                paymentId: transactionId,
            });
        } else {
            console.warn(`⚠️ No order found for transaction ID: ${transactionId}`);
        }
    } catch (err) {
        console.error("❌ Webhook error:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

// --------------   WEBHOOK SETUP    -------------- 
// terminal: stripe login
// terminal: stripe listen --forward-to localhost:3000/webhook
// copy the webhook signing secret into the .env STRIPE_WEBHOOK_SECRET

// https://dashboard.stripe.com/test/workbench/webhooks
// https://docs.stripe.com/webhooks : if you're stuck

// {
//     "id": "evt_3R96oBJBT5WYiRAk1wohuqFU",
//     "object": "event",
//     "api_version": "2025-02-24.acacia",
//     "created": 1743521582,
//     "data": {
//       "object": {
//         "id": "ch_3R96oBJBT5WYiRAk1eSBVv3B",
//         "object": "charge",
//         "amount": 79990,
//         "amount_captured": 79990,
//         "amount_refunded": 0,
//         "application": null,
//         "application_fee": null,
//         "application_fee_amount": null,
//         "balance_transaction": "txn_3R96oBJBT5WYiRAk1ZPtdh4Y",
//         "billing_details": {
//           "address": {
//             "city": null,
//             "country": null,
//             "line1": null,
//             "line2": null,
//             "postal_code": null,
//             "state": null
//           },
//           "email": null,
//           "name": null,
//           "phone": null
//         },
//         "calculated_statement_descriptor": "ECOMMERCE PROJECT",
//         "captured": true,
//         "created": 1743521579,
//         "currency": "gbp",
//         "customer": null,
//         "description": null,
//         "destination": null,
//         "dispute": null,
//         "disputed": false,
//         "failure_balance_transaction": null,
//         "failure_code": null,
//         "failure_message": null,
//         "fraud_details": {},
//         "invoice": null,
//         "livemode": false,
//         "metadata": {
//           "customerEmail": "jimmy@example.com",
//           "userId": "20"
//         },
//         "on_behalf_of": null,
//         "order": null,
//         "outcome": {
//           "advice_code": null,
//           "network_advice_code": null,
//           "network_decline_code": null,
//           "network_status": "approved_by_network",
//           "reason": null,
//           "risk_level": "normal",
//           "risk_score": 23,
//           "seller_message": "Payment complete.",
//           "type": "authorized"
//         },
//         "paid": true,
//         "payment_intent": "pi_3R96oBJBT5WYiRAk1bgdhL5l",
//         "payment_method": "pm_1R96oBJBT5WYiRAkoPyOsy4R",
//         "payment_method_details": {
//           "card": {
//             "amount_authorized": 79990,
//             "authorization_code": null,
//             "brand": "visa",
//             "checks": {
//               "address_line1_check": null,
//               "address_postal_code_check": null,
//               "cvc_check": "pass"
//             },
//             "country": "US",
//             "exp_month": 4,
//             "exp_year": 2026,
//             "extended_authorization": {
//               "status": "disabled"
//             },
//             "fingerprint": "AeY3lVH6pKD0Lwy5",
//             "funding": "credit",
//             "incremental_authorization": {
//               "status": "unavailable"
//             },
//             "installments": null,
//             "last4": "4242",
//             "mandate": null,
//             "multicapture": {
//               "status": "unavailable"
//             },
//             "network": "visa",
//             "network_token": {
//               "used": false
//             },
//             "network_transaction_id": "651018951108867",
//             "overcapture": {
//               "maximum_amount_capturable": 79990,
//               "status": "unavailable"
//             },
//             "regulated_status": "unregulated",
//             "three_d_secure": null,
//             "wallet": null
//           },
//           "type": "card"
//         },
//         "radar_options": {},
//         "receipt_email": null,
//         "receipt_number": null,
//         "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xUjJkUmlKQlQ1V1lpUkFrKK6OsL8GMgYIM2MVK_Q6LBYgks39Q9c0FGSrtSsZjr6ABFV99fs7ihlMhXndV7TFkJeD6KkdjQVJMKqy",
//         "refunded": false,
//         "review": null,
//         "shipping": null,
//         "source": null,
//         "source_transfer": null,
//         "statement_descriptor": null,
//         "statement_descriptor_suffix": null,
//         "status": "succeeded",
//         "transfer_data": null,
//         "transfer_group": null
//       },
//       "previous_attributes": {
//         "balance_transaction": null,
//         "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xUjJkUmlKQlQ1V1lpUkFrKK6OsL8GMgaoFCarLVo6LBaAxa8CvrDBoyLpRf6ZdL9IZQic1FRu8NuM17PTmb8eFdh1lfiCpl6314js"
//       }
//     },
//     "livemode": false,
//     "pending_webhooks": 3,
//     "request": {
//       "id": null,
//       "idempotency_key": null
//     },
//     "type": "charge.updated"
//   }
  