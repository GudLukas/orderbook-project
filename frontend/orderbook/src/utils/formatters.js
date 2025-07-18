
//#this formatPrice function formats a price value to a string with a dollar sign and two decimal places.
export const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;
//#this formatQuantity function formats a quantity value to a localized string.
export const formatQuantity = (qty) => parseFloat(qty).toLocaleString();
//#this formatTotal function formats a total value to a string with a dollar sign.
export const formatTotal = (price, qty) => `$${(price * qty).toLocaleString()}`;
