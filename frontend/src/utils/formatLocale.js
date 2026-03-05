/**
 * Obtiene el locale para formateo de fechas y números según el idioma actual de i18n.
 * Por defecto usa español (es) cuando el idioma principal es español.
 */
import { i18n } from "../translate/i18n";

export function getFormatLocale() {
  const lang = i18n?.language || "es";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("pt")) return "pt-BR";
  if (lang.startsWith("en")) return "en";
  return "es";
}
