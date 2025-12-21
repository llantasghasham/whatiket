import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import AddIcon from "@mui/icons-material/Add";

// import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";
import WebhookModal from "../../components/WebhookModal";
import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  WebhookOutlined,
} from "@mui/icons-material";

import {
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
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

import FlowBuilderModal from "../../components/FlowBuilderModal";

import {
  colorBackgroundTable,
  colorLineTable,
  colorLineTableHover,
  colorPrimary,
  colorTitleTable,
  colorTopTable,
} from "../../styles/styles";

import GetAppIcon from "@mui/icons-material/GetApp";
import UploadIcon from "@mui/icons-material/Upload";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Input from "@mui/material/Input";
import clsx from "clsx";
import {
  Assessment,
  Timeline,
  TrendingUp,
  Speed,
  DeviceHub,
  PlayArrow,
  Stop,
  GetApp,
  Publish,
  FileCopy
} from "@material-ui/icons";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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

  // ===== CONTENIDO DE LAS TARJETAS =====
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

  // ===== SEÇÃO DE FLOWS =====
  flowsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  flowsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  flowsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE FLOWS =====
  flowCard: {
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

  flowCardContent: {
    padding: theme.spacing(2),
  },

  flowName: {
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

  flowInfo: {
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

  flowActions: {
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
    
    "&.menu-button": {
      backgroundColor: "#3b82f6",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#2563eb",
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

  secondaryButton: {
    backgroundColor: "#64748b",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#475569",
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

  // ===== DIALOG MODERNOS =====
  modernDialog: {
    "& .MuiPaper-root": {
      borderRadius: "20px",
      maxWidth: "600px",
    }
  },

  dialogHeader: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  dialogTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  dialogContent: {
    padding: theme.spacing(3),
  },

  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: theme.spacing(2),
  },

  uploadArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "2px dashed #e2e8f0",
    borderRadius: "12px",
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    cursor: "pointer",
    transition: "all 0.2s ease",
    
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#f8fafc",
    }
  },
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const { user, socket } = useContext(AuthContext);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [navigationConfirmOpen, setNavigationConfirmOpen] = useState(false);
  const [successfulImport, setSuccessfulImport] = useState(false);

  // Estatísticas calculadas
  const totalFlows = webhooks.length;
  const activeFlows = webhooks.filter(flow => flow.active).length;
  const inactiveFlows = webhooks.filter(flow => !flow.active).length;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/flowbuilder");
          setWebhooks(data.flows);
          dispatch({ type: "LOAD_CONTACTS", payload: data.flows });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, reloadData]);

  useEffect(() => {
    const companyId = user.companyId;

    const onContact = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    };

    socket.on(`company-${companyId}-contact`, onContact);

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = () => {
    setSelectedContactId(deletingContact.id);
    setSelectedWebhookName(deletingContact.name);
    setContactModalOpen(true);
  };

  const handleDeleteWebhook = async (webhookId) => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then((res) => {
        setDeletingContact(null);
        setReloadData((old) => !old);
      });
      toast.success("Flujo eliminado con éxito");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      await api
        .post(`/flowbuilder/duplicate`, { flowId: flowId })
        .then((res) => {
          setDeletingContact(null);
          setReloadData((old) => !old);
        });
      toast.success("Flujo duplicado con éxito");
    } catch (err) {
      toastError(err);
    }
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

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportLink = () => {
    history.push(`/flowbuilder/${deletingContact.id}`);
  };

  const handleExportFlow = async (flowId) => {
    try {
      toast.info("Preparando exportación del flujo...");

      const response = await api.get(`/flowbuilder/export/${flowId}`, {
        responseType: "blob",
      });

      if (response.data.size === 0) {
        toast.error("Error: El archivo exportado está vacío");
        return;
      }

      const flowToExport = webhooks.find((wh) => wh.id === flowId);
      const flowName = flowToExport ? flowToExport.name : "flujo";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${flowName.replace(/\s+/g, "_").toLowerCase()}_export.json`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Flujo exportado con éxito");
    } catch (error) {
      console.error("Error al exportar flujo:", error);
      toast.error(
        "Error al exportar flujo: " +
          (error.response?.data?.error || "Error desconocido")
      );
    }
  };

  const handleImportFlow = async () => {
    if (!importFile) {
      toast.error("Selecciona un archivo para importar");
      return;
    }

    if (!importFile.name.toLowerCase().endsWith(".json")) {
      toast.error("El archivo debe ser de tipo JSON");
      return;
    }

    try {
      setImportLoading(true);
      toast.info("Importando flujo, por favor espera...");

      const formData = new FormData();
      formData.append("file", importFile);

      const response = await api.post("/flowbuilder/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Flujo "${response.data.name}" importado con éxito`);
      setImportModalOpen(false);
      setImportFile(null);
      setReloadData((old) => !old);

      setSuccessfulImport(true);
      setNavigationConfirmOpen(true);
    } catch (error) {
      console.error("Error al importar flujo:", error);
      const errorMsg = error.response?.data?.error || "Error desconocido";
      toast.error(`Error al importar flujo: ${errorMsg}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleNavigationConfirm = () => {
    setReloadData((old) => !old);
    setNavigationConfirmOpen(false);
  };

  const filteredWebhooks = webhooks.filter(flow =>
    flow.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <NewTicketModal
          modalOpen={newTicketModalOpen}
          initialContact={contactTicket}
          onClose={(ticket) => {
            handleCloseOrOpenTicket(ticket);
          }}
        />
        <FlowBuilderModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          aria-labelledby="form-dialog-title"
          flowId={selectedContactId}
          nameWebhook={selectedWebhookName}
          onSave={() => setReloadData((old) => !old)}
        />
        <ConfirmationModal
          title={
            deletingContact
              ? `Eliminar ${deletingContact.name}?`
              : `Importar flujo`
          }
          open={confirmOpen}
          onClose={setConfirmOpen}
          onConfirm={(e) =>
            deletingContact ? handleDeleteWebhook(deletingContact.id) : () => {}
          }
        >
          {deletingContact
            ? `¿Seguro que deseas eliminar este flujo? Todas las integraciones relacionadas se perderán.`
            : `Selecciona un archivo para importar`}
        </ConfirmationModal>
        <ConfirmationModal
          title={
            deletingContact
              ? `¿Deseas duplicar el flujo ${deletingContact.name}?`
              : `Duplicar flujo`
          }
          open={confirmDuplicateOpen}
          onClose={setConfirmDuplicateOpen}
          onConfirm={(e) =>
            deletingContact ? handleDuplicateFlow(deletingContact.id) : () => {}
          }
        >
          {deletingContact
            ? `¿Seguro que deseas duplicar este flujo?`
            : `Selecciona un flujo para duplicar`}
        </ConfirmationModal>
        
        <Dialog 
          open={importModalOpen} 
          onClose={() => setImportModalOpen(false)}
          className={classes.modernDialog}
        >
          <DialogTitle className={classes.dialogHeader}>
            <Typography className={classes.dialogTitle}>
              Importar flujo
            </Typography>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography variant="body2" gutterBottom>
              Selecciona un archivo JSON exportado del Constructor de Flujos para importar.
            </Typography>
            <Box className={classes.uploadArea}>
              <Input
                type="file"
                id="flow-import"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              <label htmlFor="flow-import">
                <Publish sx={{ color: "#3b82f6", fontSize: "40px" }} />
                <Typography
                  variant="body1"
                  sx={{ color: "#3b82f6", marginTop: "8px", fontWeight: "600" }}
                >
                  {importFile
                    ? `${importFile.name} (${(importFile.size / 1024).toFixed(
                        2
                      )} KB)`
                    : "Elige un archivo JSON"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", marginTop: "4px" }}
                >
                  {importFile
                    ? "Archivo seleccionado"
                    : "Haz clic para seleccionar el archivo"}
                </Typography>
              </label>
            </Box>
            {importFile && (
              <Typography
                variant="body2"
                sx={{ color: "#10b981", mt: 2, textAlign: "center", fontWeight: "600" }}
              >
                ¡Archivo listo para importar! Haz clic en "Importar" para
                continuar.
              </Typography>
            )}
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button 
              onClick={() => setImportModalOpen(false)}
              className={classes.secondaryButton}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImportFlow}
              disabled={!importFile || importLoading}
              className={classes.primaryButton}
            >
              {importLoading ? <CircularProgress size={24} /> : "Importar"}
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
          open={navigationConfirmOpen}
          onClose={() => setNavigationConfirmOpen(false)}
          className={classes.modernDialog}
        >
          <DialogTitle className={classes.dialogHeader}>
            <Typography className={classes.dialogTitle}>
              Importación completada
            </Typography>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography>
              {successfulImport
                ? "¡Flujo importado con éxito! La lista fue actualizada."
                : "La lista de flujos fue actualizada."}
            </Typography>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button
              onClick={() => setNavigationConfirmOpen(false)}
              className={classes.primaryButton}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <DeviceHub />
                Constructor de Flujos
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Crea y gestiona flujos de conversación automatizados
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <TextField
                placeholder="Buscar flujos..."
                type="search"
                value={searchParam}
                onChange={handleSearch}
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
                onClick={() => setImportModalOpen(true)}
                className={classes.secondaryButton}
                startIcon={<Publish />}
              >
                Importar flujo
              </Button>
              <Button
                onClick={handleOpenContactModal}
                className={classes.primaryButton}
                startIcon={<AddIcon />}
              >
                Agregar flujo
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LOS FLUJOS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de los flujos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de flujos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalFlows}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <DeviceHub />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Flujos activos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {activeFlows}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <PlayArrow />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Flujos inactivos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {inactiveFlows}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <Stop />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE FLUXOS */}
        <Box className={classes.flowsSection}>
          <Box className={classes.flowsHeader}>
            <Typography className={classes.flowsTitle}>
              Lista de flujos
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando flujos...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus flujos
              </Typography>
            </div>
          ) : filteredWebhooks.length === 0 ? (
            <div className={classes.emptyState}>
              <DeviceHub style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                {searchParam ? "No se encontraron flujos" : "No hay flujos creados"}
              </Typography>
              <Typography variant="body2">
                {searchParam 
                  ? "Intenta buscar con otros términos" 
                  : "Haz clic en 'Agregar flujo' para comenzar"
                }
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {filteredWebhooks.map((contact, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={contact.id}>
                    <Grow in={true} timeout={300 + (index * 100)}>
                      <Card className={classes.flowCard}>
                        <CardContent 
                          className={classes.flowCardContent}
                          onClick={() => history.push(`/flowbuilder/${contact.id}`)}
                        >
                          <Typography className={classes.flowName}>
                            <DevicesFold />
                            {contact.name}
                          </Typography>
                          
                          <Box display="flex" justifyContent="center" marginBottom="16px">
                            <Chip 
                              label={contact.active ? "Activo" : "Desactivado"}
                              className={`${classes.statusChip} ${contact.active ? 'active' : 'inactive'}`}
                              size="small"
                            />
                          </Box>
                          
                          <div className={classes.flowInfo}>
                            ID: <strong>#{contact.id}</strong>
                          </div>
                          
                          <div className={classes.flowInfo}>
                            Estado: <strong>{contact.active ? "Activo" : "Desactivado"}</strong>
                          </div>
                        </CardContent>

                        <CardActions className={classes.flowActions}>
                          <Tooltip title="Opciones" placement="top">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClick(e);
                                setDeletingContact(contact);
                              }}
                              className={`${classes.actionButton} menu-button`}
                              size="small"
                            >
                              <MoreVert fontSize="small" />
                            </Button>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </Box>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              hadleEditContact();
            }}
          >
            <EditIcon style={{ marginRight: "8px" }} />
            Editar nombre
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              exportLink();
            }}
          >
            <Build style={{ marginRight: "8px" }} />
            Editar flujo
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              handleExportFlow(deletingContact.id);
            }}
          >
            <GetApp style={{ marginRight: "8px" }} />
            Exportar flujo
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmDuplicateOpen(true);
            }}
          >
            <FileCopy style={{ marginRight: "8px" }} />
            Duplicar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmOpen(true);
            }}
          >
            <DeleteOutlineIcon style={{ marginRight: "8px" }} />
            Eliminar
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default FlowBuilder;