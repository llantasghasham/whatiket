import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Box, Typography, Button } from "@material-ui/core";
import MomentsUser from "../../components/MomentsUser";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";
import DashboardIcon from "@material-ui/icons/Dashboard";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import RefreshIcon from "@material-ui/icons/Refresh";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

const useStyles = makeStyles((theme) => ({
  // ===== LAYOUT PRINCIPAL =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  // ===== CABEÇALHO CORPORATIVO =====
  header: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "20px",
    padding: theme.spacing(4, 5),
    marginBottom: theme.spacing(4),
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(226, 232, 240, 0.6)",
    position: "relative",
    overflow: "hidden",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
    },
  },

  headerTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    letterSpacing: "-0.025em",
  },

  headerIcon: {
    fontSize: "36px",
    color: "#1e40af",
    filter: "drop-shadow(0 2px 4px rgba(30, 64, 175, 0.2))",
  },

  headerSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: 500,
    letterSpacing: "0.025em",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerActions: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
  },

  refreshButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "12px",
    padding: theme.spacing(1, 2),
    fontWeight: 600,
    textTransform: "none",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  // ===== SEÇÃO CORPORATIVA =====
  corporateSection: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: theme.spacing(4),
    border: "1px solid rgba(226, 232, 240, 0.6)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    position: "relative",
    minHeight: "calc(100vh - 300px)",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
      borderRadius: "20px 20px 0 0",
    },
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    borderBottom: "2px solid #f1f5f9",
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    letterSpacing: "-0.025em",
    
    "& svg": {
      fontSize: "28px",
      color: "#1e40af",
    }
  },

  // ===== WRAPPER PARA MOMENTSUSER =====
  contentWrapper: {
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
    border: "1px solid rgba(226, 232, 240, 0.6)",
    minHeight: "500px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  momentsContainer: {
    padding: theme.spacing(2),
    minHeight: "500px",
    width: "100%",
    
    // Garantir que o MomentsUser ocupe todo o espaço
    "& > *": {
      width: "100% !important",
      borderRadius: "12px !important",
    },
  },

  statusIndicator: {
    padding: theme.spacing(2),
    backgroundColor: "#f1f5f9",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontSize: "14px",
    fontWeight: 600,
    color: "#475569",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },

  // ===== ANIMAÇÕES =====
  fadeIn: {
    animation: "$fadeIn 0.6s ease-out",
  },

  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(20px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },

  slideIn: {
    animation: "$slideIn 0.8s ease-out",
  },

  "@keyframes slideIn": {
    "0%": {
      opacity: 0,
      transform: "translateX(-30px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    root: {
      padding: theme.spacing(2),
    },
    header: {
      padding: theme.spacing(3),
      "& > div": {
        flexDirection: "column",
        gap: theme.spacing(2),
        alignItems: "flex-start !important",
      }
    },
    headerTitle: {
      fontSize: "24px",
    },
    corporateSection: {
      padding: theme.spacing(2.5),
    },
  },
}));

const ChatMoments = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Verificação simples de permissões (igual ao código funcional)
  if (user?.profile === "user" && user?.allowRealTime === "disabled") {
    return <ForbiddenPage />;
  }

  // ✅ Função para forçar refresh (mantém funcionalidade útil)
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Força um reload do componente MomentsUser
    window.location.reload();
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* CABEÇALHO MODERNO */}
        <Box className={`${classes.header} ${classes.fadeIn}`}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <DashboardIcon className={classes.headerIcon} />
                Panel de Atenciones
              </Typography>
              <Typography className={classes.headerSubtitle}>
                <AccessTimeIcon style={{ fontSize: "18px" }} />
                {moment().format("dddd, DD [de] MMMM [de] YYYY")} - Monitoreo en tiempo real
              </Typography>
            </Box>
            
            <Box className={classes.headerActions}>
              <Button
                onClick={handleRefresh}
                className={classes.refreshButton}
                startIcon={<RefreshIcon />}
              >
                Actualizar
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO PRINCIPAL COM VISUAL MODERNO */}
        <Box className={`${classes.corporateSection} ${classes.slideIn}`}>
          <Box className={classes.sectionHeader}>
            <Typography className={classes.sectionTitle}>
              <DashboardIcon />
              Central de Atenciones
            </Typography>
          </Box>

          {/* INDICADOR DE STATUS */}
          <Box className={classes.statusIndicator}>
            <Box className={classes.statusDot} />
            Sistema operativo - Atenciones en tiempo real
          </Box>

          {/* CONTEÚDO PRINCIPAL - MOMENTSUSER SIMPLES */}
          <Box className={classes.contentWrapper}>
            <div className={classes.momentsContainer}>
              {/* ✅ Renderização direta do MomentsUser (como no código funcional) */}
              <MomentsUser key={refreshKey} />
            </div>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default ChatMoments;