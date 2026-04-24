const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const validateRegistration = ({ firstName, lastName, email, password }) => {
  const errors = [];
  if (!firstName || !firstName.trim()) errors.push('First name is required.');
  if (!lastName || !lastName.trim()) errors.push('Last name is required.');
  if (!email || !isValidEmail(email)) errors.push('Valid email is required.');
  if (!password || !isValidPassword(password)) errors.push('Password must be at least 6 characters.');
  return { valid: errors.length === 0, errors };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  validateRegistration
};
