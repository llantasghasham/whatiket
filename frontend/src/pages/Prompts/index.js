import React, { useContext, useEffect, useReducer, useState } from "react";
import openSocket from "socket.io-client";
import {
  Button,
  IconButton,
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
  CircularProgress,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import PromptModal from "../../components/PromptModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TokenIcon from '@mui/icons-material/Token';
import QueueIcon from '@mui/icons-material/Queue';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
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

  // ===== SEÇÃO DE PROMPTS =====
  promptsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  promptsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  promptsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE PROMPTS =====
  promptCard: {
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

  promptCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  promptName: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },

  promptInfo: {
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

  queueChip: {
    backgroundColor: "#e0f2fe",
    color: "#0277bd",
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
  },

  tokenChip: {
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
  },

  promptActions: {
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
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user, socket } = useContext(AuthContext);

  const { getPlanCompany } = usePlans();
  const history = useHistory();
  const companyId = user.companyId;

  // Estatísticas calculadas
  const totalPrompts = prompts.length;
  const totalTokens = prompts.reduce((acc, prompt) => acc + (prompt.maxTokens || 0), 0);
  const averageTokens = totalPrompts > 0 ? Math.round(totalTokens / totalPrompts) : 0;
  const uniqueQueues = new Set(prompts.map(p => p.queue?.name)).size;

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
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
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onPromptEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
        reloadPage();
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
        reloadPage();
      }
    };

    socket.on(`company-${companyId}-prompt`, onPromptEvent);
    return () => {
      socket.off(`company-${companyId}-prompt`, onPromptEvent);
    };
  }, [socket]);

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
    reloadPage();
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t(data.message));
      reloadPage();
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
  };

  const renderCardActions = (prompt) => {
    return (
      <CardActions className={classes.promptActions}>
        <Tooltip title="Editar prompt" placement="top">
          <Button
            onClick={() => handleEditPrompt(prompt)}
            className={`${classes.actionButton} edit-button`}
            startIcon={<Edit />}
            size="small"
          >
            {isMobile ? '' : 'Editar'}
          </Button>
        </Tooltip>

        <Tooltip title="Eliminar prompt" placement="top">
          <Button
            onClick={() => {
              setSelectedPrompt(prompt);
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
            selectedPrompt &&
            `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
          }
          open={confirmModalOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
        >
          {i18n.t("prompts.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        
        <PromptModal
          open={promptModalOpen}
          onClose={handleClosePromptModal}
          promptId={selectedPrompt?.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <SmartToyIcon />
                {i18n.t("prompts.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Configura y gestiona prompts de IA para una automatización inteligente
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleOpenPromptModal}
                className={classes.addButton}
                startIcon={<AddIcon />}
              >
                {i18n.t("prompts.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LOS PROMPTS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de los prompts
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de prompts
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalPrompts}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <SmartToyIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tokens totales
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalTokens}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <TokenIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Promedio de tokens
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {averageTokens}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUpIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Colas únicas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {uniqueQueues}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <QueueIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE PROMPTS */}
        <Box className={classes.promptsSection}>
          <Box className={classes.promptsHeader}>
            <Typography className={classes.promptsTitle}>
              Lista de prompts ({totalPrompts})
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando prompts...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus prompts de IA
              </Typography>
            </div>
          ) : prompts.length === 0 ? (
            <div className={classes.emptyState}>
              <SmartToyIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontró ningún prompt
              </Typography>
              <Typography variant="body2">
                Haz clic en "Agregar" para crear tu primer prompt de IA
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {prompts.map((prompt) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={prompt.id}>
                    <Card className={classes.promptCard}>
                      <CardContent className={classes.promptCardContent}>
                        <Typography className={classes.promptName}>
                          {prompt.name}
                        </Typography>
                        
                        <div className={classes.promptInfo}>
                          <span>ID:</span>
                          <strong>{prompt.id}</strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="8px">
                          <Chip 
                            label={`Fila: ${prompt.queue?.name || "N/A"}`}
                            className={classes.queueChip}
                            size="small"
                            icon={<QueueIcon />}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="center" marginBottom="16px">
                          <Chip 
                            label={`${prompt.maxTokens || 0} tokens`}
                            className={classes.tokenChip}
                            size="small"
                            icon={<TokenIcon />}
                          />
                        </Box>
                        
                        <div className={classes.promptInfo}>
                          <span>Tokens máx:</span>
                          <strong>{prompt.maxTokens || "N/A"}</strong>
                        </div>
                      </CardContent>

                      {renderCardActions(prompt)}
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

export default Prompts;