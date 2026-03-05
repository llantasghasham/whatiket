import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { messages } from "./languages";

// Idiomas soportados: es (predeterminado), en, pt, ar (árabe)
const supportedLngs = ["es", "en", "pt", "pt-BR", "ar"];

i18n.use(LanguageDetector).init({
	debug: false,
	defaultNS: ["translations"],
	lng: "es",
	fallbackLng: "es",
	supportedLngs,
	ns: ["translations"],
	resources: messages,
	// Prioridad: preferencia guardada (localStorage/cookie) → español por defecto (no usar navegador para evitar portugués por defecto)
	detection: {
		order: ["localStorage", "cookie"],
		caches: ["localStorage", "cookie"],
		lookupLocalStorage: "i18nextLng",
		lookupCookie: "i18next",
		checkWhitelist: true,
	},
	interpolation: {
		escapeValue: false,
	},
});

export { i18n };
