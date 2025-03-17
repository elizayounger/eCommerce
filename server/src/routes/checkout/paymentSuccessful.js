import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPaymentEmail = (email, paymentId) => {
    const mailOptions = {
        from: "yourstore@example.com",
        to: email,
        subject: "Payment Confirmation",
        text: `Your payment was successful! Payment ID: ${paymentId}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

// Inside the webhook function:
if (event.type === "payment_intent.succeeded") {
    const customerEmail = event.data.object.receipt_email; // Retrieve email from Stripe
    sendPaymentEmail(customerEmail, event.data.object.id);
}
