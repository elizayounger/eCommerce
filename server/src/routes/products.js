import { employee_pool } from '../config/db.js'; 

// ------------------ DELETE ------------------
export const deleteProducts = async (req, res) => {
    // Middleware has ensured: token authorized, employee authorized, req.body validated & sanitized

    try {
        const productIds = req.body.map(product => product.id);
        const productMap = new Map(req.body.map(product => [product.id, product.name]));

        // Fetch products in bulk
        const query = `SELECT id, name FROM public.product WHERE id = ANY($1)`;
        const { rows: existingProducts } = await employee_pool.query(query, [productIds]);

        let errors = [];
        let validIds = [];

        existingProducts.forEach(product => {
            if (productMap.get(product.id) !== product.name) {
                errors.push(`Product name mismatch for id ${product.id}`);
            } else {
                validIds.push(product.id);
            }
        });

        // Find products that don't exist
        const existingIds = new Set(existingProducts.map(product => product.id));
        const notFoundIds = productIds.filter(id => !existingIds.has(id));

        if (notFoundIds.length > 0) {   errors.push(`Products not found: ${notFoundIds.join(', ')}`);   }

        // If there are valid IDs, perform the delete in bulk
        if (validIds.length > 0) {
            const deleteQuery = `DELETE FROM public.product WHERE id = ANY($1)`;
            await employee_pool.query(deleteQuery, [validIds]);
        }

        // Handle different response cases
        if (validIds.length === 0) {    return res.status(404).json({ message: "No valid products found to delete", errors });   } 
        
        if (errors.length > 0) {    return res.status(207).json({ message: "Partial deletion completed", deleted: validIds, errors });  }

        return res.status(200).json({ message: "Products successfully deleted", deleted: validIds });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// ------------------ PUT ------------------
export const updateProducts = async (req, res) => {
    // Middleware has ensured: token authorized, employee authorized, req.body validated & sanitized
    let errors = [];

    try {
        for (const product of req.body) {
            const updates = [];
            const params = [];
            let index = 1;

            // Check if the product exists
            const checkQuery = `SELECT id FROM public.product WHERE id = $1`;
            const { rows } = await employee_pool.query(checkQuery, [product.id]);

            if (rows.length === 0) {
                errors.push(`Product with id ${product.id} not found`);
                continue; // Continue with the next product
            }

            // Prepare dynamic set of fields to update
            const setFields = [];
            if (product.name) {
                setFields.push(`name = $${index}`);
                params.push(product.name);
                index++;
            }
            if (product.description) {
                setFields.push(`description = $${index}`);
                params.push(product.description);
                index++;
            }
            if (product.price) {
                setFields.push(`price = $${index}`);
                params.push(product.price);
                index++;
            }
            if (product.stock_quantity) {
                setFields.push(`stock_quantity = $${index}`);
                params.push(product.stock_quantity);
                index++;
            }

            // If there are fields to update, generate the update query
            if (setFields.length > 0) {
                const updateQuery = `
                    UPDATE public.product 
                    SET ${setFields.join(", ")} 
                    WHERE id = $${index}`;
                params.push(product.id);

                // Execute the update query
                await employee_pool.query(updateQuery, params);
            }
        }

        // Check if there were any errors
        if (errors.length > 0) {
            return res.status(404).json({ message: errors.join(", ") });
        }

        res.status(200).json({ message: 'Products successfully updated' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




// ------------------ POST ------------------
export const addProducts = async (req, res) => {
    // Middleware has ensured: token authorized, employee authorized, req.body validated & sanitized

    try {
        const inserts = [];
        const params = [];
        let index = 1;

        for (const product of req.body) {
            inserts.push(`($${index}, $${index+1}, $${index+2}, $${index+3})`);
            params.push(product.name, product.description, product.price, product.stock_quantity);
            index += 4;
        }

        const query = `
            INSERT INTO public.product (name, description, price, stock_quantity) 
            VALUES ${inserts.join(", ")};`;

        const result = await employee_pool.query(query, params);

        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Failed to add products' });
        }

        res.status(200).json({ message: 'Products successfully added' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
