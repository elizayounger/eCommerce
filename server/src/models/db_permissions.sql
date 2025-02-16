-------- CREATE ROLES -------- (SUPERUSER, CREATEROLE, CREATEDB, LOGIN)

-- Admin: An admin could view, create, edit, and delete both products and orders, as well as manage "user" roles.
CREATE ROLE admin WITH SUPERUSER LOGIN;
GRANT admin TO elizayounger;

-------- EMPLOYEE PERMISSIONS --------

CREATE ROLE employee;
GRANT CONNECT ON DATABASE ecommerce TO employee; -- Allow it to connect to the database
GRANT USAGE ON SCHEMA public TO employee; 

-- Grant access to customer_user on necessary tables:
GRANT SELECT, DELETE ON public."user" TO employee;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product TO employee;
GRANT USAGE, SELECT ON SEQUENCE public.user_id_seq TO employee; -- allows customer_user to select autoincrement
GRANT USAGE ON SCHEMA pg_catalog TO employee; -- allow customer_user to set app.customer_user

CREATE USER employee_user WITH PASSWORD 'password'; -- Create the shared database user
GRANT employee TO employee_user;

--- EMPLOYEE POLICYS ---

CREATE POLICY select_all_users
ON public."user"
FOR SELECT
TO employee_user
USING (true);


-------- CUSTOMER PERMISSIONS --------

-- customer_user: A customer would only be able to view products, create orders and make payments.
CREATE USER customer_user WITH PASSWORD 'password'; -- Create the shared database user
GRANT CONNECT ON DATABASE ecommerce TO customer_user; -- Allow it to connect to the database
GRANT USAGE ON SCHEMA public TO customer_user; 

-- Grant access to customer_user on necessary tables:
GRANT SELECT, INSERT ON public."user" TO customer_user;
GRANT SELECT ON public.product TO customer_user;
GRANT USAGE, SELECT ON SEQUENCE public.user_id_seq TO customer_user; -- allows customer_user to select autoincrement
GRANT USAGE ON SCHEMA pg_catalog TO customer_user; -- allow customer_user to set app.customer_user
GRANT EXECUTE ON FUNCTION pg_catalog.set_config(text, text, boolean) TO customer_user; -- ''

-------- POLICYS & RLS --------

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_user
ON public."user"
FOR SELECT
USING (email = current_setting('app.current_user')::text);

CREATE POLICY insert_user
ON public."user"
FOR INSERT
WITH CHECK (email LIKE '%@%.%');

-------- GRANT ROLES --------
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

