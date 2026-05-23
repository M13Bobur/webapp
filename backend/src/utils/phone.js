/** Normalize phone to +998XXXXXXXXX for consistent lookup */
export const normalizePhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  if (digits.startsWith('998')) {
    return `+${digits}`;
  }
  return digits.startsWith('+') ? phone.replace(/\s/g, '') : `+${digits}`;
};
