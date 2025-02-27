-- CUSTOMER CART VIEW(id, description)
CREATE VIEW customer_cart AS
SELECT 
    "user".id AS user_id,
    product.name AS product_name,
    cart.quantity AS quantity,
    SUM(product.price * cart.quantity) AS cart_total 
FROM public.cart_item AS cart
JOIN public."user" AS "user" ON cart.user_id = "user".id
JOIN public.product AS product ON product.id = cart.product_id
GROUP BY "user".id, product.name, cart.quantity;


-- CUSTOMER ORDERS VIEW
CREATE VIEW customer_order AS
SELECT 
    "order".order_date AS date,
    "order".id AS order_number,
    COUNT(order_item.order_id) AS no_items,
    "order".total_price AS price
FROM public."order" AS "order"
JOIN public.order_item AS order_item ON "order".id = order_item.order_id
GROUP BY 2
ORDER BY 1;
