// ✅ VALIDATORS - Utility per validazione input
// Validazione centralizzata e riutilizzabile

/**
 * Valida email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefono (formato italiano)
 */
export const isValidPhone = (phone) => {
  // Accetta: +39, 0039, o numeri italiani standard
  const phoneRegex = /^(\+39|0039)?[0-9]{8,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valida che un campo non sia vuoto
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Valida lunghezza stringa
 */
export const hasLength = (value, min = 0, max = Infinity) => {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * Valida numero positivo
 */
export const isPositiveNumber = (value) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Valida numero (anche negativo)
 */
export const isNumber = (value) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num);
};

/**
 * Valida data
 */
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Valida data futura
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) > new Date();
};

/**
 * Valida data passata
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) < new Date();
};

/**
 * Valida formato prezzo (es. 10.50, 10, 10.5)
 */
export const isValidPrice = (value) => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  return priceRegex.test(String(value));
};

/**
 * Valida URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida codice fiscale italiano (formato base)
 */
export const isValidFiscalCode = (cf) => {
  const cfRegex = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i;
  return cfRegex.test(cf);
};

/**
 * Valida partita IVA italiana
 */
export const isValidVAT = (vat) => {
  const vatRegex = /^IT\d{11}$/i;
  return vatRegex.test(vat);
};

/**
 * Valida username (solo lettere, numeri, underscore)
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Valida password (min 8 caratteri, almeno 1 lettera e 1 numero)
 */
export const isValidPassword = (password) => {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * Validatore composito - esegue più validazioni
 */
export const validate = (value, rules) => {
  const errors = [];

  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(value);
      if (result !== true) {
        errors.push(result || 'Valore non valido');
      }
    } else if (typeof rule === 'object') {
      // Regola con funzione e messaggio
      if (rule.validator && !rule.validator(value)) {
        errors.push(rule.message || 'Valore non valido');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validatore per form interi
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    const result = validate(value, rules);

    if (!result.valid) {
      errors[field] = result.errors[0]; // Prendi primo errore
      isValid = false;
    }
  }

  return {
    valid: isValid,
    errors
  };
};

/**
 * Sanitizza input (rimuove HTML tags)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '').trim();
};

/**
 * Sanitizza email (lowercase, trim)
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

