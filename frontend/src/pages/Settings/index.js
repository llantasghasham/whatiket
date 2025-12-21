import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";
import { toast } from "react-toastify";
import api from "../../services/api";

import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  // ===== DISEÑO PRINCIPAL SIN BORDES =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: 0, // Padding removido
    margin: 0, // Margen removido
  },

  container: {
    maxWidth: "100%", // Full width
    margin: 0, // Margen removido
    padding: theme.spacing(3), // Padding interno
  },

  // ===== ENCABEZADO SIN BORDES =====
  header: {
    backgroundColor: "transparent", // Fondo removido
    borderRadius: 0, // Radio de borde removido
    padding: theme.spacing(2, 0), // Padding solo vertical
    marginBottom: theme.spacing(3),
    boxShadow: "none", // Sombra removida
    border: "none", // Borde removido
  },

  headerTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerSubtitle: {
    fontSize: "18px",
    color: "#64748b",
    fontWeight: 500,
  },

  // ===== SECCIÓN DE ESTADÍSTICAS SIN BORDES =====
  cardSection: {
    marginBottom: theme.spacing(4),
    padding: 0, // Padding removido
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    
    "&::before": {
      content: '""',
      width: "4px",
      height: "24px",
      backgroundColor: "#3b82f6",
      borderRadius: "2px",
    }
  },

  statsCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: theme.spacing(3),
    border: "none", // Borde removido
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)", // Sombra más suave
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
      
      "&::before": {
        width: "8px",
      }
    },
  },

  // Colores de las tarjetas
  cardBlue: {
    "&::before": {
      backgroundColor: "#3b82f6",
    },
  },

  cardGreen: {
    "&::before": {
      backgroundColor: "#10b981",
    },
  },

  cardYellow: {
    "&::before": {
      backgroundColor: "#f59e0b",
    },
  },

  cardRed: {
    "&::before": {
      backgroundColor: "#ef4444",
    },
  },

  // ===== CONTENIDO DE LAS TARJETAS =====
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },

  cardIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    
    "& svg": {
      fontSize: "32px",
    }
  },

  cardIconBlue: {
    backgroundColor: "#3b82f6",
  },

  cardIconGreen: {
    backgroundColor: "#10b981",
  },

  cardIconYellow: {
    backgroundColor: "#f59e0b",
  },

  cardIconRed: {
    backgroundColor: "#ef4444",
  },

  cardLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(1),
  },

  cardValue: {
    fontSize: "40px",
    fontWeight: 900,
    color: "#1a202c",
    lineHeight: 1,
    marginBottom: theme.spacing(1),
  },

  // ===== SECCIÓN DE CONFIGURACIONES SIN BORDES =====
  settingsSection: {
    backgroundColor: "transparent", // Fondo removido
    borderRadius: 0, // Radio de borde removido
    padding: 0, // Padding removido
    marginBottom: theme.spacing(4),
    border: "none", // Borde removido
    minHeight: "400px",
  },

  settingsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    borderBottom: "2px solid #e2e8f0", // Borde solo en la parte inferior
  },

  settingsTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    
    "&::before": {
      content: '""',
      width: "4px",
      height: "24px",
      backgroundColor: "#10b981",
      borderRadius: "2px",
    }
  },

  // ===== TARJETAS DE CONFIGURACIONES SIN BORDES EXTERNOS =====
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    border: "none", // Borde removido
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)", // Sombra más pronunciada
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: "#3b82f6",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 48px rgba(0, 0, 0, 0.12)",
      
      "&::before": {
        width: "8px",
      }
    },
  },

  settingCardContent: {
    padding: theme.spacing(4),
  },

  settingTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  settingDescription: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },

  settingIcon: {
    color: "#3b82f6",
    fontSize: "28px",
  },

  statusChip: {
    fontWeight: 700,
    fontSize: "13px",
    height: "32px",
    borderRadius: "16px",
    marginBottom: theme.spacing(2),
    
    "&.enabled": {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "2px solid #bbf7d0",
    },
    
    "&.disabled": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "2px solid #fecaca",
    },
  },

  // ===== CONTROL DE FORMULARIO MODERNO SIN BORDES EXTERNOS =====
  modernFormControl: {
    width: "100%",
    
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: "#fff",
      transition: "all 0.2s ease",
      
      "&:hover": {
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      },
      
      "&.Mui-focused": {
        boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
      }
    },
    
    "& .MuiInputLabel-outlined": {
      color: "#64748b",
      fontWeight: 600,
      fontSize: "16px",
      
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

  // ===== ESTADOS =====
  loadingContainer: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#64748b",
  },

  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#64748b",
  },

  // ===== RESPONSIVIDAD MÓVIL =====
  mobileCard: {
    padding: theme.spacing(2),
  },

  mobileCardContent: {
    padding: theme.spacing(2),
  },

  // ===== DISEÑO FLUIDO =====
  fluidContainer: {
    width: "100%",
    maxWidth: "none",
    margin: 0,
    padding: theme.spacing(2, 3),
  },
}));

const Settings = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user, socket } = useContext(AuthContext);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estadísticas calculadas
  const totalSettings = settings.length;
  const enabledSettings = settings.filter(s => s.value === 'enabled').length;
  const disabledSettings = settings.filter(s => s.value === 'disabled').length;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;

    const onSettingsEvent = (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    };

    socket.on(`company-${companyId}-settings`, onSettingsEvent);
    return () => {
      socket.off(`company-${companyId}-settings`, onSettingsEvent);
    };
  }, [socket]);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;

    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success("Configuración actualizada exitosamente");
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : '';
  };

  const getSettingStatus = (key) => {
    const value = getSettingValue(key);
    return value === 'enabled' ? 'enabled' : 'disabled';
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.fluidContainer}>

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <SettingsIcon />
                Configuraciones
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Configura las preferencias y comportamientos del sistema
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS CONFIGURACIONES */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Resumen de Configuraciones
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de configuraciones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalSettings}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <TuneIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Habilitadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {enabledSettings}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <CheckCircleIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Deshabilitadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {disabledSettings}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <CancelIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Estado general
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: "28px" }}>
                      {enabledSettings > disabledSettings ? 'Activo' : 'Restringido'}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <AdminPanelSettingsIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN DE CONFIGURACIONES */}
        <Box className={classes.settingsSection}>
          <Box className={classes.settingsHeader}>
            <Typography className={classes.settingsTitle}>
              <TuneIcon />
              Configuraciones del sistema
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={60} style={{ color: "#3b82f6", marginBottom: "24px" }} />
              <Typography variant="h5" style={{ fontWeight: "700", marginBottom: "12px", color: "#1a202c" }}>
                Cargando configuraciones...
              </Typography>
              <Typography variant="body1" style={{ color: "#64748b", fontSize: "16px" }}>
                Espera mientras obtenemos las configuraciones del sistema
              </Typography>
            </div>
          ) : settings.length === 0 ? (
            <div className={classes.emptyState}>
              <SettingsIcon style={{ fontSize: "4rem", marginBottom: "16px", color: "#cbd5e1" }} />
              <Typography variant="h5" style={{ fontWeight: "700", marginBottom: "12px", color: "#1a202c" }}>
                No se encontraron configuraciones
              </Typography>
              <Typography variant="body1" style={{ fontSize: "16px" }}>
                Las configuraciones del sistema aparecerán aquí cuando estén disponibles
              </Typography>
            </div>
          ) : (
            <Grid container spacing={4}>
              {/* USER CREATION SETTING */}
              <Grid item xs={12} md={6} lg={6}>
                <Card className={classes.settingCard}>
                  <CardContent className={classes.settingCardContent}>
                    <Typography className={classes.settingTitle}>
                      <PersonAddIcon className={classes.settingIcon} />
                      Creación de usuarios
                    </Typography>
                    
                    <Typography className={classes.settingDescription}>
                      Controla si se pueden crear nuevos usuarios en el sistema. Cuando está deshabilitado, solo los administradores pueden crear usuarios.
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" marginBottom="24px">
                      <Chip 
                        label={getSettingValue("userCreation") === 'enabled' ? 'Habilitado' : 'Deshabilitado'}
                        className={`${classes.statusChip} ${getSettingStatus("userCreation")}`}
                        size="medium"
                        icon={
                          getSettingValue("userCreation") === 'enabled' ? 
                          <CheckCircleIcon /> : <CancelIcon />
                        }
                      />
                    </Box>

                    <FormControl variant="outlined" className={classes.modernFormControl}>
                      <InputLabel id="userCreation-label">Estado de la configuración</InputLabel>
                      <Select
                        labelId="userCreation-label"
                        id="userCreation-setting"
                        name="userCreation"
                        value={
                          settings && settings.length > 0 ? getSettingValue("userCreation") : ''
                        }
                        onChange={handleChangeSetting}
                        label="Estado de la configuración"
                      >
                        <MenuItem value="enabled">
                          <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircleIcon style={{ color: "#10b981", fontSize: "24px" }} />
                            <Box>
                              <Typography style={{ fontWeight: "600", color: "#1a202c" }}>
                                Habilitado
                              </Typography>
                              <Typography style={{ fontSize: "12px", color: "#64748b" }}>
                                Permite la creación de usuarios
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="disabled">
                          <Box display="flex" alignItems="center" gap={1}>
                            <CancelIcon style={{ color: "#ef4444", fontSize: "24px" }} />
                            <Box>
                              <Typography style={{ fontWeight: "600", color: "#1a202c" }}>
                                Deshabilitado
                              </Typography>
                              <Typography style={{ fontSize: "12px", color: "#64748b" }}>
                                Bloquea la creación de usuarios
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              {/* MARCADOR PARA FUTURAS CONFIGURACIONES */}
              <Grid item xs={12} md={6} lg={6}>
                <Card className={classes.settingCard} style={{ opacity: 0.7 }}>
                  <CardContent className={classes.settingCardContent}>
                    <Typography className={classes.settingTitle}>
                      <TuneIcon className={classes.settingIcon} />
                      Configuraciones avanzadas
                    </Typography>
                    
                    <Typography className={classes.settingDescription}>
                      Configuraciones adicionales del sistema estarán disponibles pronto. Se agregarán nuevas funcionalidades en próximas actualizaciones.
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" marginBottom="24px">
                      <Chip 
                        label="En desarrollo"
                        style={{
                          backgroundColor: "#f3f4f6",
                          color: "#6b7280",
                          fontWeight: 700,
                          fontSize: "13px",
                          height: "32px",
                          border: "2px solid #e5e7eb",
                        }}
                        size="medium"
                      />
                    </Box>

                    <FormControl variant="outlined" className={classes.modernFormControl} disabled>
                      <InputLabel>Espera próximas versiones</InputLabel>
                      <Select
                        value=""
                        label="Espera próximas versiones"
                      >
                        <MenuItem value="">
                          <Box display="flex" alignItems="center" gap={1}>
                            <TuneIcon style={{ color: "#9ca3af", fontSize: "24px" }} />
                            <Typography style={{ fontStyle: "italic", color: "#6b7280" }}>
                              Pronto más configuraciones...
                            </Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Settings;