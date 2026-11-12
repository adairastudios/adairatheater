// All prices in the app are Indian Rupees (INR).

/** GST charged on restaurant / food service in India. */
export const GST_RATE = 0.05;
/** In-seat delivery fee, waived when the subtotal reaches FREE_DELIVERY_THRESHOLD. */
export const DELIVERY_FEE = 30;
export const FREE_DELIVERY_THRESHOLD = 999;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a rupee amount with Indian digit grouping, e.g. 1099 -> "₹1,099". */
export const formatINR = (amount: number): string => inrFormatter.format(amount);
