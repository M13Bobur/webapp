export const generateOrderNumber = () => {
  const date = new Date();
  const ymd =
    date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FC-${ymd}-${random}`;
};
