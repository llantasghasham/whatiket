import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Pagination from "@material-ui/lab/Pagination";
import * as XLSX from 'xlsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { 
  CircularProgress, 
  FormControl, 
  FormControlLabel, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Select, 
  Switch, 
  TextField, 
  Tooltip, 
  Typography,
  Collapse,
  Box,
  Chip
} from "@material-ui/core";
import { UsersFilter } from "../../components/UsersFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";
import QueueSelectCustom from "../../components/QueueSelectCustom";
import moment from "moment";
import ShowTicketLogModal from "../../components/ShowTicketLogModal";
import { 
  Forward, 
  History, 
  SaveAlt, 
  Search,
  TrendingUp,
  Assessment,
  Timeline,
  Speed,
  ExpandLess,
  ExpandMore,
  FilterList,
  Clear
} from "@material-ui/icons";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import BarChartIcon from '@mui/icons-material/BarChart';
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
  filterButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  clearButton: {
    backgroundColor: "#64748b",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      backgroundColor: "#475569",
      transform: "translateY(-1px)",
    },
  },

  exportButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: theme.spacing(1, 2),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#059669",
      transform: "translateY(-1px)",
    },
  },

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

  // ===== SEÇÃO DE TICKETS =====
  ticketsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  ticketsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  ticketsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE TICKETS =====
  ticketCard: {
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

  ticketCardContent: {
    padding: theme.spacing(2),
  },

  ticketId: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    textAlign: "center",
    padding: theme.spacing(1, 2),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  ticketInfo: {
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
    
    "&.open": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.closed": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    
    "&.pending": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
  },

  ticketActions: {
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
    
    "&.history-button": {
      backgroundColor: "#3b82f6",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-2px)",
      }
    },
    
    "&.forward-button": {
      backgroundColor: "#10b981",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#059669",
        transform: "translateY(-2px)",
      }
    },
  },

  // ===== PAGINAÇÃO =====
  paginationContainer: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    
    "& .MuiPagination-root": {
      "& .MuiPaginationItem-root": {
        borderRadius: "8px",
        fontWeight: 600,
        margin: "0 2px",
        transition: "all 0.2s ease",
        border: "1px solid #e2e8f0",
        
        "&:hover": {
          backgroundColor: "#3b82f6",
          color: "white",
          border: "1px solid #3b82f6",
        },
        
        "&.Mui-selected": {
          backgroundColor: "#3b82f6",
          color: "white",
          border: "1px solid #3b82f6",
        }
      }
    }
  },

  totalTickets: {
    textAlign: "center",
    marginTop: theme.spacing(2),
    
    "& .MuiTypography-root": {
      color: "#64748b",
      fontWeight: 600,
      fontSize: "14px",
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

  // ===== SWITCH MODERNO =====
  modernSwitch: {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#3b82f6",
      
      "& + .MuiSwitch-track": {
        backgroundColor: "#3b82f6",
      }
    }
  },

  // ===== LAYOUT DOS FILTROS =====
  filterTopRow: {
    marginBottom: theme.spacing(2),
  },

  filterBottomRow: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid #e2e8f0",
  },

  // ===== FILTROS ALINHADOS =====
  modernFilterField: {
    "& .MuiFormControl-root": {
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

    "& .MuiSelect-root": {
      borderRadius: "12px",
    },

    "& .MuiChip-root": {
      borderRadius: "8px",
      backgroundColor: "#f1f5f9",
      color: "#1a202c",
      fontWeight: 500,
    },
  },
}));

const Reports = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getReport } = useDashboard();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const [searchParam, setSearchParam] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  const [queueIds, setQueueIds] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [onlyRated, setOnlyRated] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);

  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Estatísticas calculadas
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'aberto').length;
  const closedTickets = tickets.filter(t => t.status === 'closed' || t.status === 'fechado').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending' || t.status === 'pendente').length;

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const exportarGridParaExcel = async () => {
    setLoading(true);

    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: 1,
        pageSize: 9999999,
        onlyRated: onlyRated ? "true" : "false"
      });

      const ticketsData = data.tickets.map(ticket => {
        const createdAt = new Date(ticket.createdAt);
        const closedAt = new Date(ticket.closedAt);

        const dataFechamento = closedAt.toLocaleDateString('es-ES');
        const horaFechamento = closedAt.toLocaleTimeString('es-ES');
        const dataCriacao = createdAt.toLocaleDateString('es-ES');
        const horaCriacao = createdAt.toLocaleTimeString('es-ES');

        return {
          id: ticket.id,
          Conexión: ticket.whatsappName,
          Contacto: ticket.contactName,
          Usuario: ticket.userName,
          Cola: ticket.queueName,
          Estado: ticket.status,
          UltimoMensaje: ticket.lastMessage,
          FechaApertura: dataCriacao,
          HoraApertura: horaCriacao,
          FechaCierre: ticket.closedAt === null ? "" : dataFechamento,
          HoraCierre: ticket.closedAt === null ? "" : horaFechamento,
          TiempoDeAtencion: ticket.supportTime,
        }
      });

      const ws = XLSX.utils.json_to_sheet(ticketsData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'ReporteDeAtenciones');
      XLSX.writeFile(wb, 'reporte-de-atenciones.xlsx');

      setPageNumber(pageNumber);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Usando a lógica funcional simples do primeiro código
  const handleFilter = async (pageNumber) => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: pageNumber,
        pageSize: pageSize,
        onlyRated: onlyRated ? "true" : "false"
      });

      setTotalTickets(data.totalTickets.total);
      setHasMore(data.tickets.length === pageSize);
      setTickets(data.tickets);
      setPageNumber(pageNumber);
      
      // Após filtrar, colapsa os filtros para dar mais espaço aos resultados
      setFiltersExpanded(false);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSearchParam("");
    setSelectedContactId(null);
    setSelectedWhatsapp([]);
    setSelectedStatus([]);
    setSelectedContact(null);
    setQueueIds([]);
    setUserIds([]);
    setDateFrom(moment("1", "D").format("YYYY-MM-DD"));
    setDateTo(moment().format("YYYY-MM-DD"));
    setOnlyRated(false);
    setTickets([]);
    setTotalTickets(0);
    setPageNumber(1);
    
    toast.success("¡Filtros limpiados!");
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setUserIds(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);
    setSelectedStatus(statusFilter);
  };

  const renderOption = (option) => {
    if (option.number) {
      return <>
        <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
          {option.name} - {option.number}
        </Typography>
      </>
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue && newValue.id) {
      setSelectedContactId(newValue.id);
      setSelectedContact(newValue);
    }
    setSearchParam("");
  };

  const renderOptionLabel = option => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const filter = createFilterOptions({
    trim: true,
  });

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  const renderContactAutocomplete = () => {
    return (
      <Autocomplete
        fullWidth
        options={options}
        loading={loading}
        clearOnBlur
        autoHighlight
        freeSolo
        size="small"
        clearOnEscape
        getOptionLabel={renderOptionLabel}
        renderOption={renderOption}
        filterOptions={createAddContactOption}
        onChange={(e, newValue) => handleSelectOption(e, newValue)}
        value={selectedContact}
        renderInput={params => (
          <TextField
            {...params}
            label="Buscar Contacto"
            variant="outlined"
            size="small"
            className={classes.modernTextField}
            onChange={e => setSearchParam(e.target.value)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress style={{ color: "#3b82f6" }} size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    )
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'aberto':
        return 'open';
      case 'closed':
      case 'fechado':
        return 'closed';
      case 'pending':
      case 'pendente':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'aberto':
        return 'Abierto';
      case 'closed':
      case 'fechado':
        return 'Cerrado';
      case 'pending':
      case 'pendente':
        return 'Pendiente';
      default:
        return status || 'N/A';
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {openTicketMessageDialog && (
          <ShowTicketLogModal
            isOpen={openTicketMessageDialog}
            handleClose={() => setOpenTicketMessageDialog(false)}
            ticketId={ticketOpen.id}
          />
        )}
        
        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <BarChartIcon />
                Informes de Atención
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Análisis completo de tickets y métricas de rendimiento
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={exportarGridParaExcel}
                className={classes.exportButton}
                startIcon={<SaveAlt />}
                disabled={loading || tickets.length === 0}
              >
                Exportar
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
              Filtros de búsqueda
            </Typography>
            <IconButton className={classes.toggleButton}>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={filtersExpanded}>
            {/* LINHA SUPERIOR - Datas, Switch e Botões */}
            <div className={classes.filterTopRow}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha inicial"
                    type="date"
                    value={dateFrom}
                    variant="outlined"
                    fullWidth
                    size="small"
                    className={classes.modernTextField}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha final"
                    type="date"
                    value={dateTo}
                    variant="outlined"
                    fullWidth
                    size="small"
                    className={classes.modernTextField}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={onlyRated}
                          onChange={() => setOnlyRated(!onlyRated)}
                          className={classes.modernSwitch}
                        />
                      }
                      label={
                        <Typography style={{ color: "#64748b", fontWeight: "600", fontSize: "14px" }}>
                          Solo evaluados
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="contained"
                    className={classes.filterButton}
                    onClick={() => handleFilter(1)}
                    startIcon={<Search />}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Filtrando..." : "Filtrar"}
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="contained"
                    className={classes.clearButton}
                    onClick={handleClearFilters}
                    startIcon={<Clear />}
                    disabled={loading}
                    fullWidth
                  >
                    Limpiar filtros
                  </Button>
                </Grid>
              </Grid>
            </div>

            {/* LINHA INFERIOR - Filtros específicos */}
            <div className={classes.filterBottomRow}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.modernFilterField}>
                    <QueueSelectCustom
                      selectedQueueIds={queueIds}
                      onChange={values => setQueueIds(values)}
                    />
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.modernFilterField}>
                    <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.modernFilterField}>
                    <StatusFilter onFiltered={handleSelectedStatus} />
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.modernFilterField}>
                    <UsersFilter onFiltered={handleSelectedUsers} />
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.modernFilterField}>
                    {renderContactAutocomplete()}
                  </div>
                </Grid>
              </Grid>
            </div>
          </Collapse>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LOS INFORMES */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de los informes
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de tickets
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalTickets}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <Assessment />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tickets abiertos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {openTickets}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tickets cerrados
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {closedTickets}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <Timeline />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tickets pendientes
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {pendingTickets}
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

        {/* SECCIÓN DE TICKETS */}
        <Box className={classes.ticketsSection}>
          <Box className={classes.ticketsHeader}>
            <Typography className={classes.ticketsTitle}>
              Lista de tickets
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Procesando informes...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras analizamos tus datos
              </Typography>
            </div>
          ) : tickets.length === 0 ? (
            <div className={classes.emptyState}>
              <Search style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontraron tickets
              </Typography>
              <Typography variant="body2" style={{ marginBottom: "16px", color: "#64748b" }}>
                Ajusta los filtros para encontrar los tickets deseados
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<Clear />}
                style={{ 
                  borderColor: "#3b82f6", 
                  color: "#3b82f6",
                  textTransform: "none",
                  fontWeight: "600",
                  borderRadius: "12px",
                  padding: "8px 24px"
                }}
                disabled={loading}
              >
                Limpiar todos los filtros
              </Button>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {tickets.map((ticket, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={ticket.id}>
                    <Card className={classes.ticketCard}>
                      <CardContent className={classes.ticketCardContent}>
                        <Typography className={classes.ticketId}>
                          Ticket #{ticket.id}
                        </Typography>
                        
                        <div className={classes.ticketInfo}>
                          WhatsApp: <strong>{ticket?.whatsappName || "N/A"}</strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Contacto: <strong>{ticket?.contactName || "N/A"}</strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Usuario: <strong>{ticket?.userName || "N/A"}</strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Cola: <strong>{ticket?.queueName || "N/A"}</strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="8px">
                          <Chip 
                            label={getStatusLabel(ticket?.status)}
                            className={`${classes.statusChip} ${getStatusClass(ticket?.status)}`}
                            size="small"
                          />
                        </Box>
                        
                        <div className={classes.ticketInfo}>
                          Último mensaje: 
                          <strong>
                            {ticket?.lastMessage?.length > 25 
                              ? ticket?.lastMessage?.substring(0, 25) + "..." 
                              : ticket?.lastMessage || "N/A"}
                          </strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Apertura: <strong>{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-ES') : "N/A"}</strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Cierre: <strong>{ticket?.closedAt ? new Date(ticket.closedAt).toLocaleDateString('es-ES') : "Abierto"}</strong>
                        </div>
                        
                        <div className={classes.ticketInfo}>
                          Soporte: <strong>{ticket?.supportTime || "N/A"}</strong>
                        </div>
                      </CardContent>

                      <CardActions className={classes.ticketActions}>
                        <Tooltip title="Registros del ticket" placement="top">
                          <IconButton
                            onClick={() => {
                              setOpenTicketMessageDialog(true);
                              setTicketOpen(ticket);
                            }}
                            className={`${classes.actionButton} history-button`}
                            size="small"
                          >
                            <History fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Acceder al ticket" placement="top">
                          <IconButton
                            onClick={() => {
                              history.push(`/tickets/${ticket.uuid}`);
                            }}
                            className={`${classes.actionButton} forward-button`}
                            size="small"
                          >
                            <Forward fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </Box>

        {/* PAGINAÇÃO */}
        {tickets.length > 0 && (
          <Box className={classes.paginationContainer}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Grid container>
                <Grid item xs={12} sm={10} md={10}>
                  <Pagination
                    count={Math.ceil(totalTickets / pageSize)}
                    page={pageNumber}
                    onChange={(event, value) => handleFilter(value)}
                    color="primary"
                    size="medium"
                    showFirstButton
                    showLastButton
                  />
                </Grid>
                <Grid item xs={12} sm={2} md={2}>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    className={classes.modernTextField}
                  >
                    <InputLabel>
                      {i18n.t("tickets.search.ticketsPerPage")}
                    </InputLabel>
                    <Select
                      labelId="dialog-select-prompt-label"
                      id="dialog-select-prompt"
                      name="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(e.target.value)
                      }}
                      label={i18n.t("tickets.search.ticketsPerPage")}
                      fullWidth
                      MenuProps={{
                        anchorOrigin: {
                          vertical: "center",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "center",
                          horizontal: "left",
                        },
                        getContentAnchorEl: null,
                      }}
                    >
                      <MenuItem value={5} >{"5"}</MenuItem>
                      <MenuItem value={10} >{"10"}</MenuItem>
                      <MenuItem value={20} >{"20"}</MenuItem>
                      <MenuItem value={50} >{"50"}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            
            {totalTickets > 0 && (
              <Box className={classes.totalTickets}>
                <Typography variant="body2">
                  Total de tickets encontrados: <strong>{totalTickets}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </div>
    </div>
  );
};

export default Reports;