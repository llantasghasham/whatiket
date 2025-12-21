export function capitalize(str) {
    // Verificar si la cadena no está vacía
    if (str.length === 0) {
      return str;
    }
  
    // Capitalizar la primera letra y concatenar con el resto de la cadena
    return str.charAt(0).toUpperCase() + str.slice(1);
  }