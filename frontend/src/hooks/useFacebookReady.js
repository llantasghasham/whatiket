import { useState, useEffect } from "react";

/**
 * Hook que indica si el SDK de Facebook está listo.
 * Evita el error "FB.login() called before FB.init()" al deshabilitar
 * los botones de Facebook/Instagram hasta que el SDK esté cargado.
 */
export default function useFacebookReady() {
  const [ready, setReady] = useState(() => !!window.FB);

  useEffect(() => {
    if (window.FB) {
      setReady(true);
      return;
    }

    const onReady = () => setReady(true);
    window.addEventListener("fb-sdk-ready", onReady);

    return () => window.removeEventListener("fb-sdk-ready", onReady);
  }, []);

  return ready;
}
