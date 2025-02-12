-------- DEFINED ROLES -------- 

-- SUPERUSER, CREATEROLE, CREATEDB, LOGIN

-- Admin: An admin could view, create, edit, and delete both products and orders, as well as manage "user" roles.
CREATE ROLE admin WITH SUPERUSER LOGIN;
GRANT admin TO elizayounger;

CREATE ROLE customer NOSUPERUSER;


-------- DEFINED ROLES -------- 

customer: {
    INSERT: [cart_item],
    SELECT: [cart_item(JOIN,quantity)(RLS), order_item(RLS), payment(RLS), "order"(name,email)(RLS), "user"(RLS), product(name,description,price)],
    UPDATE: [cart_item, "user"()(RLS)],
    DELETE: [cart_item],
    TRUNCATE: [],
    REFERENCES: [],
    TRIGGER: []
}
cart_item
order_item
payment
"order"
"user"
product


-- customer: A customer would only be able to view products, create orders and make payments.
CREATE ROLE customer WITH LOGIN;

-- TABLE PRIVILEGES
INSERT
SELECT
UPDATE
DELETE
TRUNCATE
REFERENCES
TRIGGER

-- TABLES 
