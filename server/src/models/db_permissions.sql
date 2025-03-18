-------- CREATE SUPERUSER -------- (SUPERUSER, CREATEROLE, CREATEDB, LOGIN)

CREATE ROLE admin WITH SUPERUSER LOGIN;
GRANT admin TO elizayounger;

-------- TABLE ROLE PERMISSIONS --------
-- DB
CREATE ROLE use_db;
GRANT CONNECT ON DATABASE ecommerce TO use_db; 
GRANT USAGE ON SCHEMA public TO use_db; 

-- USER
CREATE ROLE read_user;
GRANT USAGE, SELECT ON public."user" TO read_user;
CREATE ROLE write_user;
GRANT USAGE, SELECT, INSERT, UPDATE, DELETE ON public."user" TO write_user;
GRANT USAGE, SELECT ON SEQUENCE public.user_id_seq TO read_user;
GRANT USAGE, SELECT ON SEQUENCE public.user_id_seq TO write_user;
REVOKE ALL ON public."user" FROM PUBLIC;
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_user -- only access own account
ON public."user"
FOR ALL
USING (email = current_setting('app.current_user')::text);

CREATE POLICY insert_user -- only insert emails into email column
ON public."user"
FOR INSERT
WITH CHECK (email LIKE '%@%.%');

-- PRODUCT
CREATE ROLE read_product;
GRANT USAGE, SELECT ON public.product TO read_product;
CREATE ROLE write_product;
GRANT USAGE, SELECT, INSERT, UPDATE, DELETE ON public.product TO write_product;
GRANT SELECT ON SEQUENCE public.product_id_seq TO read_product;
GRANT SELECT ON SEQUENCE public.product_id_seq TO write_product;
REVOKE ALL ON public.product FROM PUBLIC;

-- CART_ITEM
CREATE ROLE write_cart_item;
GRANT USAGE, SELECT, INSERT, UPDATE, DELETE ON public.cart_item TO write_cart_item;
REVOKE ALL ON public.cart_item FROM PUBLIC;
ALTER TABLE public.cart_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_cart_items
ON public.cart_item
FOR SELECT
USING (user_id = (SELECT id FROM public."user" WHERE email = current_setting('app.current_user')::text));

-- ORDER
CREATE ROLE read_order;
GRANT USAGE, SELECT ON public.order TO read_order;
create role update_order;
GRANT INSERT ON public."order" TO update_order;
CREATE ROLE write_order;
GRANT USAGE, SELECT ON SEQUENCE public.order_id_seq TO write_order;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order TO write_order;
REVOKE ALL ON public.order FROM PUBLIC;

CREATE POLICY select_own_order
ON public."order"
FOR SELECT
USING (user_id = (SELECT id FROM public."user" WHERE email = current_setting('app.current_user')::text));

CREATE POLICY select_all_orders_for_employees
ON public."order"
FOR SELECT
USING (
    current_setting('app.current_role')::text = 'employee'
);


-- ORDER_ITEM
CREATE ROLE read_order_item;
GRANT USAGE, SELECT ON public.order_item TO read_order_item;
REVOKE ALL ON public.order_item FROM PUBLIC;
-- TODO: own_order_item policy

-- CUSTOMER_CART (VIEW - read only. Any cart changes are made to cart_item)
CREATE ROLE read_customer_cart;
GRANT SELECT ON customer_cart TO read_customer_cart;
REVOKE ALL ON customer_cart FROM PUBLIC;
-- TODO: own_cart policy

-- CUSTOMER_ORDER
CREATE ROLE read_customer_order;
GRANT SELECT ON customer_order TO read_customer_order;
REVOKE ALL ON customer_order FROM PUBLIC;
-- TODO: own_cart_item policy

-- PAYMENT


REVOKE ALL ON payment FROM public;

GRANT SELECT, INSERT, UPDATE ON payment TO admin;
GRANT SELECT ON payment TO customer_service;

-------- EMPLOYEE ROLE --------
CREATE ROLE employee;
GRANT use_db TO employee;
GRANT read_user TO employee;
GRANT write_product TO employee;
GRANT update_order TO employee; 

CREATE POLICY select_all_users
ON public."user"
FOR SELECT
TO employee
USING (true);

-------- CUSTOMER ROLE --------
CREATE ROLE customer;
GRANT use_db TO customer;
GRANT write_user TO customer;
GRANT read_product TO customer;
GRANT write_cart_item TO customer;
GRANT write_order TO customer; --
GRANT read_order_item TO customer;
GRANT read_customer_cart TO customer;
GRANT read_customer_order TO customer;

-------- USERS --------
CREATE ROLE employee_user WITH PASSWORD 'password'; -- TODO: CHANGE PASSWORD
GRANT employee TO employee_user;

CREATE USER customer_user WITH PASSWORD 'password'; -- TODO: CHANGE PASSWORD
GRANT customer TO customer_user;

-------------------- CHECKS --------------------

-- checks user access to database
SELECT datname, rolname, has_database_privilege(rolname, datname, 'CONNECT') AS has_connect 
FROM pg_database, pg_roles
WHERE datname = 'ecommerce' AND rolname = 'customer_user';

-- checks grants 
select * from information_schema.role_table_grants rtg
where grantee = 'customer_user';

-- check roles assigned to users
SELECT grantee, information_schema.applicable_roles.role_name -- see what employee has grants for
FROM information_schema.applicable_roles
WHERE grantee = 'employee';

-- check policies
SELECT * 
FROM pg_policies 
WHERE tablename = 'cart_item';