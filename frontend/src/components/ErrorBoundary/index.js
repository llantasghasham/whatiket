import React from "react";
import { Box, Button, Typography, Paper } from "@material-ui/core";

/**
 * ErrorBoundary: captura errores de React y muestra mensaje en lugar de pantalla blanca.
 * Envuelve la página Atendimentos para que si algo falla, el usuario vea el error y pueda recargar.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Error capturado:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoLogin = () => {
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          bgcolor="#f5f5f5"
          p={3}
        >
          <Paper style={{ padding: 32, maxWidth: 480, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom style={{ color: "#d32f2f" }}>
              Error en la página de Atendimientos
            </Typography>
            <Typography variant="body1" color="textSecondary" style={{ marginBottom: 16 }}>
              La página no pudo cargarse. Esto puede ocurrir tras cambios en el layout, modo oscuro o componentes del header.
            </Typography>
            <Typography variant="caption" display="block" style={{ marginBottom: 24, wordBreak: "break-all", color: "#666" }}>
              {this.state.error?.message || "Error desconocido"}
            </Typography>
            <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
              <Button variant="contained" color="primary" onClick={this.handleReload}>
                Recargar página
              </Button>
              <Button variant="outlined" onClick={this.handleGoLogin}>
                Ir al login
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
