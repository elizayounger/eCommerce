-- CREATE DATABASE
DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE ecommerce OWNER elizayounger;

-- Define ENUM types
CREATE TYPE role_type AS ENUM ('employee', 'customer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');

-- if you want to delete the tables, this is the order: public.cart_item, public.order_item, public.payment, public."order", public.customer, public.product
DROP VIEW IF EXISTS customer_cart;
DROP VIEW IF EXISTS customer_order;
DROP TABLE IF EXISTS public.cart_item;
DROP TABLE IF EXISTS public.order_item;
DROP TABLE IF EXISTS public.payment;
DROP TABLE IF EXISTS public."order";
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.product;

-- "user" Table
DROP TABLE IF EXISTS public."user";
CREATE TABLE public."user" (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role role_type NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Table
DROP TABLE IF EXISTS public.product;
CREATE TABLE public.product (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
    CONSTRAINT uq_product UNIQUE (name, description)
);

-- Cart Item Table (Many-to-Many between "user" and Product)
DROP TABLE IF EXISTS public.cart_item;
CREATE TABLE public.cart_item (
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (user_id, product_id)
);
-- cart_item triggers: 
    -- 1. find user_id, product_id. if not exist, make new line and quantity = 1;

-- Order Table
DROP TABLE IF EXISTS public."order";
CREATE TABLE public."order" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Changed from DATE to TIMESTAMP
    currency VARCHAR(3),
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR CHECK (status IN (
        'pending',        -- Order is created but not yet paid
        'succeeded',      -- Payment was successful and order is complete
        'failed',         -- Payment failed (e.g., due to issues with payment method)
        'rejected',       -- Payment rejected by user or system
        'canceled',       -- Order was canceled by the user or system
        'awaiting_payment',  -- Order is awaiting payment to be initiated
        'processing',     -- Payment was successful but order is still being processed
        'partially_paid', -- Order has been partially paid (e.g., deposit)
        'refunded'        -- Payment was refunded
    )),
    transaction_id VARCHAR(255) NOT NULL DEFAULT '', -- Unique transaction reference
    UNIQUE (transaction_id) -- Ensure transaction_id is unique per order
);



-- Order Item Table (Many-to-Many between Order and Product)
DROP TABLE IF EXISTS public.order_item;
CREATE TABLE public.order_item (
    order_id INTEGER REFERENCES "order"(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY(order_id, product_id)
);

CREATE TABLE public.payment (
    id SERIAL PRIMARY KEY,                 
    order_id INT NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,  
    user_id INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,  
    stripe_payment_intent_id VARCHAR(100) UNIQUE NOT NULL,  -- Stripe PaymentIntent ID
    stripe_customer_id VARCHAR(100),       -- Stripe Customer ID (if saving card)
    payment_method VARCHAR(50) NOT NULL,   -- Payment method (card, PayPal, etc.)
    amount DECIMAL(10,2) NOT NULL,         
    currency VARCHAR(10) DEFAULT 'USD',    
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),  
    transaction_id VARCHAR(100) UNIQUE,    -- External transaction ID (if available)
    receipt_url TEXT,                      -- Stripe receipt URL
    created_at TIMESTAMP DEFAULT NOW(),    
    updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW() -- Last updated timestamp
);


--  TEST DATA

-- Insert Sample "user"s
INSERT INTO public."user" (firstname, lastname, email, password) VALUES
('Alice', 'Johnson', 'alice@example.com', 'password123'),
('Bob', 'Smith', 'bob@example.com', 'password456'),
('Charlie', 'Davis', 'charlie@example.com', 'password789');

-- Insert Sample Products
INSERT INTO public.product (name, description, price, stock_quantity) VALUES
('Wireless Mouse', 'Ergonomic wireless mouse with Bluetooth support', 29.99, 100),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 79.99, 50),
('USB-C Charger', 'Fast charging 65W USB-C power adapter', 39.99, 75);

-- Insert Sample Cart Items
INSERT INTO public.cart_item (user_id, product_id, quantity) VALUES
(1, 1, 2), -- Alice added 2 Wireless Mice
(2, 2, 1), -- Bob added 1 Mechanical Keyboard
(3, 3, 3); -- Charlie added 3 USB-C Chargers

-- Insert Sample Orders
INSERT INTO public."order" (user_id, order_date, total_price) VALUES
(1, '2024-02-10', 59.98), -- Alice's order
(2, '2024-02-11', 79.99), -- Bob's order
(3, '2024-02-12', 119.97); -- Charlie's order

-- Insert Sample Order Items
INSERT INTO public.order_item (order_id, product_id, quantity) VALUES
(1, 1, 2), -- Alice ordered 2 Wireless Mice
(2, 2, 1), -- Bob ordered 1 Mechanical Keyboard
(3, 3, 3); -- Charlie ordered 3 USB-C Chargers

-- Insert Sample Payments
INSERT INTO public.payment (order_id, payment_status, transaction_id, paid_at) VALUES
(1, 'completed', 'TXN123456', NOW()),
(2, 'completed', 'TXN789012', NOW()),
(3, 'pending', 'TXN345678', NOW());


INSERT INTO product (name, description, price, stock_quantity) VALUES
('Laptop', 'A high-performance laptop', 1200.00, 50),
('Headphones', 'Noise-canceling headphones', 150.00, 100),
('Smartphone', 'Latest model smartphone', 800.00, 30);


-- Inserting sample cart items for each user
INSERT INTO cart_item (user_id, product_id, quantity) VALUES
(1, 4, 1),
(1, 5, 2),
(2, 6, 1)
(2, 7, 1), 
(3, 8, 3); 