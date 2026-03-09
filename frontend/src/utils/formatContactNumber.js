/**
 * Formatea el número de contacto para mostrar.
 * Los IDs largos (15+ dígitos) de Facebook/Instagram/Meta se muestran abreviados.
 * @param {string|number} number - Número o ID del contacto
 * @param {string} contactName - Nombre del contacto (opcional, preferido si existe)
 * @returns {string} Texto formateado para mostrar
 */
export const formatContactNumber = (number, contactName) => {
  if (!number && !contactName) return "";
  const numStr = String(number || "").replace(/\D/g, "");
  // IDs de Meta (Facebook/Instagram) suelen ser 15+ dígitos
  if (numStr.length >= 15 && /^\d+$/.test(numStr)) {
    return contactName && !/^\d+$/.test(String(contactName || "").trim())
      ? contactName
      : `${numStr.slice(0, 4)}...${numStr.slice(-4)}`;
  }
  return contactName && !/^\d+$/.test(String(contactName || "").trim())
    ? contactName
    : number || "";
};

export default formatContactNumber;
