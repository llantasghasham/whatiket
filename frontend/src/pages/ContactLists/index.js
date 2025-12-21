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
import { Box, CircularProgress } from "@material-ui/core";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import PeopleIcon from "@material-ui/icons/People";
import DownloadIcon from "@material-ui/icons/GetApp";
import AddIcon from '@mui/icons-material/Add';

import {
  ContactPhone as ContactListIcon,
  Assessment,
  TrendingUp,
  Group,
  ListAlt,
  GetApp,
  Person
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { AuthContext } from "../../context/Auth/AuthContext";
import clsx from "clsx";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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

  cardPurple: {
    "&::before": {
      backgroundColor: "#8b5cf6",
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

  cardIconPurple: {
    backgroundColor: "#8b5cf6",
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

  // ===== CARDS DE LISTAS DE CONTATO =====
  contactListCard: {
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

  contactListCardContent: {
    padding: theme.spacing(3),
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  contactListTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    wordBreak: "break-word",
  },

  contactListInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1, 2),
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  contactListInfoLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#64748b",
  },

  contactListInfoValue: {
    fontSize: "16px",
    color: "#1a202c",
    fontWeight: 700,
  },

  // ===== AÇÕES DOS CARDS =====
  contactListActions: {
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

  downloadButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  contactsButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  editButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#d97706",
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

  // ===== CONTAINER DE LISTAS =====
  contactListsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  contactListsTitle: {
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

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  // Estatísticas calculadas
  const totalLists = contactLists.length;
  const totalContacts = contactLists.reduce((sum, list) => sum + (list.contactsCount || 0), 0);
  const averageContacts = totalLists > 0 ? Math.round(totalContacts / totalLists) : 0;
  const largestList = Math.max(...contactLists.map(list => list.contactsCount || 0), 0);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;

    const onContactListEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    };

    socket.on(`company-${companyId}-ContactList`, onContactListEvent);

    return () => {
      socket.off(`company-${companyId}-ContactList`, onContactListEvent);
    };
  }, []);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingContactList &&
            `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${deletingContactList.name}?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteContactList(deletingContactList.id)}
        >
          {i18n.t("contactLists.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        <ContactListDialog
          open={contactListModalOpen}
          onClose={handleCloseContactListModal}
          aria-labelledby="form-dialog-title"
          contactListId={selectedContactList && selectedContactList.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <ContactListIcon />
                {i18n.t("contactLists.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra tus listas de contactos y organiza tus campañas
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                className={clsx(classes.modernButton, classes.primaryButton)}
                onClick={handleOpenContactListModal}
              >
                {i18n.t("contactLists.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE BUSCA */}
        <Box className={classes.searchSection}>
          <Box className={classes.searchContainer}>
            <TextField
              fullWidth
              placeholder={i18n.t("contacts.searchPlaceholder")}
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

        {/* SECCIÓN: ESTADÍSTICAS DE LAS LISTAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de las listas de contacto
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de listas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalLists}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <ListAlt />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
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
                    <Group />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Promedio por lista
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {averageContacts}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardPurple)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Lista más grande
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {largestList}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconPurple)}>
                    <Person />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE LISTAS DE CONTATO */}
        <Box className={classes.contactListsSection}>
          <Typography className={classes.contactListsTitle}>
            <ContactListIcon />
            Tus listas de contacto
          </Typography>

          <Paper
            className={classes.mainPaper}
            variant="outlined"
            onScroll={handleScroll}
          >
            <Grid container spacing={3}>
              {loading && contactLists.length === 0 ? (
                <Grid item xs={12}>
                  <div className={classes.loadingContainer}>
                    <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                    <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                      Cargando listas de contacto...
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748b" }}>
                      Por favor espera mientras buscamos tus listas
                    </Typography>
                  </div>
                </Grid>
              ) : contactLists.length === 0 ? (
                <Grid item xs={12}>
                  <div className={classes.emptyState}>
                    <ContactListIcon style={{ fontSize: "60px", color: "#cbd5e1", marginBottom: "16px" }} />
                    <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                      No se encontró ninguna lista de contacto
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748b" }}>
                      Crea tu primera lista para comenzar
                    </Typography>
                  </div>
                </Grid>
              ) : (
                contactLists.map((contactList) => (
                  <Grid item xs={12} sm={6} lg={4} key={contactList.id}>
                    <Card className={classes.contactListCard}>
                      <Box className={classes.contactListCardContent}>
                        <Typography className={classes.contactListTitle}>
                          {contactList.name}
                        </Typography>

                        <Box className={classes.contactListInfo}>
                          <Group style={{ color: "#3b82f6", fontSize: "20px" }} />
                          <Typography className={classes.contactListInfoLabel}>
                            Contactos:
                          </Typography>
                          <Typography className={classes.contactListInfoValue}>
                            {contactList.contactsCount || 0}
                          </Typography>
                        </Box>
                      </Box>

                      <CardActions className={classes.contactListActions}>
                        <a href={planilhaExemplo} download="planilha.xlsx">
                          <IconButton
                            className={clsx(classes.actionButton, classes.downloadButton)}
                            size="small"
                            title="Descargar planilla de ejemplo"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </a>

                        <IconButton
                          onClick={() => goToContacts(contactList.id)}
                          className={clsx(classes.actionButton, classes.contactsButton)}
                          size="small"
                          title="Ver contactos"
                        >
                          <PeopleIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => handleEditContactList(contactList)}
                          className={clsx(classes.actionButton, classes.editButton)}
                          size="small"
                          title="Editar lista"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingContactList(contactList);
                          }}
                          className={clsx(classes.actionButton, classes.deleteButton)}
                          size="small"
                          title="Eliminar lista"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}

              {loading && contactLists.length > 0 && (
                <Grid item xs={12}>
                  <div className={classes.loadingContainer}>
                    <CircularProgress size={30} style={{ color: "#3b82f6" }} />
                    <Typography variant="body2" style={{ marginTop: "8px", color: "#64748b" }}>
                      Cargando más listas...
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

export default ContactLists;