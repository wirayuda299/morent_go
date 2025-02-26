export const isValidDate = (dateString: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

export const formatPrice = (price: number) => {
  const formattedPrice = Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(price);

  return formattedPrice;
};
