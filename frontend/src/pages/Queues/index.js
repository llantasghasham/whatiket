import React, { useEffect, useReducer, useState, useContext } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Tooltip,
  Fade,
  CircularProgress,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import QueueIcon from '@mui/icons-material/Queue';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SortIcon from '@mui/icons-material/Sort';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import clsx from "clsx";

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

  // ===== SEÇÃO DE FILAS =====
  queuesSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  queuesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  queuesTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE FILAS =====
  queueCard: {
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

  queueCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  queueId: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1, 2),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  queueInfo: {
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
    
    "& strong": {
      color: "#1a202c",
      fontWeight: 700,
    },
  },

  colorDisplay: {
    width: "100%",
    height: "40px",
    margin: theme.spacing(1, 0, 2, 0),
    borderRadius: "12px",
    border: "4px solid #f1f5f9",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    position: "relative",
    transition: "all 0.2s ease",
    
    "&:hover": {
      transform: "scale(1.02)",
      border: "4px solid #3b82f6",
    },

    "&::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      border: "2px solid rgba(255, 255, 255, 0.6)",
    }
  },

  queueActions: {
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

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user, socket } = useContext(AuthContext);
  const companyId = user.companyId;

  // Estatísticas calculadas
  const totalQueues = queues.length;
  const activeQueues = queues.length;
  const totalConfigurations = queues.length * 3;
  const totalOrderings = queues.reduce((acc, queue) => acc + (queue.orderQueue || 0), 0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onQueueEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    };
    socket.on(`company-${companyId}-queue`, onQueueEvent);

    return () => {
      socket.off(`company-${companyId}-queue`, onQueueEvent);
    };
  }, [socket, companyId]);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("Fila eliminada con éxito"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  const renderCardActions = (queue) => {
    return (
      <CardActions className={classes.queueActions}>
        <Tooltip title="Editar cola" placement="top">
          <Button
            onClick={() => handleEditQueue(queue)}
            className={`${classes.actionButton} edit-button`}
            startIcon={<Edit />}
            size="small"
          >
            {isMobile ? '' : 'Editar'}
          </Button>
        </Tooltip>

        <Tooltip title="Eliminar cola" placement="top">
          <Button
            onClick={() => {
              setSelectedQueue(queue);
              setConfirmModalOpen(true);
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
            selectedQueue &&
            `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name}?`
          }
          open={confirmModalOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={() => handleDeleteQueue(selectedQueue.id)}
        >
          {i18n.t("queues.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        
        <QueueModal
          open={queueModalOpen}
          onClose={handleCloseQueueModal}
          queueId={selectedQueue?.id}
          onEdit={(res) => {
            if (res) {
              setTimeout(() => {
                handleEditQueue(res)
              }, 500)
            }
          }}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <QueueIcon />
                {i18n.t("queues.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Configura y organiza tus colas de atención de forma inteligente
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleOpenQueueModal}
                className={classes.addButton}
                startIcon={<AddIcon />}
              >
                {i18n.t("queues.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS COLAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de las colas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de colas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalQueues}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <QueueIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Colas activas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {activeQueues}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <TrendingUpIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Configuraciones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalConfigurations}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <SettingsIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Ordenaciones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalOrderings}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <TimelineIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE FILAS */}
        <Box className={classes.queuesSection}>
          <Box className={classes.queuesHeader}>
            <Typography className={classes.queuesTitle}>
              Lista de colas ({totalQueues})
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando colas...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Por favor espera mientras buscamos tus configuraciones
              </Typography>
            </div>
          ) : queues.length === 0 ? (
            <div className={classes.emptyState}>
              <QueueIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontró ninguna cola
              </Typography>
              <Typography variant="body2">
                Haz clic en "Agregar" para crear tu primera cola de atención
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {queues.map((queue) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={queue.id}>
                    <Card className={classes.queueCard}>
                      <CardContent className={classes.queueCardContent}>
                        <Typography className={classes.queueId}>
                          Cola #{queue.id}
                        </Typography>
                        
                        <div className={classes.queueInfo}>
                          <span>Nombre:</span>
                          <strong>{queue.name || "N/A"}</strong>
                        </div>
                        
                        <div className={classes.queueInfo}>
                          <span>ID:</span>
                          <strong>{queue.id}</strong>
                        </div>
                        
                        <Typography variant="caption" style={{ 
                          color: "#64748b", 
                          fontSize: "11px", 
                          marginBottom: "8px",
                          display: "block"
                        }}>
                          Color de la cola
                        </Typography>
                        
                        <div
                          className={classes.colorDisplay}
                          style={{ backgroundColor: queue.color || "#3b82f6" }}
                        />
                        
                        <div className={classes.queueInfo}>
                          <span>Ordenación:</span>
                          <strong>{queue.orderQueue || "0"}</strong>
                        </div>
                      </CardContent>

                      {renderCardActions(queue)}
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

export default Queues;