// REGISTER USER 


// USER LOGIN


// GET USER DETAILS

const getUserAccount = (req, res, next) => {
    // Getting userId from query, params or body
    const userId = req.query.userId || req.params.userId || req.body.userId;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    // Query the database for user details based on userId
    pool.query('SELECT * FROM public.customer WHERE id = $1', [userId])
      .then(result => {
        if (result.rows.length > 0) {
          // If user is found, send back user details
          return res.status(200).json(result.rows[0]);
        } else {
          // If no user found with that ID
          return res.status(404).json({ message: 'User not found' });
        }
      })
      .catch(err => {
        // Error handling
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      });
  };


// ADD ITEM TO CART

    
