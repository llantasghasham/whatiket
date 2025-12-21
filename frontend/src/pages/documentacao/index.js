import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { 
  Typography, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from "@material-ui/core";
import ApiIcon from '@mui/icons-material/Api';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import MessageIcon from '@mui/icons-material/Message';
import ContactsIcon from '@mui/icons-material/Contacts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  // ===== LAYOUT PRINCIPAL =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  // ===== CABEÇALHO =====
  header: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3, 4),
    marginBottom: theme.spacing(4),
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },

  headerTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: 500,
  },

  headerActions: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
  },

  // ===== SEÇÃO DE CONFIGURAÇÃO =====
  configSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  configHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  configTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== SELETOR DE LINGUAGEM =====
  languageSelector: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      transition: "all 0.2s ease",
      
      "&:hover": {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      
      "&.Mui-focused": {
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
      }
    },
    
    "& .MuiInputLabel-outlined": {
      color: "#64748b",
      fontWeight: 600,
      
      "&.Mui-focused": {
        color: "#3b82f6",
      }
    },

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#e2e8f0",
      borderWidth: "2px",
    },

    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cbd5e1",
    },

    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
    },
  },

  downloadButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      backgroundColor: "#059669",
      transform: "translateY(-1px)",
    },
  },

  // ===== SEÇÕES DA API =====
  apiSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: "1px solid #e2e8f0",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  sectionIcon: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "8px",
    padding: theme.spacing(0.5),
    
    "& svg": {
      fontSize: "20px",
    }
  },

  // ===== CARDS DE ENDPOINT =====
  endpointCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
    transition: "all 0.2s ease",
    overflow: "hidden",
    
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }
  },

  endpointHeader: {
    padding: theme.spacing(2),
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  endpointMethod: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  methodChip: {
    fontWeight: 700,
    fontSize: "12px",
    height: "24px",
    minWidth: "60px",
    borderRadius: "6px",
    
    "&.get": {
      backgroundColor: "#10b981",
      color: "white",
    },
    
    "&.post": {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    
    "&.put": {
      backgroundColor: "#f59e0b",
      color: "white",
    },
    
    "&.delete": {
      backgroundColor: "#ef4444",
      color: "white",
    },
  },

  endpointPath: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a202c",
    fontFamily: "monospace",
  },

  endpointUrl: {
    fontSize: "14px",
    color: "#10b981",
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
  },

  copyButton: {
    color: "#64748b",
    padding: theme.spacing(0.5),
    
    "&:hover": {
      color: "#3b82f6",
      backgroundColor: "#f1f5f9",
    }
  },

  // ===== CÓDIGO =====
  codeContainer: {
    padding: theme.spacing(2),
    position: "relative",
  },

  codeBlock: {
    backgroundColor: "#1a202c",
    color: "#e2e8f0",
    padding: theme.spacing(2),
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: 1.6,
    overflow: "auto",
    margin: 0,
    border: "none",
    
    "&::-webkit-scrollbar": {
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#374151",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#6b7280",
      borderRadius: "3px",
      "&:hover": {
        background: "#9ca3af",
      }
    },
  },

  // ===== CONFIGURAÇÕES DE AMBIENTE =====
  envSection: {
    backgroundColor: "#1a202c",
    color: "#e2e8f0",
    borderRadius: "12px",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  envTitle: {
    color: "#3b82f6",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    fontFamily: theme.typography.fontFamily,
  },

  // ===== RESPONSIVIDADE =====
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing(2),
    },
    
    headerTitle: {
      fontSize: "24px",
    },
    
    endpointHeader: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: theme.spacing(1),
    }
  },
}));

const ApiDocumentation = () => {
  const classes = useStyles();
  const [language, setLanguage] = useState("Javascript");

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías añadir un toast de éxito
  };

  const getCodeExample = (method, url, body = null) => {
    const baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {tu_token_jwt}'
    };

    switch (language) {
      case "Javascript":
        return `fetch('${url}', {
  method: '${method}',
  headers: ${JSON.stringify(baseHeaders, null, 2)},${body ? `
  body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

      case "React":
        return `import { useState, useEffect } from 'react';

const ApiExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('${url}', {
        method: '${method}',
        headers: ${JSON.stringify(baseHeaders, null, 2)},${body ? `
        body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>
        {loading ? 'Cargando...' : 'Solicitud ${method}'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};`;

      case "Python":
        return `import requests
import json

url = '${url}'
headers = ${JSON.stringify(baseHeaders, null, 2).replace(/"/g, "'")}
${body ? `data = ${JSON.stringify(body, null, 2)}` : ""}

try:
    response = requests.${method.toLowerCase()}(${body ? "url, json=data, headers=headers" : "url, headers=headers"})
    response.raise_for_status()
    
    result = response.json()
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
except requests.exceptions.RequestException as e:
    print(f"Error en la solicitud: {e}")`;

      case "PHP":
        return `<?php
$url = '${url}';
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer {tu_token_jwt}'
];
${body ? `$data = ${JSON.stringify(body, null, 2)};` : ""}

$options = [
    'http' => [
        'method' => '${method}',
        'header' => implode("\\r\\n", $headers),${body ? `
        'content' => json_encode($data)` : ""}
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    die('Error en la solicitud');
}

$result = json_decode($response, true);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>`;

      case "Vue":
        return `<template>
  <div>
    <button @click="fetchData" :disabled="loading">
      {{ loading ? 'Cargando...' : 'Solicitud ${method}' }}
    </button>
    <pre v-if="data">{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
      loading: false
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await fetch('${url}', {
          method: '${method}',
          headers: ${JSON.stringify(baseHeaders, null, 2)},${body ? `
          body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
        });
        this.data = await response.json();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>`;

      case "Laravel":
        return `<?php
use Illuminate\\Support\\Facades\\Http;

try {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer {tu_token_jwt}'
    ])->${method.toLowerCase()}('${url}'${body ? `, ${JSON.stringify(body, null, 2)}` : ""});

    if ($response->successful()) {
        $data = $response->json();
        return response()->json($data);
    } else {
        return response()->json([
            'error' => 'Error en la solicitud',
            'status' => $response->status()
        ], $response->status());
    }
} catch (Exception $e) {
    return response()->json([
        'error' => $e->getMessage()
    ], 500);
}`;

      default:
        return `// Código no disponible para el lenguaje seleccionado.`;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/whaticket_postman.json';
    link.download = 'whaticket_postman.json';
    link.click();
  };

  const EndpointCard = ({ method, path, url, description, body = null }) => (
    <Card className={classes.endpointCard}>
      <Box className={classes.endpointHeader}>
        <Box>
          <Box className={classes.endpointMethod}>
            <Chip 
              label={method} 
              className={clsx(classes.methodChip, method.toLowerCase())}
              size="small"
            />
            <Typography className={classes.endpointPath}>
              {path}
            </Typography>
            <Tooltip title="Copiar URL">
              <IconButton 
                className={classes.copyButton}
                size="small"
                onClick={() => copyToClipboard(url)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography className={classes.endpointUrl}>
            {url}
          </Typography>
          {description && (
            <Typography variant="body2" style={{ color: '#64748b', marginTop: '4px' }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.codeContainer}>
        <pre className={classes.codeBlock}>
          {getCodeExample(method, url, body)}
        </pre>
      </Box>
    </Card>
  );

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* ENCABEZADO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <ApiIcon />
                Documentación de la API WhatTicket Pro
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Guía completa para integrarte con nuestra API REST
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleDownload}
                className={classes.downloadButton}
                startIcon={<DownloadIcon />}
              >
                Descargar Postman
              </Button>
            </Box>
          </Box>
        </Box>
       
{/* SELECTOR DE LENGUAJE */}
<Grid container spacing={3} alignItems="center">
  <Grid item xs={12} sm={6} md={4}>
    <FormControl fullWidth className={classes.languageSelector}>
      <InputLabel>Selecciona el lenguaje</InputLabel>
      <Select
        value={language}
        onChange={handleLanguageChange}
        label="Selecciona el lenguaje"
      >
        <MenuItem value="Javascript">JavaScript</MenuItem>
        <MenuItem value="React">React</MenuItem>
        <MenuItem value="Python">Python</MenuItem>
        <MenuItem value="PHP">PHP</MenuItem>
        <MenuItem value="Vue">Vue.js</MenuItem>
        <MenuItem value="Laravel">Laravel</MenuItem>
      </Select>
    </FormControl>
  </Grid>
  <Grid item xs={12} sm={6} md={8}>
    <Typography variant="body2" style={{ color: '#64748b' }}>
      Los ejemplos de código se mostrarán en el lenguaje seleccionado
    </Typography>
  </Grid>
</Grid>

        {/* 1. AUTENTICACIÓN */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <SecurityIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              1. Autenticación
            </Typography>
          </Box>

          <EndpointCard
            method="POST"
            path="/auth/login"
            url="https://chat.api.whaticketpro.com/auth/login"
            description="Inicia sesión y obtiene un token JWT de autenticación"
            body={{
              email: "admin@whaticket.io",
              password: "admin123"
            }}
          />

          <EndpointCard
            method="POST"
            path="/auth/refresh"
            url="https://chat.api.whaticketpro.com/auth/refresh"
            description="Renueva el token JWT usando el refresh token"
          />
        </Box>

        {/* 2. TICKETS */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <AssignmentIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              2. Tickets
            </Typography>
          </Box>

          <EndpointCard
            method="GET"
            path="/tickets"
            url="https://chat.api.whaticketpro.com/tickets"
            description="Lista todos los tickets con paginación"
          />

          <EndpointCard
            method="GET"
            path="/tickets/:ticketId"
            url="https://chat.api.whaticketpro.com/tickets/1"
            description="Busca un ticket específico por ID"
          />

          <EndpointCard
            method="POST"
            path="/tickets"
            url="https://chat.api.whaticketpro.com/tickets"
            description="Crea un nuevo ticket"
            body={{
              contactId: 1,
              status: "open",
              userId: 1,
              queueId: 1
            }}
          />

          <EndpointCard
            method="PUT"
            path="/tickets/:ticketId"
            url="https://chat.api.whaticketpro.com/tickets/1"
            description="Actualiza un ticket existente"
            body={{
              status: "closed",
              userId: 2
            }}
          />
        </Box>

        {/* 3. MENSAJES */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <MessageIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              3. Mensajes
            </Typography>
          </Box>

          <EndpointCard
            method="GET"
            path="/messages/:ticketId"
            url="https://chat.api.whaticketpro.com/messages/1"
            description="Lista los mensajes de un ticket específico"
          />

          <EndpointCard
            method="POST"
            path="/messages/send"
            url="https://chat.api.whaticketpro.com/messages/send"
            description="Envía un nuevo mensaje"
            body={{
              ticketId: 1,
              body: "¡Hola! ¿Cómo puedo ayudarte?",
              media: null
            }}
          />
        </Box>

        {/* 4. CONTACTOS */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <ContactsIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              4. Contactos
            </Typography>
          </Box>

          <EndpointCard
            method="GET"
            path="/contacts"
            url="https://chat.api.whaticketpro.com/contacts"
            description="Lista todos los contactos con paginación"
          />

          <EndpointCard
            method="POST"
            path="/contacts"
            url="https://chat.api.whaticketpro.com/contacts"
            description="Crea un nuevo contacto"
            body={{
              name: "João Silva",
              number: "5511999999999",
              email: "joao@email.com"
            }}
          />

          <EndpointCard
            method="PUT"
            path="/contacts/:contactId"
            url="https://chat.api.whaticketpro.com/contacts/1"
            description="Actualiza los datos de un contacto"
            body={{
              name: "João Silva Santos",
              email: "joao.santos@email.com"
            }}
          />
        </Box>

        {/* 5. CONEXIONES DE WHATSAPP */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <WhatsAppIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              5. Conexiones de WhatsApp
            </Typography>
          </Box>

          <EndpointCard
            method="GET"
            path="/whatsapp"
            url="https://chat.api.whaticketpro.com/whatsapp"
            description="Lista todas las conexiones de WhatsApp"
          />

          <EndpointCard
            method="POST"
            path="/whatsapp"
            url="https://chat.api.whaticketpro.com/whatsapp"
            description="Crea una nueva conexión de WhatsApp"
            body={{
              name: "WhatsApp Principal",
              greetingMessage: "¡Hola! Bienvenido a nuestra atención.",
              farewellMessage: "¡Gracias por contactarnos!"
            }}
          />

          <EndpointCard
            method="POST"
            path="/whatsapp/:whatsappId/start"
            url="https://chat.api.whaticketpro.com/whatsapp/1/start"
            description="Inicia una sesión de WhatsApp"
          />

          <EndpointCard
            method="DELETE"
            path="/whatsapp/:whatsappId"
            url="https://chat.api.whaticketpro.com/whatsapp/1"
            description="Elimina una conexión de WhatsApp"
          />
        </Box>

        {/* 6. FILAS */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <CodeIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              6. Filas de atención
            </Typography>
          </Box>

          <EndpointCard
            method="GET"
            path="/queue"
            url="https://chat.api.whaticketpro.com/queue"
            description="Lista todas las filas de atención"
          />

          <EndpointCard
            method="POST"
            path="/queue"
            url="https://chat.api.whaticketpro.com/queue"
            description="Crea una nueva fila de atención"
            body={{
              name: "Soporte técnico",
              color: "#0000FF",
              greetingMessage: "Has sido dirigido al soporte técnico."
            }}
          />
        </Box>

        {/* WEBHOOK */}
        <Box className={classes.apiSection}>
          <Box className={classes.sectionHeader}>
            <Box className={classes.sectionIcon}>
              <ApiIcon />
            </Box>
            <Typography className={classes.sectionTitle}>
              7. Webhooks
            </Typography>
          </Box>

          <Box className={classes.envSection}>
            <Typography className={classes.envTitle}>
              Eventos de webhook disponibles
            </Typography>
            <pre>
{`# Eventos que pueden enviarse a tu URL de webhook:
- ticket:create    # Nuevo ticket creado
- ticket:update    # Ticket actualizado  
- message:create   # Nuevo mensaje recibido
- message:ack      # Estado de entrega cambiado
- contact:create   # Nuevo contacto creado
- whatsapp:ready   # Conexión de WhatsApp lista
- whatsapp:qrcode  # Código QR generado`}
            </pre>
          </Box>

          <EndpointCard
            method="POST"
            path="/webhook"
            url="https://sua-url.com/webhook"
            description="Ejemplo de webhook recibido en tu aplicación"
            body={{
              event: "message:create",
              data: {
                id: 123,
                body: "Nuevo mensaje recibido",
                ticketId: 1,
                contactId: 1,
                fromMe: false,
                timestamp: "2025-01-15T10:30:00Z"
              }
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default ApiDocumentation;