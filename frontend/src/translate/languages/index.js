import { messages as portugueseMessages } from "./pt";
import { messages as englishMessages } from "./en";
import { messages as spanishMessages } from "./es";
import { messages as arabicMessages } from "./ar";

const messages = {
	...spanishMessages,
	"es-MX": spanishMessages.es,
	...englishMessages,
	...portugueseMessages,
	"pt-BR": portugueseMessages.pt,
	...arabicMessages,
};

export { messages };
