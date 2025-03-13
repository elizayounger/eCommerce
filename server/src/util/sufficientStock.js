export const sufficientStock = (stock_quantity, requested_quantity) => {
    if (stock_quantity >= requested_quantity) {
        return true;
    } else {
        return false;
    }
}