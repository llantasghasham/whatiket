/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import AddIcon from '@mui/icons-material/Add';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import { Box, CircularProgress } from "@material-ui/core";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import {
  SpeakerNotes as CampaignIcon,
  Assessment,
  TrendingUp,
  CheckCircle,
  Schedule,
  Clear,
  WhatsApp,
  ContactMail
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import clsx from "clsx";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
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
    flexWrap: "wrap",
  },

  // ===== SEÇÃO DE BUSCA =====
  searchSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    flexWrap: "wrap",
  },

  // ===== CARDS DE ESTATÍSTICAS =====
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

  // Cores dos cards de estatísticas
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

  // ===== CONTEÚDO DOS CARDS DE ESTATÍSTICAS =====
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

  // ===== CARDS DE CAMPANHAS =====
  campaignCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
    },
  },

  campaignCardContent: {
    padding: theme.spacing(3),
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  campaignTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    textAlign: "center",
    wordBreak: "break-word",
  },

  campaignInfo: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    flex: 1,
  },

  campaignInfoItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(0.5),
  },

  campaignInfoLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#64748b",
    minWidth: "80px",
  },

  campaignInfoValue: {
    fontSize: "14px",
    color: "#1a202c",
    fontWeight: 500,
    flex: 1,
  },

  // ===== STATUS BADGES =====
  statusBadge: {
    padding: theme.spacing(0.5, 1.5),
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statusInactive: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },

  statusScheduled: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },

  statusRunning: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },

  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },

  statusFinished: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
  },

  // ===== AÇÕES DOS CARDS =====
  campaignActions: {
    padding: theme.spacing(2, 3),
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },

  actionButton: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    
    "&:hover": {
      transform: "scale(1.1)",
    },
  },

  reportButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  editButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  // ===== BOTÕES =====
  modernButton: {
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  // ===== CAMPOS DE TEXTO =====
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

  // ===== CONTAINER DE CAMPANHAS =====
  campaignsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  campaignsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
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

  // ===== MAIN PAPER =====
  mainPaper: {
    backgroundColor: "transparent",
    boxShadow: "none",
    border: "none",
    padding: 0,
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { datetimeToClient } = useDate();
  const { getPlanCompany } = usePlans();

  // Estatísticas calculadas
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "EM_ANDAMENTO").length;
  const scheduledCampaigns = campaigns.filter(c => c.status === "PROGRAMADA").length;
  const completedCampaigns = campaigns.filter(c => c.status === "FINALIZADA").length;

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;

    const onCompanyCampaign = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    }

    socket.on(`company-${companyId}-campaign`, onCompanyCampaign);
    return () => {
      socket.off(`company-${companyId}-campaign`, onCompanyCampaign);
    };
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
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

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inactiva";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "En curso";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "INATIVA":
        return classes.statusInactive;
      case "PROGRAMADA":
        return classes.statusScheduled;
      case "EM_ANDAMENTO":
        return classes.statusRunning;
      case "CANCELADA":
        return classes.statusCancelled;
      case "FINALIZADA":
        return classes.statusFinished;
      default:
        return classes.statusInactive;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingCampaign &&
            `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingCampaign.name}?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
        >
          {i18n.t("campaigns.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        
        {campaignModalOpen && (
          <CampaignModal
            resetPagination={() => {
              setPageNumber(1);
              fetchCampaigns();
            }}
            open={campaignModalOpen}
            onClose={handleCloseCampaignModal}
            aria-labelledby="form-dialog-title"
            campaignId={selectedCampaign && selectedCampaign.id}
          />
        )}

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <CampaignIcon />
                {i18n.t("campaigns.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra tus campañas de marketing y comunicación
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                className={clsx(classes.modernButton, classes.primaryButton)}
                onClick={handleOpenCampaignModal}
              >
                {i18n.t("campaigns.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE BUSCA */}
        <Box className={classes.searchSection}>
          <Box className={classes.searchContainer}>
            <TextField
              fullWidth
              placeholder={i18n.t("campaigns.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              className={classes.modernTextField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS CAMPAÑAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de las campañas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de campañas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalCampaigns}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <CampaignIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Campañas activas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {activeCampaigns}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Programadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {scheduledCampaigns}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <Schedule />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Concluidas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {completedCampaigns}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <CheckCircle />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE CAMPANHAS */}
        <Box className={classes.campaignsSection}>
          <Typography className={classes.campaignsTitle}>
            <CampaignIcon />
            Tus campañas
          </Typography>

          <Paper
            className={classes.mainPaper}
            variant="outlined"
            onScroll={handleScroll}
          >
            <Grid container spacing={3}>
              {loading && campaigns.length === 0 ? (
                <Grid item xs={12}>
                  <div className={classes.loadingContainer}>
                    <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                    <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                      Cargando campañas...
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748b" }}>
                      Por favor espera mientras buscamos tus campañas
                    </Typography>
                  </div>
                </Grid>
              ) : campaigns.length === 0 ? (
                <Grid item xs={12}>
                  <div className={classes.emptyState}>
                    <CampaignIcon style={{ fontSize: "60px", color: "#cbd5e1", marginBottom: "16px" }} />
                    <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                      No se encontró ninguna campaña
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748b" }}>
                      Crea tu primera campaña para comenzar
                    </Typography>
                  </div>
                </Grid>
              ) : (
                campaigns.map((campaign) => (
                  <Grid item xs={12} sm={6} lg={4} key={campaign.id}>
                    <Card className={classes.campaignCard}>
                      <Box className={classes.campaignCardContent}>
                        <Typography className={classes.campaignTitle}>
                          {campaign.name}
                        </Typography>

                        <Box className={classes.campaignInfo}>
                          <Box className={classes.campaignInfoItem}>
                            <Typography className={classes.campaignInfoLabel}>
                              Status:
                            </Typography>
                            <span className={clsx(classes.statusBadge, getStatusBadgeClass(campaign.status))}>
                              {formatStatus(campaign.status)}
                            </span>
                          </Box>

                          <Box className={classes.campaignInfoItem}>
                            <ContactMail style={{ color: "#64748b", fontSize: "18px" }} />
                            <Typography className={classes.campaignInfoLabel}>
                              Lista:
                            </Typography>
                            <Typography className={classes.campaignInfoValue}>
                              {campaign.contactListId
                                ? campaign.contactList.name
                                : "No definida"}
                            </Typography>
                          </Box>

                          <Box className={classes.campaignInfoItem}>
                            <WhatsApp style={{ color: "#25D366", fontSize: "18px" }} />
                            <Typography className={classes.campaignInfoLabel}>
                              WhatsApp:
                            </Typography>
                            <Typography className={classes.campaignInfoValue}>
                              {campaign.whatsappId ? campaign.whatsapp.name : "No definido"}
                            </Typography>
                          </Box>

                          <Box className={classes.campaignInfoItem}>
                            <Schedule style={{ color: "#f59e0b", fontSize: "18px" }} />
                            <Typography className={classes.campaignInfoLabel}>
                              Programación:
                            </Typography>
                            <Typography className={classes.campaignInfoValue}>
                              {campaign.scheduledAt
                                ? datetimeToClient(campaign.scheduledAt)
                                : "Sin programación"}
                            </Typography>
                          </Box>

                          <Box className={classes.campaignInfoItem}>
                            <CheckCircle style={{ color: "#10b981", fontSize: "18px" }} />
                            <Typography className={classes.campaignInfoLabel}>
                              Finalización:
                            </Typography>
                            <Typography className={classes.campaignInfoValue}>
                              {campaign.completedAt
                                ? datetimeToClient(campaign.completedAt)
                                : "No finalizada"}
                            </Typography>
                          </Box>

                          <Box className={classes.campaignInfoItem}>
                            <Typography className={classes.campaignInfoLabel}>
                              Confirmación:
                            </Typography>
                            <Typography className={classes.campaignInfoValue}>
                              {campaign.confirmation ? "Habilitada" : "Deshabilitada"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <CardActions className={classes.campaignActions}>
                        <IconButton
                          onClick={() => history.push(`/campaign/${campaign.id}/report`)}
                          className={clsx(classes.actionButton, classes.reportButton)}
                          size="small"
                        >
                          <DescriptionIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleEditCampaign(campaign)}
                          className={clsx(classes.actionButton, classes.editButton)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingCampaign(campaign);
                          }}
                          className={clsx(classes.actionButton, classes.deleteButton)}
                          size="small"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}

              {loading && campaigns.length > 0 && (
                <Grid item xs={12}>
                  <div className={classes.loadingContainer}>
                    <CircularProgress size={30} style={{ color: "#3b82f6" }} />
                    <Typography variant="body2" style={{ marginTop: "8px", color: "#64748b" }}>
                      Cargando más campañas...
                    </Typography>
                  </div>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </div>
    </div>
  );
};

export default Campaigns;