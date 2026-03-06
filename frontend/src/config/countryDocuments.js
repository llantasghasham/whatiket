/**
 * Configuración de documentos de identificación por país.
 * Permite registrar empresas desde cualquier país con el formato correcto.
 */

export const COUNTRIES = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", docTypes: ["cpf", "cnpj"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", docTypes: ["dni", "cuit"] },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", docTypes: ["ci", "nit"] },
  { code: "CL", name: "Chile", flag: "🇨🇱", docTypes: ["rut"] },
  { code: "CO", name: "Colombia", flag: "🇨🇴", docTypes: ["cc", "nit"] },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", docTypes: ["cedula", "ruc"] },
  { code: "MX", name: "México", flag: "🇲🇽", docTypes: ["rfc", "curp"] },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", docTypes: ["cedula", "ruc"] },
  { code: "PE", name: "Perú", flag: "🇵🇪", docTypes: ["dni", "ruc"] },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", docTypes: ["ci"] },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", docTypes: ["cedula", "rif"] },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", docTypes: ["id", "ein"] },
  { code: "ES", name: "España", flag: "🇪🇸", docTypes: ["dni", "nie", "cif"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", docTypes: ["nif"] },
  { code: "OTHER", name: "Otro país", flag: "🌍", docTypes: ["document"] },
];

const DOC_CONFIG = {
  BR: {
    pf: { label: "CPF", placeholder: "000.000.000-00", minLen: 11, maxLen: 14, validate: "cpf" },
    pj: { label: "CNPJ", placeholder: "00.000.000/0001-00", minLen: 14, maxLen: 14, validate: "cnpj" },
  },
  AR: {
    pf: { label: "DNI", placeholder: "00.000.000", minLen: 7, maxLen: 9, validate: "digits" },
    pj: { label: "CUIT", placeholder: "00-00000000-0", minLen: 10, maxLen: 11, validate: "digits" },
  },
  BO: {
    pf: { label: "Cédula de identidad", placeholder: "Ej: 1234567", minLen: 5, maxLen: 10, validate: "alphanumeric" },
    pj: { label: "NIT", placeholder: "Ej: 123456789", minLen: 9, maxLen: 12, validate: "alphanumeric" },
  },
  CL: {
    pf: { label: "RUT", placeholder: "12.345.678-9", minLen: 8, maxLen: 10, validate: "alphanumeric" },
    pj: { label: "RUT", placeholder: "12.345.678-9", minLen: 8, maxLen: 10, validate: "alphanumeric" },
  },
  CO: {
    pf: { label: "Cédula de ciudadanía", placeholder: "Ej: 1234567890", minLen: 6, maxLen: 12, validate: "digits" },
    pj: { label: "NIT", placeholder: "Ej: 900.123.456-7", minLen: 9, maxLen: 15, validate: "alphanumeric" },
  },
  EC: {
    pf: { label: "Cédula", placeholder: "Ej: 1234567890", minLen: 10, maxLen: 10, validate: "digits" },
    pj: { label: "RUC", placeholder: "Ej: 1234567890001", minLen: 13, maxLen: 13, validate: "digits" },
  },
  MX: {
    pf: { label: "RFC / CURP", placeholder: "Ej: XAXX010101000", minLen: 10, maxLen: 18, validate: "alphanumeric" },
    pj: { label: "RFC", placeholder: "Ej: XAXX010101XXX", minLen: 12, maxLen: 13, validate: "alphanumeric" },
  },
  PY: {
    pf: { label: "Cédula de identidad", placeholder: "Ej: 1234567", minLen: 5, maxLen: 10, validate: "alphanumeric" },
    pj: { label: "RUC", placeholder: "Ej: 80012345-6", minLen: 8, maxLen: 12, validate: "alphanumeric" },
  },
  PE: {
    pf: { label: "DNI", placeholder: "Ej: 12345678", minLen: 8, maxLen: 8, validate: "digits" },
    pj: { label: "RUC", placeholder: "Ej: 20123456789", minLen: 11, maxLen: 11, validate: "digits" },
  },
  UY: {
    pf: { label: "Cédula de identidad", placeholder: "Ej: 12345678", minLen: 7, maxLen: 9, validate: "digits" },
    pj: { label: "RUT", placeholder: "Ej: 212345678912", minLen: 12, maxLen: 12, validate: "digits" },
  },
  VE: {
    pf: { label: "Cédula de identidad", placeholder: "Ej: V-12345678", minLen: 7, maxLen: 12, validate: "alphanumeric" },
    pj: { label: "RIF", placeholder: "Ej: J-12345678-9", minLen: 9, maxLen: 12, validate: "alphanumeric" },
  },
  US: {
    pf: { label: "ID / SSN", placeholder: "Ej: 123-45-6789", minLen: 9, maxLen: 15, validate: "alphanumeric" },
    pj: { label: "EIN", placeholder: "Ej: 12-3456789", minLen: 9, maxLen: 12, validate: "alphanumeric" },
  },
  ES: {
    pf: { label: "DNI / NIE", placeholder: "Ej: 12345678A", minLen: 8, maxLen: 12, validate: "alphanumeric" },
    pj: { label: "CIF", placeholder: "Ej: A12345678", minLen: 9, maxLen: 9, validate: "alphanumeric" },
  },
  PT: {
    pf: { label: "NIF", placeholder: "Ej: 123456789", minLen: 9, maxLen: 9, validate: "digits" },
    pj: { label: "NIF", placeholder: "Ej: 123456789", minLen: 9, maxLen: 9, validate: "digits" },
  },
  OTHER: {
    pf: { label: "Documento de identidad", placeholder: "Ingrese su documento", minLen: 4, maxLen: 25, validate: "any" },
    pj: { label: "Documento / Registro", placeholder: "Ingrese documento de la empresa", minLen: 4, maxLen: 25, validate: "any" },
  },
};

export const getDocConfig = (countryCode, type = "pf") => {
  const config = DOC_CONFIG[countryCode] || DOC_CONFIG.OTHER;
  return config[type] || config.pf;
};

export const validateDocument = (value, countryCode, type) => {
  if (!value || !value.trim()) return false;
  const digits = value.replace(/\D/g, "");
  const clean = value.replace(/\s/g, "");

  const config = getDocConfig(countryCode, type);
  const len = digits.length;

  if (countryCode === "BR") {
    if (type === "pf") return isValidCPF(value);
    return isValidCNPJ(value);
  }

  if (config.validate === "digits") {
    return len >= config.minLen && len <= config.maxLen && /^\d+$/.test(digits);
  }
  if (config.validate === "alphanumeric" || config.validate === "any") {
    return clean.length >= config.minLen && clean.length <= config.maxLen;
  }
  return clean.length >= config.minLen && clean.length <= config.maxLen;
};

// Validadores específicos Brasil (mantener compatibilidad)
export const isValidCPF = (cpf) => {
  cpf = (cpf || "").replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
};

export const isValidCNPJ = (cnpj) => {
  cnpj = (cnpj || "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const dig = cnpj.substring(size);
  let sum = 0, pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(dig.charAt(0))) return false;
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(dig.charAt(1));
};
