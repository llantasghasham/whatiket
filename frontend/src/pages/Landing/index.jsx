import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

export default function Landing() {
  const history = useHistory();
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  useEffect(() => {
    // Intento obtener planes desde un endpoint conocido si existe
    async function fetchPlanes() {
      try {
        // Heurística: si existe una variable global de backendUrl o endpoint público, úsala.
        // Como no tenemos servicios detectados, intentamos /api/plans como fallback.
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          setPlanes(Array.isArray(data) ? data : []);
        }
      } catch (_) {
        // Silenciar y dejar vacía la lista
      } finally {
        setLoadingPlanes(false);
      }
    }

    fetchPlanes();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#0f172a",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#06b6d4)", boxShadow: "0 6px 16px rgba(34,197,94,.35)" }} />
            <strong style={{ letterSpacing: -0.3 }}>Whaticket</strong>
          </div>
          <nav style={{ display: "flex", gap: 18, fontSize: 14 }}>
            <a href="#funciones" style={{ color: "#cbd5e1", textDecoration: "none" }}>Funciones</a>
            <a href="#como-funciona" style={{ color: "#cbd5e1", textDecoration: "none" }}>Cómo funciona</a>
            <a href="#planes" style={{ color: "#cbd5e1", textDecoration: "none" }}>Planes</a>
            <a href="#contacto" style={{ color: "#cbd5e1", textDecoration: "none" }}>Contacto</a>
            <Link to="/login" style={{ color: "#e2e8f0", textDecoration: "none" }}>Login</Link>
            <Link to="/signup" style={{ color: "#22c55e", textDecoration: "none", fontWeight: 600 }}>Registro</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: "radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,.25), transparent), radial-gradient(1200px 600px at 90% -10%, rgba(6,182,212,.25), transparent), #0b1220",
        color: "#e2e8f0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 20px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 32 }}>
          <div>
            <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: 0 }}>Automatiza tu atención con Inteligencia Artificial</h1>
            <p style={{ color: "#94a3b8", marginTop: 16, fontSize: 16 }}>
              Centraliza WhatsApp, chatbots y flujos inteligentes en una sola plataforma para escalar tu soporte.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button onClick={() => history.push("/signup")}
                style={{ background: "#22c55e", color: "#0b1220", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}>
                Comenzar gratis
              </button>
              <a href="#contacto" style={{ color: "#e2e8f0", textDecoration: "none", padding: "12px 0" }}>Hablar con consultor →</a>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,.1), rgba(6,182,212,.1))", border: "1px solid rgba(148,163,184,.2)", borderRadius: 14, height: 300 }} />
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" style={{ background: "#0b1220", color: "#e2e8f0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px" }}>
          <h2 style={{ marginTop: 0 }}>Recursos poderosos</h2>
          <ul style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, listStyle: "none", padding: 0, margin: 0 }}>
            {["Chatbot/FlowBuilder", "Múltiples conexiones", "Atención omnicanal", "Kanban de tickets", "Integraciones API", "IA en respuestas"].map((t) => (
              <li key={t} style={{ border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, padding: 16, background: "rgba(15,23,42,.6)" }}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" style={{ background: "#0b1220", color: "#e2e8f0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px" }}>
          <h2 style={{ marginTop: 0 }}>Cómo funciona</h2>
          <ol style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, paddingLeft: 18 }}>
            <li>Conecta tus números y canales</li>
            <li>Diseña flujos inteligentes en minutos</li>
            <li>Gestiona y mide tu atención</li>
          </ol>
        </div>
      </section>

      {/* Planes dinámicos */}
      <section id="planes" style={{ background: "#0b1220", color: "#e2e8f0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px" }}>
          <h2 style={{ marginTop: 0 }}>Elige el plan ideal</h2>
          {loadingPlanes ? (
            <div style={{ color: "#94a3b8" }}>Cargando planes…</div>
          ) : planes.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>Sin planes configurados por ahora.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {planes.map((p) => (
                <div key={p.id || p.name} style={{
                  border: "1px solid rgba(148,163,184,.2)",
                  borderRadius: 12,
                  padding: 18,
                  background: "rgba(15,23,42,.6)",
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.name || p.title}</div>
                  <div style={{ color: "#94a3b8", marginBottom: 12 }}>{p.amount ? `$${p.amount}` : "Consultar"}</div>
                  <ul style={{ paddingLeft: 18, color: "#cbd5e1" }}>
                    {(p.features || []).map((f, idx) => (
                      <li key={idx}>{typeof f === 'string' ? f : f?.label}</li>
                    ))}
                  </ul>
                  <button onClick={() => history.push("/signup?plan=" + encodeURIComponent(p.id || p.name))}
                    style={{ marginTop: 12, background: "#22c55e", color: "#0b1220", border: 0, borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                    Seleccionar plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" style={{ background: "#0b1220", color: "#e2e8f0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px" }}>
          <h2 style={{ marginTop: 0 }}>Ponte en contacto</h2>
          <p style={{ color: "#94a3b8" }}>¿Dudas? Escríbenos y te asesoramos.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ background: "#22c55e", color: "#0b1220", borderRadius: 8, padding: "10px 14px", textDecoration: "none", fontWeight: 700 }}>WhatsApp</a>
            <button onClick={() => history.push("/signup")} style={{ background: "transparent", color: "#e2e8f0", border: "1px solid rgba(148,163,184,.3)", borderRadius: 8, padding: "10px 14px", fontWeight: 600, cursor: "pointer" }}>Probar gratis</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0b1220", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>© {new Date().getFullYear()} Whaticket. Todos los derechos reservados.</span>
          <div style={{ display: "flex", gap: 14 }}>
            <a href="#" style={{ color: "#cbd5e1", textDecoration: "none" }}>Términos</a>
            <a href="#" style={{ color: "#cbd5e1", textDecoration: "none" }}>Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
