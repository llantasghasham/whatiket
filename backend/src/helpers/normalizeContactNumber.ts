const DIGIT_REGEX = /\D/g;

// Código de país por defecto para números locales (sin código de país).
// Ejemplos: 55 = Brasil, 506 = Costa Rica, 52 = México, 57 = Colombia.
// Se configura con variable de entorno DEFAULT_COUNTRY_CODE (ej. DEFAULT_COUNTRY_CODE=506).
const getDefaultCountryCode = (): string => {
	const code = process.env.DEFAULT_COUNTRY_CODE;
	if (code && /^\d{1,3}$/.test(code)) return code;
	return "55"; // fallback Brasil para no romper instalaciones existentes
};

const stripDigits = (value?: string | null): string => {
	if (!value) return "";
	return value.replace(DIGIT_REGEX, "");
};

// Detecta si es un LID (Linked ID) del WhatsApp Business API
// LIDs suelen comenzar con 120 y tener 15+ dígitos
export const isLidNumber = (digits: string): boolean => {
	if (!digits) return false;
	if (digits.startsWith("120") && digits.length >= 15) {
		return true;
	}
	if (digits.length > 15) {
		return true;
	}
	return false;
};

// Longitud mínima y máxima para número internacional E.164 (con código de país)
const MIN_INTERNATIONAL_LENGTH = 10;
const MAX_INTERNATIONAL_LENGTH = 15;

/**
 * Normaliza un número de teléfono para WhatsApp (formato internacional, solo dígitos).
 * Soporta cualquier país: usa DEFAULT_COUNTRY_CODE para números locales.
 * - Si el número ya tiene 10-15 dígitos y no es LID → se acepta tal cual.
 * - Si es número local (8-11 dígitos sin código) → se agrega DEFAULT_COUNTRY_CODE.
 */
export const normalizePhoneNumber = (value?: string | null): string => {
	let digits = stripDigits(value);

	if (!digits) {
		return "";
	}

	if (isLidNumber(digits)) {
		console.log(`[normalizePhoneNumber] Detected LID/WAID, ignoring: ${digits}`);
		return "";
	}

	// Ya es número internacional (longitud típica 10-15 dígitos)
	if (digits.length >= MIN_INTERNATIONAL_LENGTH && digits.length <= MAX_INTERNATIONAL_LENGTH) {
		return digits;
	}

	// Número local: agregar código de país por defecto (ej. 506 Costa Rica, 55 Brasil)
	const countryCode = getDefaultCountryCode();
	if (digits.length >= 8 && digits.length <= 11 && !digits.startsWith(countryCode)) {
		digits = `${countryCode}${digits}`;
	}

	if (digits.length >= MIN_INTERNATIONAL_LENGTH && digits.length <= MAX_INTERNATIONAL_LENGTH) {
		return digits;
	}

	console.log(`[normalizePhoneNumber] Invalid number (length/format): ${digits}`);
	return "";
};

const extractDigitsFromJid = (jid?: string | null): string => {
  if (!jid) return "";
  return stripDigits(jid);
};

const getCandidateNumbers = (candidates: Array<string | null | undefined>): string[] =>
  candidates
    .map(extractDigitsFromJid)
    .filter(digits => !!digits);

export const resolveContactNumber = ({
  rawNumber,
  remoteJid,
  remoteJidAlt
}: {
  rawNumber?: string | null;
  remoteJid?: string | null;
  remoteJidAlt?: string | null;
}): string => {
  const rawCandidates = getCandidateNumbers([remoteJidAlt, remoteJid, rawNumber]);
  for (const digits of rawCandidates) {
    const normalized = normalizePhoneNumber(digits);
    if (normalized) {
      return normalized;
    }
  }

  return "";
};

export const buildRemoteJidFromNumber = (number: string, isGroup = false): string => {
	if (!number) {
		return "";
	}

	return isGroup ? `${number}@g.us` : `${number}@s.whatsapp.net`;
};

export const sanitizeRemoteJid = (
  remoteJid?: string | null,
  number?: string | null,
  isGroup = false
): string => {
  if (number) {
    const normalized = normalizePhoneNumber(number);
    if (normalized) {
      return buildRemoteJidFromNumber(normalized, isGroup);
    }
  }

  return "";
};
