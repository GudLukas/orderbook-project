
//#this formatPrice function formats a price value to a string with a dollar sign and two decimal places.
export const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;
//#this formatQuantity function formats a quantity value to a localized string with proper decimal places.
export const formatQuantity = (qty) => {
  const num = parseFloat(qty);
  // If it's a whole number, don't show decimals
  if (num % 1 === 0) {
    return num.toLocaleString();
  }
  // Otherwise, show up to 8 decimal places (removing trailing zeros)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  });
};
//#this formatTotal function formats a total value to a string with a dollar sign.
export const formatTotal = (price, qty) => `$${(price * qty).toLocaleString()}`;
