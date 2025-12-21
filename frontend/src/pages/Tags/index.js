import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";

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

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip, Tooltip, Box, Collapse, CircularProgress } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MoreHoriz, Assessment, TrendingUp, Label, People, FilterList, ExpandLess, ExpandMore, Clear } from "@material-ui/icons";
import ContactTagListModal from "../../components/ContactTagListModal";
import AddIcon from '@mui/icons-material/Add';
import clsx from "clsx";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS":
      const tag = action.payload;
      const tagIndex = state.findIndex((s) => s.id === tag.id);

      if (tagIndex !== -1) {
        state[tagIndex] = tag;
        return [...state];
      } else {
        return [tag, ...state];
      }
    case "DELETE_TAGS":
      const tagId = action.payload;
      return state.filter((tag) => tag.id !== tagId);
    case "RESET":
      return [];
    default:
      return state;
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

  // ===== SEÇÃO DE FILTROS =====
  filterSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    cursor: "pointer",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid #e2e8f0",
  },

  filterTitle: {
    fontSize: "20px",
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

  // ===== CAMPOS DE FILTRO =====
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

  secondaryButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  clearButton: {
    backgroundColor: "#64748b",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#475569",
    },
  },

  // ===== SEÇÃO DE TAGS =====
  tagsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  tagsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  tagsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE TAGS =====
  tagCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
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

  tagCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  tagChip: {
    borderRadius: "12px",
    padding: theme.spacing(1, 2),
    fontWeight: 700,
    fontSize: "14px",
    color: "white",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    marginBottom: theme.spacing(2),
    minWidth: "120px",
  },

  tagInfo: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
  },

  tagActions: {
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
    
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },

  viewContactsButton: {
    backgroundColor: "#64748b",
    color: "white",
    borderRadius: "8px",
    padding: theme.spacing(0.5, 1.5),
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "none",
    margin: theme.spacing(1, 0),
    
    "&:hover": {
      backgroundColor: "#475569",
    },
    
    "&:disabled": {
      backgroundColor: "#e2e8f0",
      color: "#94a3b8",
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

  // ===== TOGGLE BUTTON =====
  toggleButton: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    padding: theme.spacing(1),
    borderRadius: "8px",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#f1f5f9",
      color: "#3b82f6",
    },
  },
}));

const Tags = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [selectedTagContacts, setSelectedTagContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTagName, setSelectedTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const pageNumberRef = useRef(1);

  // Estatísticas calculadas
  const totalTags = tags.length;
  const totalContacts = tags.reduce((sum, tag) => sum + (tag?.contacts?.length || 0), 0);
  const tagsWithContacts = tags.filter(tag => tag?.contacts?.length > 0).length;
  const emptyTags = tags.filter(tag => !tag?.contacts?.length).length;

  useEffect(() => {
    const fetchMoreTags = async () => {
      try {
        const { data } = await api.get("/tags/", {
          params: { searchParam, pageNumber, kanban: 0 },
        });
        dispatch({ type: "LOAD_TAGS", payload: data.tags });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreTags();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);

    return () => {
      socket.off(`company${user.companyId}-tag`, onCompanyTags);
    };
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleClearFilters = () => {
    setSearchParam("");
    setPageNumber(1);
    dispatch({ type: "RESET" });
    toast.success("Filtros limpiados con éxito");
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleShowContacts = (contacts, tag) => {
    setSelectedTagContacts(contacts);
    setContactModalOpen(true);
    setSelectedTagName(tag);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedTagContacts([]);
    setSelectedTagName("");
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {contactModalOpen && (
          <ContactTagListModal
            open={contactModalOpen}
            onClose={handleCloseContactModal}
            tag={selectedTagName}
          />
        )}
        <ConfirmationModal
          title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteTag(deletingTag.id)}
        >
          {i18n.t("tags.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <TagModal
          open={tagModalOpen}
          onClose={handleCloseTagModal}
          aria-labelledby="form-dialog-title"
          tagId={selectedTag && selectedTag.id}
          kanban={0}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <Label />
                Gestión de etiquetas
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Organiza y categoriza tus contactos con etiquetas personalizadas
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                className={clsx(classes.modernButton, classes.primaryButton)}
                onClick={handleOpenTagModal}
              >
                Añadir etiqueta
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE FILTROS */}
        <Box className={classes.filterSection}>
          <Box 
            className={classes.filterHeader}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Typography className={classes.filterTitle}>
              <FilterList />
              Filtros y búsqueda
            </Typography>
            <IconButton className={classes.toggleButton}>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={filtersExpanded}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={8}>
                <TextField
                  placeholder="Buscar etiquetas..."
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  variant="outlined"
                  fullWidth
                  size="small"
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
              
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  className={clsx(classes.modernButton, classes.clearButton)}
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                  fullWidth
                >
                  Limpiar filtros
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS ETIQUETAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de etiquetas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de etiquetas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalTags}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <Label />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de contactos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalContacts}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <People />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Etiquetas con contactos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {tagsWithContacts}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Etiquetas vacías
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {emptyTags}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <Label />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE TAGS */}
        <Box className={classes.tagsSection}>
          <Box className={classes.tagsHeader}>
            <Typography className={classes.tagsTitle}>
              Lista de etiquetas
            </Typography>
            {loading && (
              <CircularProgress size={24} style={{ color: "#3b82f6" }} />
            )}
          </Box>

          {loading && tags.length === 0 ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando etiquetas...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus etiquetas
              </Typography>
            </div>
          ) : tags.length === 0 ? (
            <div className={classes.emptyState}>
              <Label style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontraron etiquetas
              </Typography>
              <Typography variant="body2">
                Crea tu primera etiqueta para organizar tus contactos
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {tags.map((tag) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={tag.id}>
                    <Card className={classes.tagCard}>
                      <CardContent className={classes.tagCardContent}>
                        <Chip
                          className={classes.tagChip}
                          style={{
                            backgroundColor: tag.color,
                          }}
                          label={tag.name}
                          size="medium"
                        />
                        
                        <Typography className={classes.tagInfo}>
                          <People fontSize="small" />
                          {tag?.contacts?.length || 0} contacto(s)
                        </Typography>

                        <Button
                          className={classes.viewContactsButton}
                          onClick={() => handleShowContacts(tag?.contacts, tag)}
                          disabled={tag?.contacts?.length === 0}
                          size="small"
                          startIcon={<MoreHoriz />}
                        >
                          Ver contactos
                        </Button>
                      </CardContent>

                      <CardActions className={classes.tagActions}>
                        <Tooltip title="Editar etiqueta" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTag(tag)}
                            className={classes.actionButton}
                            style={{
                              backgroundColor: "#3b82f6",
                              color: "white",
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar etiqueta" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setDeletingTag(tag);
                            }}
                            className={classes.actionButton}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {loading && tags.length > 0 && (
                <Box textAlign="center" mt={3}>
                  <CircularProgress size={30} style={{ color: "#3b82f6" }} />
                  <Typography variant="body2" style={{ color: "#64748b", marginTop: "8px" }}>
                    Cargando más etiquetas...
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Tags;