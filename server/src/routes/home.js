import { customer_pool} from '../config/db.js';

export const loadProducts = async (req,res,next) => {
   
   try {
      let sqlQuery = `SELECT id, name, description, price, stock_quantity FROM public.product;`;
      const result = await customer_pool.query(sqlQuery);
      res.json(result.rows);

   } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
   }
}; 
