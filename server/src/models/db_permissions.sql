-------- CREATE ROLES -------- (UPERUSER, CREATEROLE, CREATEDB, LOGIN)

-- Admin: An admin could view, create, edit, and delete both products and orders, as well as manage "user" roles.
CREATE ROLE admin WITH SUPERUSER LOGIN;
GRANT admin TO elizayounger;


-- customer_user: A customer would only be able to view products, create orders and make payments.

CREATE USER customer_user WITH PASSWORD 'password'; -- Create the shared database user
GRANT CONNECT ON DATABASE ecommerce TO customer_user; -- Allow it to connect to the database

-- ensure that the last two commands worked


-- Grant access to necessary tables
GRANT USAGE ON SCHEMA public TO customer_user; 
GRANT INSERT ON public.users TO customer_user;
GRANT SELECT ON public.product TO customer_user;



GRANT SELECT, INSERT, UPDATE ON public.users TO customer_user;
GRANT SELECT, INSERT, UPDATE ON public.orders TO customer_user;


-------- GRANT ROLES --------
-- ADMIN - already a superuser

--  CUSTOMER START

GRANT INSERT ON public.cart_item TO customer; -- allow customer to add to cart
GRANT SELECT (quantity) ON public.cart_item TO customer; -- allow customer to see what's in their basket


customer: {
    USAGE: [customer_cart, customer_order, cart_item, order_item,"user", product]
    INSERT: [cart_item],
    SELECT: [
        customer_cart(product_name,quantity,cart_total)(RLS), 
        order_item(RLS), 
        "user"(name,email)(RLS), 
        product(name,description,price,stock_quantity)
        ],
    UPDATE: [
        cart_item, 
        "user"(name,email)(RLS),
        ],
    DELETE: [cart_item],
}

--  CUSTOMER END 

-- VIEWS 
customer_cart(id,product_name,quantity)
customer_order(date,order_number,no_items,price)

-- TABLES 
cart_item(user_id,product_id,quantity)
order_item(order_id,product_id,quantity)
payment(id,order_id,payment_status,transaction_id,paid_at)
"order"(id,user_id,order_date,total_price)
"user"(id,name,email,role,created_at)
product(id,name,description,price,stock_quantity)

-- TABLE PRIVILEGES
INSERT
SELECT
UPDATE
DELETE
TRUNCATE
REFERENCES
TRIGGER

-------------------- CHECKS --------------------
-- checks user has access to database
SELECT datname, rolname, has_database_privilege(rolname, datname, 'CONNECT') AS has_connect 
FROM pg_database, pg_roles
WHERE datname = 'ecommerce' AND rolname = 'customer_user';

-- checks what grants the customer_user has on tables
select * from information_schema.role_table_grants rtg
where grantee = 'customer_user';

