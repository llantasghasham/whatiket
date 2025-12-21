/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import TimerOffIcon from "@material-ui/icons/TimerOff";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
// Removed i18n import - using direct Spanish text
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AddCircle, Build, DevicesFold, TextFields } from "@mui/icons-material";
import { 
  CircularProgress, 
  Grid, 
  Stack, 
  Box, 
  Typography, 
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  Grow,
  Fade
} from "@mui/material";
import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import CampaignModalPhrase from "../../components/CampaignModalPhrase";
import { colorBackgroundTable, colorLineTable, colorLineTableHover, colorTopTable } from "../../styles/styles";
import clsx from "clsx";
import {
  Announcement,
  Speed,
  Assessment,
  Timeline,
  TrendingUp
} from "@material-ui/icons";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach(campaign => {
        const campaignIndex = state.findIndex(u => u.id === campaign.id);
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
    const campaignIndex = state.findIndex(u => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex(u => u.id === campaignId);
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

  mainCard: {
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

  // ===== SECCIÓN DE CAMPAÑAS =====
  campaignsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  campaignsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  campaignsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE CAMPANHAS =====
  campaignCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
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
      backgroundColor: "#3b82f6",
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

  campaignCardContent: {
    padding: theme.spacing(2),
  },

  campaignName: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    textAlign: "center",
    padding: theme.spacing(1, 2),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
  },

  campaignInfo: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "flex-start",
    fontWeight: 500,
    
    "& strong": {
      color: "#1a202c",
      fontWeight: 700,
      marginLeft: theme.spacing(0.5),
      wordBreak: "break-word",
    },
  },

  statusChip: {
    fontWeight: 700,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    
    "&.active": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.inactive": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
  },

  campaignActions: {
    padding: theme.spacing(1, 2),
    justifyContent: "center",
    gap: theme.spacing(1),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  actionButton: {
    borderRadius: "8px",
    padding: theme.spacing(1),
    minWidth: "40px",
    minHeight: "40px",
    transition: "all 0.2s ease",
    
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

  // ===== BOTÕES =====
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  searchField: {
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
}));

const CampaignsPhrase = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  const [campaignflows, setCampaignFlows] = useState([]);
  const [ModalOpenPhrase, setModalOpenPhrase] = useState(false);
  const [campaignflowSelected, setCampaignFlowSelected] = useState();

  // Estadísticas calculadas
  const totalCampaigns = campaignflows.length;
  const activeCampaigns = campaignflows.filter(campaign => campaign.status).length;
  const inactiveCampaigns = campaignflows.filter(campaign => !campaign.status).length;

  const handleDeleteCampaign = async campaignId => {
    try {
      await api.delete(`/flowcampaign/${campaignId}`);
      toast.success("Frase eliminada");
      getCampaigns()
    } catch (err) {
      toastError(err);
    }
  };

  const getCampaigns = async() => {
    setLoading(true);
    await api.get("/flowcampaign").then(res => {
      setCampaignFlows(res.data.flow);
      setLoading(false);
    });
  };

  const onSaveModal = () => {
    getCampaigns()
  }

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const filteredCampaigns = campaignflows.filter(flow =>
    flow.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingCampaign &&
            `¿Eliminar campaña ${
              deletingCampaign.name
            }?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteCampaign(deletingContact.id)}
        >
          ¿Está seguro de que desea eliminar esta campaña? Esta acción no se puede deshacer.
        </ConfirmationModal>
        
        <CampaignModalPhrase
          open={ModalOpenPhrase}
          onClose={() => setModalOpenPhrase(false)}
          FlowCampaignId={campaignflowSelected}
          onSave={onSaveModal}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <Announcement />
                Campañas
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Gestiona y monitorea tus campañas de marketing
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <TextField
                placeholder="Buscar campañas..."
                type="search"
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                size="small"
                className={classes.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                onClick={() => {
                  setCampaignFlowSelected();
                  setModalOpenPhrase(true);
                }}
                className={classes.primaryButton}
                startIcon={<AddCircle />}
              >
                Nueva campaña
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS CAMPAÑAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de las campañas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
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
                    <Announcement />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
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

            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Campañas inactivas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {inactiveCampaigns}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <Speed />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN DE CAMPAÑAS */}
        <Box className={classes.campaignsSection}>
          <Box className={classes.campaignsHeader}>
            <Typography className={classes.campaignsTitle}>
              Lista de campañas
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando campañas...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus campañas
              </Typography>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className={classes.emptyState}>
              <Announcement style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                {searchParam ? "No se encontró ninguna campaña" : "Ninguna campaña creada"}
              </Typography>
              <Typography variant="body2">
                {searchParam 
                  ? "Intenta buscar con otros términos" 
                  : "Haz clic en 'Nueva campaña' para comenzar"
                }
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {filteredCampaigns.map((flow, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={flow.id}>
                    <Grow in={true} timeout={300 + (index * 100)}>
                      <Card className={classes.campaignCard}>
                        <CardContent className={classes.campaignCardContent}>
                          <Typography className={classes.campaignName}>
                            <TextFields />
                            {flow.name}
                          </Typography>
                          
                          <Box display="flex" justifyContent="center" marginBottom="16px">
                            <Chip 
                              label={flow.status ? "Activa" : "Desactivada"}
                              className={`${classes.statusChip} ${flow.status ? 'active' : 'inactive'}`}
                              size="small"
                            />
                          </Box>
                          
                          <div className={classes.campaignInfo}>
                            ID: <strong>#{flow.id}</strong>
                          </div>
                          
                          <div className={classes.campaignInfo}>
                            Estado: <strong>{flow.status ? "Activa" : "Desactivada"}</strong>
                          </div>
                        </CardContent>

                        <CardActions className={classes.campaignActions}>
                          <Tooltip title="Editar campaña" placement="top">
                            <IconButton
                              onClick={() => {
                                setCampaignFlowSelected(flow.id);
                                setModalOpenPhrase(true);
                              }}
                              className={`${classes.actionButton} edit-button`}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Can
                            role={user.profile}
                            perform="contacts-page:deleteContact"
                            yes={() => (
                              <Tooltip title="Eliminar campaña" placement="top">
                                <IconButton
                                  onClick={e => {
                                    setConfirmModalOpen(true);
                                    setDeletingContact(flow);
                                    setDeletingCampaign(flow);
                                  }}
                                  className={`${classes.actionButton} delete-button`}
                                  size="small"
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          />
                        </CardActions>
                      </Card>
                    </Grow>
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

export default CampaignsPhrase;