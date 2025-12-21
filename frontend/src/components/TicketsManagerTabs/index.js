import React, { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import {
  makeStyles,
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Card,
} from "@material-ui/core";
import {
  Group,
  MoveToInbox as MoveToInboxIcon,
  CheckBox as CheckBoxIcon,
  MessageSharp as MessageSharpIcon,
  AccessTime as ClockIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TextRotateUp,
  TextRotationDown,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { FilterAltOff, FilterAlt, PlaylistAddCheckOutlined } from "@mui/icons-material";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import clsx from "clsx";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";


import { AuthContext } from "../../context/Auth/AuthContext";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import api from "../../services/api";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const useStyles = makeStyles((theme) => ({
  // ===== LAYOUT OPTIMIZADO PARA MÁS ESPACIO =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(1), // Reducido de 2 a 1
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    height: "calc(100vh - 16px)", // Reducido de 32px
    display: "flex",
    flexDirection: "column",
  },

  // ===== CABEÇALHO COMPACTO =====
  header: {
    backgroundColor: "white",
    borderRadius: "12px", // Reducido de 16px
    padding: theme.spacing(1, 2), // Reducido de (2, 3)
    marginBottom: theme.spacing(1), // Reducido de 2
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // Sombra más sutil
    border: "1px solid #e2e8f0",
  },

  headerTitle: {
    fontSize: "18px", // Reducido de 24px
    fontWeight: 600, // Reducido de 700
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75), // Reducido de 1
    
    "& svg": {
      fontSize: "20px", // Ícono más pequeño
    }
  },

  headerSubtitle: {
    display: "none", // Ocultamos el subtítulo para ganar espacio
  },

  // ===== BARRA DE BÚSQUEDA COMPACTA =====
  searchSection: {
    backgroundColor: "white",
    borderRadius: "12px", // Reducido de 16px
    padding: theme.spacing(1), // Reducido de 2
    marginBottom: theme.spacing(1), // Reducido de 2
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1), // Reducido de 2
    backgroundColor: "#f8fafc",
    borderRadius: "10px", // Reducido de 12px
    padding: theme.spacing(0.75, 1.5), // Reducido
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)", // Reducido
    },
  },

  searchIcon: {
    color: "#64748b",
    fontSize: "18px", // Reducido de 20px
  },

  searchInput: {
    flex: 1,
    border: "none",
    backgroundColor: "transparent",
    fontSize: "13px", // Reducido de 14px
    fontWeight: 500,
    color: "#1a202c",
    
    "&::placeholder": {
      color: "#64748b",
    },
  },

  filterToggle: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "8px", // Reducido de 10px
    padding: theme.spacing(0.5), // Reducido de 1
    transition: "all 0.2s ease",
    
    "& svg": {
      fontSize: "18px", // Reducido
    },
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    
    "&.active": {
      backgroundColor: "#10b981",
    },
  },

  // ===== SECCIÓN DE FILTROS COMPACTA =====
  filtersSection: {
    backgroundColor: "white",
    borderRadius: "12px", // Reducido de 16px
    padding: theme.spacing(1.5), // Reducido de 2
    marginBottom: theme.spacing(1), // Reducido de 2
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
  },

  // ===== TOOLBAR DE AÇÕES COMPACTO =====
  actionsToolbar: {
    backgroundColor: "white",
    borderRadius: "12px", // Reducido de 16px
    padding: theme.spacing(1), // Reducido de 2
    marginBottom: theme.spacing(1), // Reducido de 2
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actionButtonsGroup: {
    display: "flex",
    gap: theme.spacing(0.5), // Reducido de 1
    alignItems: "center",
  },

  modernActionButton: {
    width: "40px", // Reducido de 48px
    height: "40px", // Reducido de 48px
    borderRadius: "10px", // Reducido de 12px
    transition: "all 0.2s ease",
    border: "2px solid #e2e8f0",
    backgroundColor: "white",
    position: "relative",
    minWidth: "40px",
    
    "& svg": {
      fontSize: "18px", // Reducido
    },
    
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // Reducido
      borderColor: "#3b82f6",
      
      "& .MuiSvgIcon-root": {
        color: "#3b82f6",
      }
    },
    
    "&.active": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      
      "& .MuiSvgIcon-root": {
        color: "#3b82f6",
      }
    },
  },

  actionIcon: {
    color: "#64748b",
    fontSize: "18px", // Reducido de 20px
    transition: "color 0.2s ease",
  },

  actionBadge: {
    position: "absolute",
    top: "-6px", // Ajustado
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "9px", // Reducido de 10px
    fontWeight: 700,
    padding: "2px 5px", // Reducido
    borderRadius: "5px", // Reducido de 6px
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.2s ease",
  },

  actionButtonHovered: {
    "& $actionBadge": {
      opacity: 1,
    },
  },

  // ===== ÁREA PRINCIPAL DE TICKETS OPTIMIZADA =====
  ticketsWrapper: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "12px", // Reducido de 16px
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // Importante para el scroll
  },

  // ===== ABAS COMPACTAS =====
  tabsContainer: {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: theme.spacing(0.5, 1), // Reducido de (1, 2)
    minHeight: "auto", // Altura automática
  },

  modernTab: {
    minWidth: "auto",
    borderRadius: "8px", // Reducido de 10px
    margin: theme.spacing(0, 0.25), // Reducido
    padding: theme.spacing(0.75, 1.5), // Reducido de (1, 2)
    textTransform: "none",
    fontWeight: 600,
    fontSize: "12px", // Reducido de 13px
    minHeight: "36px", // Altura fija menor
    transition: "all 0.2s ease",
    backgroundColor: "transparent",
    color: "#64748b",
    
    "& svg": {
      fontSize: "14px", // Ícono más pequeño
    },
    
    "&.Mui-selected": {
      backgroundColor: "white",
      color: "#3b82f6",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
    },
  },

  tabIndicator: {
    display: "none",
  },

  // ===== BADGES COMPACTOS =====
  modernBadge: {
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "9px", // Reducido de 10px
    fontWeight: 700,
    minWidth: "16px", // Reducido de 18px
    height: "16px", // Reducido de 18px
    borderRadius: "8px", // Reducido de 9px
    position: "relative",
    top: "-1px", // Ajustado
    marginLeft: theme.spacing(0.5), // Reducido de 1
  },

  // ===== TOGGLE BUTTONS COMPACTOS =====
  modernToggle: {
    width: "40px", // Reducido de 48px
    height: "40px", // Reducido de 48px
    borderRadius: "10px", // Reducido de 12px
    border: "2px solid #e2e8f0",
    backgroundColor: "white",
    transition: "all 0.2s ease",
    
    "& svg": {
      fontSize: "18px", // Reducido
    },
    
    "&:hover": {
      borderColor: "#3b82f6",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    },
    
    "&.Mui-selected": {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#2563eb",
      }
    },
  },

  // ===== DIALOG MODERNO =====
  modernDialog: {
    "& .MuiPaper-root": {
      borderRadius: "16px", // Reducido de 20px
      border: "1px solid #e2e8f0",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)", // Reducido
    }
  },

  dialogHeader: {
    backgroundColor: "#f8fafc",
    padding: theme.spacing(2), // Reducido de 3
    borderBottom: "1px solid #e2e8f0",
    borderRadius: "16px 16px 0 0",
  },

  dialogTitle: {
    fontSize: "18px", // Reducido de 20px
    fontWeight: 700,
    color: "#1a202c",
    textAlign: "center",
  },

  dialogContent: {
    padding: theme.spacing(2), // Reducido de 3
    textAlign: "center",
  },

  dialogActions: {
    padding: theme.spacing(1.5, 2), // Reducido de (2, 3)
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: theme.spacing(1.5), // Reducido de 2
    justifyContent: "center",
  },

  confirmButton: {
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: 600,
    borderRadius: "10px", // Reducido de 12px
    padding: theme.spacing(0.75, 2.5), // Reducido
    textTransform: "none",
    border: "none",
    fontSize: "13px",
    
    "&:hover": {
      backgroundColor: "#059669",
      transform: "translateY(-1px)",
    },
  },

  cancelButton: {
    backgroundColor: "#ef4444",
    color: "white",
    fontWeight: 600,
    borderRadius: "10px", // Reducido de 12px
    padding: theme.spacing(0.75, 2.5), // Reducido
    textTransform: "none",
    border: "none",
    fontSize: "13px",
    
    "&:hover": {
      backgroundColor: "#dc2626",
      transform: "translateY(-1px)",
    },
  },

  // ===== RESPONSIVIDADE MEJORADA =====
  "@media (max-width: 768px)": {
    root: {
      padding: theme.spacing(0.5),
    },
    
    container: {
      padding: 0,
    },
    
    header: {
      borderRadius: "8px",
      padding: theme.spacing(0.75, 1.5),
    },
    
    headerTitle: {
      fontSize: "16px",
      
      "& svg": {
        fontSize: "18px",
      }
    },
    
    actionButtonsGroup: {
      flexWrap: "wrap",
      gap: theme.spacing(0.5),
    },
    
    modernActionButton: {
      width: "36px",
      height: "36px",
      
      "& svg": {
        fontSize: "16px",
      }
    },
    
    searchWrapper: {
      padding: theme.spacing(0.5, 1),
    },
    
    searchInput: {
      fontSize: "12px",
    },
    
    modernTab: {
      fontSize: "11px",
      padding: theme.spacing(0.5, 1),
      minHeight: "32px",
      
      "& svg": {
        fontSize: "12px",
      }
    },
  },

  // ===== ESTILOS ADICIONALES PARA MEJOR SCROLL =====
  ticketsListContainer: {
    flex: 1,
    overflow: "auto",
    minHeight: 0,
    
    // Scroll personalizado
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f5f9",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e1",
      borderRadius: "4px",
      
      "&:hover": {
        backgroundColor: "#94a3b8",
      }
    },
  },
}));

const TicketsManagerTabs = () => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();

  // ===== TODOS OS ESTADOS EXISTENTES PERMANECEM IGUAIS =====
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [sortTickets, setSortTickets] = useState(false);
  const [searchOnMessages, setSearchOnMessages] = useState(false);
  const [filter, setFilter] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Estados para hover dos botões
  const [hoveredButton, setHoveredButton] = useState(null);

  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
  const { tabOpen, setTabOpen } = useContext(TicketsContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);

  // ===== TODAS AS FUNÇÕES EXISTENTES PERMANECEM IGUAIS =====
  useEffect(() => {
    setSelectedQueuesMessage(selectedQueueIds);
  }, [selectedQueueIds]);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN" || user.allUserChat.toUpperCase() === "ENABLED") {
      setShowAllTickets(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
    setForceSearch(!forceSearch);
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
      setTab("open");
      return;
    } else if (tab !== "search") {
      handleFilter();
      setTab("search");
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        selectedQueueIds,
      });
      setSnackbarOpen(false);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    clearTimeout(searchTimeout);
    if (tags.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedTags(tags);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    clearTimeout(searchTimeout);
    if (users.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedUsers(users);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    clearTimeout(searchTimeout);
    if (whatsapp.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedWhatsapp(whatsapp);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);
    clearTimeout(searchTimeout);
    if (statusFilter.length === 0) {
      setForceSearch(!forceSearch);
    } else if (tab !== "search") {
      setTab("search");
    }
    searchTimeout = setTimeout(() => {
      setSelectedStatus(statusFilter);
      setForceSearch(!forceSearch);
    }, 500);
  };

  const handleFilter = () => {
    if (filter) {
      setFilter(false);
      setTab("open");
    } else setFilter(true);
    setTab("search");
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* CABEÇALHO COMPACTO */}
        <Card className={classes.header} elevation={0}>
          <Typography className={classes.headerTitle}>
            <MessageSharpIcon />
            Centro de atención
          </Typography>
        </Card>

        {/* MODAL DE NOVO TICKET */}
        <NewTicketModal
          modalOpen={newTicketModalOpen}
          onClose={(ticket) => {
            handleCloseOrOpenTicket(ticket);
          }}
        />

        {/* BARRA DE BÚSQUEDA COMPACTA */}
        <Card className={classes.searchSection} elevation={0}>
          <div className={classes.searchWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder="Buscar..."
              type="search"
              onChange={handleSearch}
            />
            <Tooltip title="Buscar en mensajes">
              <Switch
                size="small"
                checked={searchOnMessages}
                onChange={(e) => setSearchOnMessages(e.target.checked)}
                color="primary"
              />
            </Tooltip>
            <IconButton
              size="small"
              className={clsx(classes.filterToggle, { active: isFilterActive })}
              onClick={() => {
                setIsFilterActive(!isFilterActive);
                handleFilter();
              }}
            >
              {isFilterActive ? <FilterAlt /> : <FilterAltOff />}
            </IconButton>
          </div>
        </Card>

        {/* SECCIÓN DE FILTROS */}
        {filter && (
          <Card className={classes.filtersSection} elevation={0}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={3}>
                <TagsFilter onFiltered={handleSelectedTags} />
              </Grid>
              <Grid item xs={12} md={3}>
                <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatusFilter onFiltered={handleSelectedStatus} />
              </Grid>
              {profile === "admin" && (
                <Grid item xs={12} md={3}>
                  <UsersFilter onFiltered={handleSelectedUsers} />
                </Grid>
              )}
            </Grid>
          </Card>
        )}

        {/* TOOLBAR DE AÇÕES COMPACTO */}
        <Card className={classes.actionsToolbar} elevation={0}>
          <div className={classes.actionButtonsGroup}>
            {/* Botão Ver Todos */}
            <Can
              role={user.allUserChat === 'enabled' && user.profile === 'user' ? 'admin' : user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <Tooltip title="Ver todos" placement="top">
                  <div
                    className={clsx(classes.actionButtonHovered)}
                    onMouseEnter={() => setHoveredButton("all")}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <IconButton
                      size="small"
                      className={clsx(classes.modernActionButton, {
                        active: showAllTickets
                      })}
                      onClick={() => setShowAllTickets(!showAllTickets)}
                    >
                      {showAllTickets ? (
                        <Visibility className={classes.actionIcon} />
                      ) : (
                        <VisibilityOff className={classes.actionIcon} />
                      )}
                    </IconButton>
                    {hoveredButton === "all" && (
                      <div className={classes.actionBadge}>
                        {showAllTickets ? "Ocultar" : "Ver todos"}
                      </div>
                    )}
                  </div>
                </Tooltip>
              )}
            />

            {/* Botão Nuevo Ticket */}
            <Tooltip title="Nuevo ticket" placement="top">
              <div
                className={classes.actionButtonHovered}
                onMouseEnter={() => setHoveredButton("new")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <IconButton
                  size="small"
                  className={classes.modernActionButton}
                  onClick={() => setNewTicketModalOpen(true)}
                >
                  <AddIcon className={classes.actionIcon} />
                </IconButton>
                {hoveredButton === "new" && (
                  <div className={classes.actionBadge}>Nuevo</div>
                )}
              </div>
            </Tooltip>

            {/* Botão Cerrar Todos */}
            {user.profile === "admin" && (
              <Tooltip title="Cerrar todos" placement="top">
                <div
                  className={classes.actionButtonHovered}
                  onMouseEnter={() => setHoveredButton("close")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <IconButton
                    size="small"
                    className={classes.modernActionButton}
                    onClick={() => setSnackbarOpen(true)}
                  >
                    <PlaylistAddCheckOutlined className={classes.actionIcon} />
                  </IconButton>
                  {hoveredButton === "close" && (
                    <div className={classes.actionBadge}>Cerrar</div>
                  )}
                </div>
              </Tooltip>
            )}

            {/* Botones de Navegación */}
            <Tooltip title="Abiertos" placement="top">
              <div
                className={classes.actionButtonHovered}
                onMouseEnter={() => setHoveredButton("open")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <IconButton
                  size="small"
                  className={clsx(classes.modernActionButton, {
                    active: tab === "open"
                  })}
                  onClick={() => handleChangeTab(null, "open")}
                >
                  <MoveToInboxIcon className={classes.actionIcon} />
                </IconButton>
                {hoveredButton === "open" && (
                  <div className={classes.actionBadge}>Abiertos</div>
                )}
              </div>
            </Tooltip>

            <Tooltip title="Resueltos" placement="top">
              <div
                className={classes.actionButtonHovered}
                onMouseEnter={() => setHoveredButton("closed")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <IconButton
                  size="small"
                  className={clsx(classes.modernActionButton, {
                    active: tab === "closed"
                  })}
                  onClick={() => handleChangeTab(null, "closed")}
                >
                  <CheckBoxIcon className={classes.actionIcon} />
                </IconButton>
                {hoveredButton === "closed" && (
                  <div className={classes.actionBadge}>Resueltos</div>
                )}
              </div>
            </Tooltip>

            {/* Botão de Ordenação */}
            {tab !== "closed" && tab !== "search" && (
              <Tooltip title={sortTickets ? "Descendente" : "Ascendente"} placement="top">
                <ToggleButton
                  size="small"
                  className={classes.modernToggle}
                  value="sort"
                  selected={sortTickets}
                  onChange={() => setSortTickets(!sortTickets)}
                >
                  {sortTickets ? (
                    <TextRotationDown className={classes.actionIcon} />
                  ) : (
                    <TextRotateUp className={classes.actionIcon} />
                  )}
                </ToggleButton>
              </Tooltip>
            )}
          </div>

          {/* Seletor de Filas */}
          <TicketsQueueSelect
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={(values) => setSelectedQueueIds(values)}
          />
        </Card>

        {/* ÁREA PRINCIPAL DE TICKETS */}
        <Paper className={classes.ticketsWrapper} elevation={0}>
          <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
            <div className={classes.tabsContainer}>
              <Tabs
                value={tabOpen}
                onChange={handleChangeTabOpen}
                classes={{
                  indicator: classes.tabIndicator,
                }}
                variant="fullWidth"
              >
                <Tab
                  className={classes.modernTab}
                  label={
                    <Box display="flex" alignItems="center">
                      <MessageSharpIcon />
                      <span>Asignados</span>
                      {openCount > 0 && (
                        <Chip
                          label={openCount}
                          size="small"
                          className={classes.modernBadge}
                        />
                      )}
                    </Box>
                  }
                  value="open"
                />

                <Tab
                  className={classes.modernTab}
                  label={
                    <Box display="flex" alignItems="center">
                      <ClockIcon />
                      <span>Pendientes</span>
                      {pendingCount > 0 && (
                        <Chip
                          label={pendingCount}
                          size="small"
                          className={classes.modernBadge}
                        />
                      )}
                    </Box>
                  }
                  value="pending"
                />

                {user.allowGroup && (
                  <Tab
                    className={classes.modernTab}
                    label={
                      <Box display="flex" alignItems="center">
                        <Group />
                        <span>Grupos</span>
                        {groupingCount > 0 && (
                          <Chip
                            label={groupingCount}
                            size="small"
                            className={classes.modernBadge}
                          />
                        )}
                      </Box>
                    }
                    value="group"
                  />
                )}
              </Tabs>
            </div>

            <div className={classes.ticketsListContainer}>
              <TicketsList
                status="open"
                showAll={showAllTickets}
                sortTickets={sortTickets ? "ASC" : "DESC"}
                selectedQueueIds={selectedQueueIds}
                updateCount={(val) => setOpenCount(val)}
                style={applyPanelStyle("open")}
                setTabOpen={setTabOpen}
              />
              <TicketsList
                status="pending"
                selectedQueueIds={selectedQueueIds}
                sortTickets={sortTickets ? "ASC" : "DESC"}
                showAll={user.profile === "admin" || user.allUserChat === 'enabled' ? showAllTickets : false}
                updateCount={(val) => setPendingCount(val)}
                style={applyPanelStyle("pending")}
                setTabOpen={setTabOpen}
              />
              {user.allowGroup && (
                <TicketsList
                  status="group"
                  showAll={showAllTickets}
                  sortTickets={sortTickets ? "ASC" : "DESC"}
                  selectedQueueIds={selectedQueueIds}
                  updateCount={(val) => setGroupingCount(val)}
                  style={applyPanelStyle("group")}
                  setTabOpen={setTabOpen}
                />
              )}
            </div>
          </TabPanel>

          <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
            <div className={classes.ticketsListContainer}>
              <TicketsList
                status="closed"
                showAll={showAllTickets}
                selectedQueueIds={selectedQueueIds}
                setTabOpen={setTabOpen}
              />
            </div>
          </TabPanel>

          <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
            <div className={classes.ticketsListContainer}>
              {profile === "admin" ? (
                <TicketsList
                  statusFilter={selectedStatus}
                  searchParam={searchParam}
                  showAll={showAllTickets}
                  tags={selectedTags}
                  users={selectedUsers}
                  selectedQueueIds={selectedQueueIds}
                  whatsappIds={selectedWhatsapp}
                  forceSearch={forceSearch}
                  searchOnMessages={searchOnMessages}
                  status="search"
                />
              ) : (
                <TicketsList
                  statusFilter={selectedStatus}
                  searchParam={searchParam}
                  showAll={false}
                  tags={selectedTags}
                  selectedQueueIds={selectedQueueIds}
                  whatsappIds={selectedWhatsapp}
                  forceSearch={forceSearch}
                  searchOnMessages={searchOnMessages}
                  status="search"
                />
              )}
            </div>
          </TabPanel>
        </Paper>

        {/* DIALOG DE CONFIRMAÇÃO COMPACTO */}
        <Dialog
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          className={classes.modernDialog}
          maxWidth="xs"
          fullWidth
        >
          <div className={classes.dialogHeader}>
            <Typography className={classes.dialogTitle}>
              ¿Cerrar todos los tickets?
            </Typography>
          </div>
          <div className={classes.dialogContent}>
            <Typography style={{ fontSize: "14px", color: "#4a5568", marginBottom: "6px" }}>
              Se cerrarán todos los tickets actualmente abiertos.
            </Typography>
            <Typography style={{ fontSize: "12px", color: "#ef4444" }}>
              Esta acción no se puede deshacer.
            </Typography>
          </div>
          <div className={classes.dialogActions}>
            <Button
              className={classes.cancelButton}
              onClick={() => setSnackbarOpen(false)}
              startIcon={<CancelIcon style={{ fontSize: "16px" }} />}
            >
              Cancelar
            </Button>
            <Button
              className={classes.confirmButton}
              onClick={CloseAllTicket}
              startIcon={<CheckIcon style={{ fontSize: "16px" }} />}
            >
              Confirmar
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default TicketsManagerTabs;
