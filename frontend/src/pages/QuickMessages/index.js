import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
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
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import AddIcon from '@mui/icons-material/Add';
import MessageIcon from '@material-ui/icons/Message';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
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

  // ===== SEÇÃO PRINCIPAL =====
  mainSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
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

  // ===== CARDS DE MENSAGENS =====
  messageCard: {
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

  cardHeader: {
    padding: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    
    "& .MuiCardHeader-title": {
      fontSize: "16px",
      fontWeight: 700,
      color: "#1a202c",
      textAlign: "center",
    },
    
    "& .MuiCardHeader-subheader": {
      fontSize: "14px",
      color: "#64748b",
      textAlign: "center",
      fontWeight: 500,
    },
  },

  cardContent: {
    padding: theme.spacing(2),
    minHeight: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardActions: {
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

  // ===== RESPONSIVIDADE =====
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
  "@media (max-width: 768px)": {
    root: {
      padding: theme.spacing(2),
    },
    
    header: {
      padding: theme.spacing(3),
    },
    
    headerTitle: {
      fontSize: "24px",
    },
    
    mainSection: {
      padding: theme.spacing(2.5),
    },
  },
}));

const Quickemessages = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickemessage, setSelectedQuickemessage] = useState(null);
  const [deletingQuickemessage, setDeletingQuickemessage] = useState(null);
  const [quickemessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickemessages, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { profile } = user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickemessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;

    const onQuickMessageEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    };
    socket.on(`company-${companyId}-quickemessage`, onQuickMessageEvent);

    return () => {
      socket.off(`company-${companyId}-quickemessage`, onQuickMessageEvent);
    };
  }, [socket]);

  const fetchQuickemessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickemessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickemessage = (quickemessage) => {
    setSelectedQuickemessage(quickemessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickemessage = async (quickemessageId) => {
    try {
      await api.delete(`/quick-messages/${quickemessageId}`);
      toast.success(i18n.t("Resposta Rápida Deletada com Sucesso"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickemessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickemessages();
    dispatch({ type: "RESET" });
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

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={deletingQuickemessage && `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickemessage.shortcode}?`}
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteQuickemessage(deletingQuickemessage.id)}
        >
          {i18n.t("quickMessages.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        
        <QuickMessageDialog
          resetPagination={() => {
            setPageNumber(1);
            fetchQuickemessages();
          }}
          open={quickemessageModalOpen}
          onClose={handleCloseQuickMessageDialog}
          aria-labelledby="form-dialog-title"
          quickemessageId={selectedQuickemessage && selectedQuickemessage.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <QuestionAnswerIcon />
                {i18n.t("quickMessages.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra tus respuestas rápidas de forma eficiente
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE BUSCA */}
        <Box className={classes.searchSection}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder={i18n.t("quickMessages.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                className={classes.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#3b82f6" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                className={classes.addButton}
                startIcon={<AddIcon />}
                onClick={handleOpenQuickMessageDialog}
              >
                {i18n.t("quickMessages.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO PRINCIPAL */}
        <Box className={classes.mainSection}>
          <Typography className={classes.sectionTitle}>
            <MessageIcon />
            Respuestas rápidas
          </Typography>

          {loading && quickemessages.length === 0 ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando mensajes...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus respuestas rápidas
              </Typography>
            </div>
          ) : quickemessages.length === 0 ? (
            <div className={classes.emptyState}>
              <QuestionAnswerIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontraron mensajes
              </Typography>
              <Typography variant="body2">
                Crea tu primera respuesta rápida para agilizar la atención
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {quickemessages.map((quickemessage) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={quickemessage.id}>
                    <Card className={classes.messageCard}>
                      <CardHeader
                        title={quickemessage.shortcode}
                        subheader={
                          quickemessage.mediaName ??
                          i18n.t("quickMessages.noAttachment")
                        }
                        className={classes.cardHeader}
                      />
                      
                      <CardContent className={classes.cardContent}>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            color: "#64748b", 
                            textAlign: "center",
                            fontSize: "13px"
                          }}
                        >
                          {quickemessage.message?.length > 50 
                            ? quickemessage.message.substring(0, 50) + "..." 
                            : quickemessage.message || "Mensaje no definido"}
                        </Typography>
                      </CardContent>

                      <CardActions className={classes.cardActions}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuickemessage(quickemessage)}
                          className={`${classes.actionButton} edit-button`}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingQuickemessage(quickemessage);
                          }}
                          className={`${classes.actionButton} delete-button`}
                          title="Eliminar"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                
                {loading && quickemessages.length > 0 && (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={40} style={{ color: "#3b82f6" }} />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Quickemessages;