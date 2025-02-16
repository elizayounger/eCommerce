import bcrypt from 'bcrypt';

export const saltHashPassword = async (req, res, next) => {

    const { password } = req.body; // user details

    if (!password) return next();

    const salt = await bcrypt.genSalt(10); // salt
    const hashedPassword = await bcrypt.hash(password, salt);

    req.user.password = hashedPassword;
    console.log(`in hash password req.user: ${JSON.stringify(req.user)}`);
    next();
}