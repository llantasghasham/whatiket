import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from '@mui/icons-material/Add';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import {
  Grid,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Tooltip
} from "@material-ui/core";

import api from "../../services/api";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import clsx from "clsx";

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
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

  // ===== SECCIÓN DE BÚSQUEDA =====
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

  // ===== BOTÕES =====
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

  // ===== SECCIÓN DE ANUNCIOS =====
  announcementsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  announcementsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  announcementsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== TARJETAS DE ANUNCIOS =====
  announcementCard: {
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

  announcementCardContent: {
    padding: theme.spacing(3),
  },

  announcementTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    textAlign: "center",
    padding: theme.spacing(1, 2),
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  announcementInfo: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 500,
    padding: theme.spacing(1),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    
    "& strong": {
      color: "#1a202c",
      fontWeight: 700,
    },
  },

  priorityChip: {
    fontWeight: 700,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    
    "&.high": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    
    "&.medium": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    
    "&.low": {
      backgroundColor: "#dcfce7",
      color: "#166534",
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

  announcementActions: {
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
}));

const Announcements = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);

  // Estatísticas calculadas
  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter(a => a.status).length;
  const inactiveAnnouncements = announcements.filter(a => !a.status).length;
  const highPriorityAnnouncements = announcements.filter(a => a.priority === 1).length;

  // trava para nao acessar pagina que não pode  
  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
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
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.companyId) {
      const onCompanyAnnouncement = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
        }
      }

      socket.on(`company-announcement`, onCompanyAnnouncement);
      return () => {
        socket.off(`company-announcement`, onCompanyAnnouncement);
      }
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const handleCloseAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      if (announcement.mediaName)
        await api.delete(`/announcements/${announcement.id}/media-upload`);

      await api.delete(`/announcements/${announcement.id}`);

      toast.success("Anuncio eliminado exitosamente");
    } catch (err) {
      toastError(err);
    }
    setDeletingAnnouncement(null);
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

  const translatePriority = (val) => {
    if (val === 1) {
      return "Alta";
    }
    if (val === 2) {
      return "Média";
    }
    if (val === 3) {
      return "Baixa";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 1:
        return 'high';
      case 2:
        return 'medium';
      case 3:
        return 'low';
      default:
        return 'medium';
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingAnnouncement &&
            `¿Eliminar anuncio ${deletingAnnouncement.title}?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteAnnouncement(deletingAnnouncement)}
        >
          ¿Está seguro que desea eliminar este anuncio? Esta acción no se puede deshacer.
        </ConfirmationModal>
        <AnnouncementModal
          resetPagination={() => {
            setPageNumber(1);
            fetchAnnouncements();
          }}
          open={announcementModalOpen}
          onClose={handleCloseAnnouncementModal}
          aria-labelledby="form-dialog-title"
          announcementId={selectedAnnouncement && selectedAnnouncement.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <AnnouncementIcon />
                Anuncios
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Gestione y organice sus anuncios y comunicaciones
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleOpenAnnouncementModal}
                className={classes.addButton}
                startIcon={<AddIcon />}
              >
                Agregar Anuncio
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN DE BÚSQUEDA */}
        <Box className={classes.searchSection}>
          <Box className={classes.searchHeader}>
            <Typography className={classes.searchTitle}>
              <SearchIcon />
              Buscar Anuncios
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar anuncios..."
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

        {/* SECCIÓN: ESTADÍSTICAS DE ANUNCIOS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de Anuncios
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de Anuncios
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalAnnouncements}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <AnnouncementIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Anuncios Activos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {activeAnnouncements}
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
                      Anuncios Inactivos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {inactiveAnnouncements}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <ExpandMoreIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Alta Prioridade
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {highPriorityAnnouncements}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <PriorityHighIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN DE ANUNCIOS */}
        <Box className={classes.announcementsSection}>
          <Box className={classes.announcementsHeader}>
            <Typography className={classes.announcementsTitle}>
              Lista de Anuncios
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando anuncios...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espere mientras buscamos sus anuncios
              </Typography>
            </div>
          ) : announcements.length === 0 ? (
            <div className={classes.emptyState}>
              <AnnouncementIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Ningún anuncio encontrado
              </Typography>
              <Typography variant="body2">
                Cree su primer anuncio o ajuste los filtros de búsqueda
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {announcements.map((announcement) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={announcement.id}>
                    <Card className={classes.announcementCard}>
                      <CardContent className={classes.announcementCardContent}>
                        <Typography className={classes.announcementTitle}>
                          {announcement.title}
                        </Typography>
                        
                        <Box display="flex" justifyContent="center" marginBottom="12px">
                          <Chip 
                            label={translatePriority(announcement.priority)}
                            className={`${classes.priorityChip} ${getPriorityClass(announcement.priority)}`}
                            size="small"
                          />
                        </Box>

                        <div className={classes.announcementInfo}>
                          <span>Mídia:</span>
                          <strong>
                            {announcement.mediaName || "Sin archivo adjunto"}
                          </strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="8px">
                          <Chip 
                            label={announcement.status ? "Activo" : "Inactivo"}
                            className={`${classes.statusChip} ${announcement.status ? 'active' : 'inactive'}`}
                            size="small"
                          />
                        </Box>
                      </CardContent>

                      <CardActions className={classes.announcementActions}>
                        <Tooltip title="Editar Anuncio" placement="top">
                          <Button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className={`${classes.actionButton} edit-button`}
                            startIcon={<EditIcon />}
                            size="small"
                          >
                            Editar
                          </Button>
                        </Tooltip>

                        <Tooltip title="Eliminar Anuncio" placement="top">
                          <Button
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setDeletingAnnouncement(announcement);
                            }}
                            className={`${classes.actionButton} delete-button`}
                            startIcon={<DeleteOutlineIcon />}
                            size="small"
                          >
                            Eliminar
                          </Button>
                        </Tooltip>
                      </CardActions>
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

export default Announcements;