export const finalHandler = (req, res) => {
    const response = res.locals.response;
    res.status(200).json( response || { success: true, message: 'Action completed successfully' });
}