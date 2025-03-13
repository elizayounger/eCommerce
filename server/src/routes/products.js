import { employee_pool } from '../config/db.js'; 

// ------------------ DELETE ------------------
export const deleteProduct = async (req,res,next) => {
    // Middleware has ensured: token authorized, req.body validated & sanitized, check product exists & added to req.product
    
    if (req.user.role !== 'employee') {   return res.status(401).json({ message: "Unauthorized Request. Employees only" });   }

    try {
        const { id, name } = req.body;
        if (!id || !name) {   return res.status(400).json({ message: "Product ID and name are required" });   }

        if (req.product.name !== name) {   return res.status(400).json({ message: `Product name mismatch for id ${id}` });   }

        // Delete the product
        const deleteQuery = `DELETE FROM public.product WHERE id = $1`;
        await employee_pool.query(deleteQuery, [id]);

        res.locals.response = { message: "Product successfully deleted", deleted: id };

        next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ------------------ PUT ------------------
export const updateProduct = async (req,res,next) => {
    // Middleware has ensured: token authorized, req.body validated & sanitized, check product exists & added to req.product
    if (req.user.role !== 'employee') {   return res.status(401).json({ message: "Unauthorized Request. Employees only" });   }

    const { id, name, description, price, stock_quantity } = req.body;
    if (!id) {   return res.status(400).json({ message: "Product ID is required" });   }
    let errors = [];

    try {
        // Prepare dynamic set of fields to update
        const setFields = [];
        const params = [];
        let index = 1;

        if (name) {
            setFields.push(`name = $${index}`);
            params.push(name);
            index++;
        }
        if (description) {
            setFields.push(`description = $${index}`);
            params.push(description);
            index++;
        }
        if (price) {
            setFields.push(`price = $${index}`);
            params.push(price);
            index++;
        }
        if (stock_quantity) {
            setFields.push(`stock_quantity = $${index}`);
            params.push(stock_quantity);
            index++;
        }

        // If there are fields to update, generate the update query
        if (setFields.length > 0) {
            const updateQuery = `
                UPDATE public.product 
                SET ${setFields.join(", ")} 
                WHERE id = $${index}`;
            params.push(id);

            // Execute the update query
            await employee_pool.query(updateQuery, params);

            res.locals.response = { message: 'Product successfully updated' };
        } else {

            // If no fields to update, inform the user
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        next();

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// ------------------ POST ------------------
export const addProduct = async (req,res,next) => {
    if (req.user.role !== 'employee') {
        return res.status(401).json({ message: "Unauthorized Request. Employees only" });
    }

    const { name, description, price, stock_quantity } = req.body;
    if (!name || !description || price == null || stock_quantity == null) {
        return res.status(400).json({ message: "All product fields are required" });
    }

    try {
        const query = `
            INSERT INTO public.product (name, description, price, stock_quantity) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        
        const result = await employee_pool.query(query, [name, description, price, stock_quantity]);
        res.locals.response = { message: 'Product successfully added', product: result.rows[0] };
        
        next();

    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Product already exists in the database' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};