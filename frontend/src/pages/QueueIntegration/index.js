import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import n8n from "../../assets/n8n.png";
import dialogflow from "../../assets/dialogflow.png";
import webhooks from "../../assets/webhook.png";
import typebot from "../../assets/typebot.jpg";
import flowbuilder from "../../assets/flowbuilders.png";
import { makeStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import {
  DeleteOutline,
  Edit
} from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import IntegrationModal from "../../components/QueueIntegrationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WebhookIcon from '@mui/icons-material/Webhook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex((u) => u.id === queueIntegration.id);

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;

    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

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

  // ===== SEÇÃO DE BUSCA =====
  searchSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  searchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },

  searchTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  // ===== SEÇÃO DE ESTATÍSTICAS =====
  cardSection: {
    marginBottom: theme.spacing(4),
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    
    "&::before": {
      content: '""',
      width: "4px",
      height: "20px",
      backgroundColor: "#3b82f6",
      borderRadius: "2px",
    }
  },

  statsCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
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
      transform: "translateY(-4px)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      
      "&::before": {
        width: "6px",
      }
    },
  },

  // Cores dos cards
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

  // ===== CONTEÚDO DOS CARDS =====
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },

  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    
    "& svg": {
      fontSize: "28px",
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
    fontSize: "36px",
    fontWeight: 800,
    color: "#1a202c",
    lineHeight: 1,
    marginBottom: theme.spacing(1),
  },

  // ===== CAMPO DE BUSCA MODERNO =====
  modernTextField: {
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

  // ===== BOTÃO ADICIONAR =====
  addButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "56px",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  // ===== SEÇÃO DE INTEGRAÇÕES =====
  integrationsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  integrationsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  integrationsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE INTEGRAÇÕES =====
  integrationCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
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
      backgroundColor: "#3b82f6",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      
      "&::before": {
        width: "6px",
      }
    },
  },

  integrationCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  integrationAvatar: {
    width: "120px",
    height: "40px",
    borderRadius: "8px",
    marginBottom: theme.spacing(2),
    border: "2px solid #f1f5f9",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  integrationName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
  },

  integrationInfo: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 500,
    padding: theme.spacing(0.5, 1),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    width: "100%",
    
    "& strong": {
      color: "#1a202c",
      fontWeight: 700,
    },
  },

  typeChip: {
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
    textTransform: "capitalize",
    
    "&.dialogflow": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    
    "&.n8n": {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    },
    
    "&.webhook": {
      backgroundColor: "#f3e8ff",
      color: "#7c3aed",
    },
    
    "&.typebot": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.flowbuilder": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
  },

  integrationActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  actionButton: {
    borderRadius: "12px",
    padding: theme.spacing(1.5),
    minWidth: "48px",
    minHeight: "48px",
    transition: "all 0.2s ease",
    fontWeight: 600,
    
    "&.edit-button": {
      backgroundColor: "#3b82f6",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-2px)",
      }
    },
    
    "&.delete-button": {
      backgroundColor: "#ef4444",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#dc2626",
        transform: "translateY(-2px)",
      }
    },
  },

  // ===== ESTADOS =====
  loadingContainer: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },

  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },

  // ===== SCROLL CUSTOMIZADO =====
  customScrollContainer: {
    maxHeight: "calc(100vh - 400px)",
    overflowY: "auto",
    
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f5f9",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "3px",
      "&:hover": {
        background: "#94a3b8",
      }
    },
  },

  // ===== RESPONSIVIDADE MOBILE =====
  mobileCard: {
    padding: theme.spacing(2),
  },

  mobileCardContent: {
    padding: theme.spacing(2),
  },

  mobileActionButton: {
    minWidth: '40px',
    padding: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    borderRadius: "8px",
  },
}));

const QueueIntegration = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;
  const history = useHistory();

  // Estatísticas calculadas
  const totalIntegrations = queueIntegration.length;
  const dialogflowCount = queueIntegration.filter(i => i.type === 'dialogflow').length;
  const webhookCount = queueIntegration.filter(i => i.type === 'webhook').length;
  const n8nCount = queueIntegration.filter(i => i.type === 'n8n').length;
  const typebotCount = queueIntegration.filter(i => i.type === 'typebot').length;
  const flowbuilderCount = queueIntegration.filter(i => i.type === 'flowbuilder').length;
  const otherCount = totalIntegrations - (dialogflowCount + webhookCount + n8nCount + typebotCount + flowbuilderCount);

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
        toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INTEGRATIONS", payload: data.queueIntegrations });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onQueueEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_INTEGRATIONS", payload: data.queueIntegration });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    };

    socket.on(`company-${companyId}-queueIntegration`, onQueueEvent);
    return () => {
      socket.off(`company-${companyId}-queueIntegration`, onQueueEvent);
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const getIntegrationAvatar = (type) => {
    const avatars = {
      dialogflow: dialogflow,
      n8n: n8n,
      webhook: webhooks,
      typebot: typebot,
      flowbuilder: flowbuilder,
    };
    return avatars[type] || webhooks;
  };

  const renderCardActions = (integration) => {
    return (
      <CardActions className={classes.integrationActions}>
        <Tooltip title="Editar integración" placement="top">
          <Button
            onClick={() => handleEditIntegration(integration)}
            className={`${classes.actionButton} edit-button`}
            startIcon={<Edit />}
            size="small"
          >
            {isMobile ? '' : 'Editar'}
          </Button>
        </Tooltip>

        <Tooltip title="Eliminar integración" placement="top">
          <Button
            onClick={() => {
              setConfirmModalOpen(true);
              setDeletingUser(integration);
            }}
            className={`${classes.actionButton} delete-button`}
            startIcon={<DeleteOutline />}
            size="small"
          >
            {isMobile ? '' : 'Eliminar'}
          </Button>
        </Tooltip>
      </CardActions>
    );
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingUser &&
            `${i18n.t("queueIntegration.confirmationModal.deleteTitle")} ${deletingUser.name}?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteIntegration(deletingUser.id)}
        >
          {i18n.t("queueIntegration.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        
        <IntegrationModal
          open={userModalOpen}
          onClose={handleCloseIntegrationModal}
          aria-labelledby="form-dialog-title"
          integrationId={selectedIntegration && selectedIntegration.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <IntegrationInstructionsIcon />
                {i18n.t("queueIntegration.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Conecta y configura integraciones externas para una automatización avanzada
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleOpenUserModal}
                className={classes.addButton}
                startIcon={<AddIcon />}
              >
                {i18n.t("queueIntegration.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN DE BÚSQUEDA */}
        <Box className={classes.searchSection}>
          <Box className={classes.searchHeader}>
            <Typography className={classes.searchTitle}>
              <SearchIcon />
              Buscar integraciones
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={i18n.t("queueIntegration.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                variant="outlined"
                size="medium"
                className={classes.modernTextField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#3b82f6" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS INTEGRACIONES */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de las integraciones
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de integraciones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalIntegrations}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <HubIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Webhooks
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {webhookCount}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <WebhookIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Chatbots
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {dialogflowCount + typebotCount}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <SmartToyIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Automatización
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {n8nCount + flowbuilderCount}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <TrendingUpIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN DE INTEGRACIONES */}
        <Box className={classes.integrationsSection}>
          <Box className={classes.integrationsHeader}>
            <Typography className={classes.integrationsTitle}>
              Lista de integraciones ({totalIntegrations})
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando integraciones...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus integraciones
              </Typography>
            </div>
          ) : queueIntegration.length === 0 ? (
            <div className={classes.emptyState}>
              <IntegrationInstructionsIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontró ninguna integración
              </Typography>
              <Typography variant="body2">
                Haz clic en "Agregar" para crear tu primera integración
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {queueIntegration.map((integration) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                    <Card className={classes.integrationCard}>
                      <CardContent className={classes.integrationCardContent}>
                        <Avatar 
                          src={getIntegrationAvatar(integration.type)} 
                          className={classes.integrationAvatar}
                        />
                        
                        <Typography className={classes.integrationName}>
                          {integration.name}
                        </Typography>
                        
                        <div className={classes.integrationInfo}>
                          <span>ID:</span>
                          <strong>{integration.id}</strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="16px">
                          <Chip 
                            label={integration.type}
                            className={`${classes.typeChip} ${integration.type}`}
                            size="small"
                          />
                        </Box>
                        
                        <div className={classes.integrationInfo}>
                          <span>Tipo:</span>
                          <strong>{integration.type}</strong>
                        </div>
                      </CardContent>

                      {renderCardActions(integration)}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default QueueIntegration;