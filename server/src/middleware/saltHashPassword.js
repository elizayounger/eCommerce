import bcrypt from 'bcrypt';

export const saltHashPassword = async (req, res, next) => {

    const { password } = req.body; // user details
    console.log("Calling saltHashPassword");

    if (!password) return next();

    const salt = await bcrypt.genSalt(10); // salt
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`entered password: ${password}. hashed password: ${hashedPassword}`);

    req.body.password = hashedPassword;
    next();
}