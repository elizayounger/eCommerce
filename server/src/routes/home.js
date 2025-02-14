import { pool } from '../../app.js';

export const loadProducts = async (req,res,next) => {
   try {
      let sqlQuery = `SELECT id, name, description, price, stock_quantity FROM public.product;`;
      const result = await pool.query(sqlQuery);
      res.json(result.rows);

   } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
   }
}; 


// ---------------------- ARCHIVE ----------------------
// export const loadAllProducts = async (err, req, res) => {
//     try {
//        // Get query parameters
//        const category = req.query.category;
//        const priceMin = req.query.price_min;
//        const priceMax = req.query.price_max;
//        const sort = req.query.sort;
//        const limit = req.query.limit || 10;
//        const page = req.query.page || 1;
 
//        // Build base SQL query
//        let sqlQuery = `
//           SELECT id, name, description, price, stock_quantity, created_at
//           FROM public.product
//           WHERE 1=1
//        `;
       
//        if (category) {sqlQuery += ` AND category = $1`;} // Filter by category if provided
//        if (priceMin) {sqlQuery += ` AND price >= $2`;} // Filter by price range if provided
//        if (priceMax) {sqlQuery += ` AND price <= $3`;}
 
//        // Apply sorting
//        if (sort === 'price_asc') {
//           sqlQuery += ` ORDER BY price ASC`;
//        } else if (sort === 'price_desc') {
//           sqlQuery += ` ORDER BY price DESC`;
//        } else if (sort === 'newest') {
//           sqlQuery += ` ORDER BY created_at DESC`;
//        }
 
//        // Pagination
//        const offset = (page - 1) * limit;
//        sqlQuery += ` LIMIT $4 OFFSET $5`;
 
//        // Run query with dynamic parameters
//        const params = [];
//        if (category) params.push(category);
//        if (priceMin) params.push(priceMin);
//        if (priceMax) params.push(priceMax);
//        params.push(limit, offset);
 
//        // Query the database
//        const result = await pool.query(sqlQuery, params);
       
//        // Send the results back
//        res.json(result.rows);
//     } catch (err) {
//        console.error(err);
//        res.status(500).send('Internal server error');
//     }
//  };