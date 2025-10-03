export const formatCurrency = (amount, currency = 'SAR') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  
  return new Intl.NumberFormat('en-US').format(num);
};
