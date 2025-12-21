import React, { useState, useEffect, useReducer, useContext, useMemo } from "react";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Button,
  Card,
  CardContent,
  Chip
} from "@material-ui/core";
import { 
  Inbox, 
  Search, 
  Refresh,
  TrendingUp,
  Assessment
} from "@material-ui/icons";

import TicketListItem from "../TicketListItemCustom";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  // ===== CONTAINER PRINCIPAL =====
  ticketsListWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },

  // ===== HEADER DA LISTA =====
  listHeader: {
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: theme.spacing(2, 3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
  },

  ticketsCount: {
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "8px",
    minWidth: "24px",
    textAlign: "center",
  },

  refreshButton: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    color: "#64748b",
    transition: "all 0.2s ease",
    
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      color: "#3b82f6",
      transform: "rotate(180deg)",
    },
  },

  // ===== LISTA DE TICKETS =====
  ticketsList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(1),
    
    // Scrollbar customizado
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

  // ===== ESTADOS DE LOADING =====
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    gap: theme.spacing(2),
  },

  loadingIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "$pulse 2s ease-in-out infinite",
  },

  loadingText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  loadingSubtext: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
  },

  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.05)",
      opacity: 0.8,
    },
  },

  // ===== ESTADO VAZIO =====
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    gap: theme.spacing(3),
  },

  emptyIcon: {
    width: "96px",
    height: "96px",
    borderRadius: "20px",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    marginBottom: theme.spacing(1),
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    textAlign: "center",
    marginBottom: theme.spacing(1),
  },

  emptyDescription: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
    maxWidth: "300px",
    lineHeight: 1.5,
  },

  emptyButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: 600,
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    textTransform: "none",
    marginTop: theme.spacing(2),
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  // ===== ESTATÍSTICAS RÁPIDAS =====
  statsContainer: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: theme.spacing(2),
  },

  statItem: {
    textAlign: "center",
    padding: theme.spacing(1),
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#eff6ff",
      transform: "translateY(-1px)",
    },
  },

  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // ===== INDICADOR DE CARREGAMENTO INFINITO =====
  loadMoreContainer: {
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  loadMoreText: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
  },

  // ===== FILTROS ATIVOS =====
  activeFilters: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: theme.spacing(1, 2),
    margin: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },

  filterChip: {
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "11px",
    fontWeight: 600,
    height: "24px",
    
    "& .MuiChip-deleteIcon": {
      color: "rgba(255, 255, 255, 0.7)",
      "&:hover": {
        color: "white",
      }
    },
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    listHeader: {
      padding: theme.spacing(1.5, 2),
      flexDirection: "column",
      alignItems: "flex-start",
      gap: theme.spacing(1),
    },
    
    headerLeft: {
      width: "100%",
      justifyContent: "space-between",
    },
    
    statsGrid: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    
    ticketsList: {
      padding: theme.spacing(0.5),
    },
    
    emptyState: {
      padding: theme.spacing(4, 2),
    },
    
    emptyIcon: {
      width: "64px",
      height: "64px",
      fontSize: "24px",
    },
    
    emptyTitle: {
      fontSize: "18px",
    },
  },
}));

// ===== FUNÇÕES DE ORDENAÇÃO (PERMANECEM IGUAIS) =====
const ticketSortAsc = (a, b) => {
  if (a.updatedAt < b.updatedAt) {
    return -1;
  }
  if (a.updatedAt > b.updatedAt) {
    return 1;
  }
  return 0;
}

const ticketSortDesc = (a, b) => {
  if (a.updatedAt > b.updatedAt) {
    return -1;
  }
  if (a.updatedAt < b.updatedAt) {
    return 1;
  }
  return 0;
}

// ===== REDUCER (PERMANECE IGUAL) =====
const reducer = (state, action) => {
  const sortDir = action.sortDir;
  
  if (action.type === "LOAD_TICKETS") {
    const newTickets = action.payload;

    newTickets.forEach((ticket) => {
      const ticketIndex = state.findIndex((t) => t.id === ticket.id);
      if (ticketIndex !== -1) {
        state[ticketIndex] = ticket;
        if (ticket.unreadMessages > 0) {
          state.unshift(state.splice(ticketIndex, 1)[0]);
        }
      } else {
        state.push(ticket);
      }
    });
    if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
      sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
    }

    return [...state];
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }
    if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
      sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
    }
    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }
    if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
      sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
    }
    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      if (action.status === action.payload.status) {
        state.unshift(ticket);
      }
    }
    if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
      sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
    }
    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }
    if (sortDir && ['ASC', 'DESC'].includes(sortDir)) {
      sortDir === 'ASC' ? state.sort(ticketSortAsc) : state.sort(ticketSortDesc);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const TicketsListCustom = (props) => {
  const {
    setTabOpen,
    status,
    searchParam,
    searchOnMessages,
    tags,
    users,
    showAll,
    selectedQueueIds,
    updateCount,
    style,
    whatsappIds,
    forceSearch,
    statusFilter,
    userFilter,
    sortTickets
  } = props;

  const classes = useStyles();
  const [pageNumber, setPageNumber] = useState(1);
  let [ticketsList, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { profile, queues } = user;
  const showTicketWithoutQueue = user.allTicket === 'enable';
  const companyId = user.companyId;

  // ===== TODAS AS LÓGICAS DE USEEFFECT PERMANECEM IGUAIS =====
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, tags, users, forceSearch, selectedQueueIds, whatsappIds, statusFilter, sortTickets, searchOnMessages]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    searchOnMessages: searchOnMessages ? "true" : "false",
    tags: JSON.stringify(tags),
    users: JSON.stringify(users),
    queueIds: JSON.stringify(selectedQueueIds),
    whatsappIds: JSON.stringify(whatsappIds),
    statusFilter: JSON.stringify(statusFilter),
    userFilter,
    sortTickets
  });

  useEffect(() => {
    if (companyId) {
      dispatch({
        type: "LOAD_TICKETS",
        payload: tickets,
        status,
        sortDir: sortTickets
      });
    }
  }, [tickets]);

  // ===== WEBSOCKET EFFECTS (PERMANECEM IGUAIS) =====
  useEffect(() => {
    const shouldUpdateTicket = ticket => {
      return (!ticket?.userId || ticket?.userId === user?.id || showAll) &&
        ((!ticket?.queueId && showTicketWithoutQueue) || selectedQueueIds.indexOf(ticket?.queueId) > -1)
    }

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

    const onCompanyTicketTicketsList = (data) => {
      if (data.action === "updateUnread") {
        dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
          status: status,
          sortDir: sortTickets
        });
      }
      if (data.action === "update" &&
        shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
          status: status,
          sortDir: sortTickets
        });
      }
      if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
        dispatch({
          type: "DELETE_TICKET", payload: data.ticket?.id, status: status,
          sortDir: sortTickets
        });
      }
      if (data.action === "delete") {
        dispatch({
          type: "DELETE_TICKET", payload: data?.ticketId, status: status,
          sortDir: sortTickets
        });
      }
    };

    const onCompanyAppMessageTicketsList = (data) => {
      if (data.action === "create" &&
        shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
          status: status,
          sortDir: sortTickets
        });
      }
    };

    const onCompanyContactTicketsList = (data) => {
      if (data.action === "update" && data.contact) {
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
          status: status,
          sortDir: sortTickets
        });
      }
    };

    const onConnectTicketsList = () => {
      if (status) {
        socket.emit("joinTickets", status);
      } else {
        socket.emit("joinNotification");
      }
    }

    socket.on("connect", onConnectTicketsList)
    socket.on(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
    socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
    socket.on(`company-${companyId}-contact`, onCompanyContactTicketsList);

    return () => {
      if (status) {
        socket.emit("leaveTickets", status);
      } else {
        socket.emit("leaveNotification");
      }
      socket.off("connect", onConnectTicketsList);
      socket.off(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
      socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
      socket.off(`company-${companyId}-contact`, onCompanyContactTicketsList);
    };
  }, [status, showAll, user, selectedQueueIds, tags, users, profile, queues, sortTickets, showTicketWithoutQueue]);

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
  }, [ticketsList]);

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

  if (status && status !== "search") {
    ticketsList = ticketsList.filter(ticket => ticket.status === status)
  }

  // ===== ESTATÍSTICAS CALCULADAS =====
  const stats = useMemo(() => {
    const totalTickets = ticketsList.length;
    const unreadCount = ticketsList.filter(t => t.unreadMessages > 0).length;
    const assignedCount = ticketsList.filter(t => t.userId).length;
    const pendingCount = ticketsList.filter(t => !t.userId).length;

    return {
      total: totalTickets,
      unread: unreadCount,
      assigned: assignedCount,
      pending: pendingCount
    };
  }, [ticketsList]);

  const getStatusTitle = () => {
    switch (status) {
      case "open": return "Tickets Abiertos";
      case "pending": return "Tickets Pendientes";
      case "closed": return "Tickets Cerrados";
      case "group": return "Grupos";
      case "search": return "Resultados de Búsqueda";
      default: return "Tickets";
    }
  };

  const hasActiveFilters = searchParam || (tags && tags.length > 0) || 
                         (users && users.length > 0) || (whatsappIds && whatsappIds.length > 0);

  return (
    <Paper className={classes.ticketsListWrapper} style={style} elevation={0}>
      {/* HEADER DA LISTA */}
      <div className={classes.listHeader}>
        <div className={classes.headerLeft}>
          <Typography className={classes.headerTitle}>
            {getStatusTitle()}
          </Typography>
          {ticketsList.length > 0 && (
            <div className={classes.ticketsCount}>
              {ticketsList.length}
            </div>
          )}
        </div>
        
        <Button
          className={classes.refreshButton}
          onClick={() => window.location.reload()}
          size="small"
        >
          <Refresh />
        </Button>
      </div>

      {/* FILTROS ATIVOS */}
      {hasActiveFilters && (
        <div className={classes.activeFilters}>
          <Typography style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6" }}>
            Filtros activos:
          </Typography>
          {searchParam && (
            <Chip
              className={classes.filterChip}
              label={`Búsqueda: ${searchParam}`}
              size="small"
              onDelete={() => {}}
            />
          )}
          {tags && tags.length > 0 && (
            <Chip
              className={classes.filterChip}
              label={`Tags: ${tags.length}`}
              size="small"
              onDelete={() => {}}
            />
          )}
          {users && users.length > 0 && (
            <Chip
              className={classes.filterChip}
              label={`Usuarios: ${users.length}`}
              size="small"
              onDelete={() => {}}
            />
          )}
          {whatsappIds && whatsappIds.length > 0 && (
            <Chip
              className={classes.filterChip}
              label={`Conexiones: ${whatsappIds.length}`}
              size="small"
              onDelete={() => {}}
            />
          )}
        </div>
      )}

      {/* LISTA DE TICKETS */}
      <div className={classes.ticketsList} onScroll={handleScroll}>
        {ticketsList.length === 0 && !loading ? (
          <div className={classes.emptyState}>
            <div className={classes.emptyIcon}>
              {hasActiveFilters ? <Search /> : <Inbox />}
            </div>
            <Typography className={classes.emptyTitle}>
              {hasActiveFilters ? "Ningún resultado encontrado" : "No hay tickets"}
            </Typography>
            <Typography className={classes.emptyDescription}>
              {hasActiveFilters 
                ? "Intenta ajustar los filtros de búsqueda para encontrar los tickets deseados."
                : "No hay tickets disponibles en este momento."
              }
            </Typography>
            {hasActiveFilters && (
              <Button
                className={classes.emptyButton}
                onClick={() => window.location.reload()}
                startIcon={<Refresh />}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {ticketsList.map((ticket) => (
              <TicketListItem
                ticket={ticket}
                key={ticket.id}
                setTabOpen={setTabOpen}
              />
            ))}
          </>
        )}

        {/* LOADING SKELETON */}
        {loading && <TicketsListSkeleton />}

        {/* INDICADOR DE CARREGAMENTO INFINITO */}
        {hasMore && !loading && ticketsList.length > 0 && (
          <div className={classes.loadMoreContainer}>
            <CircularProgress size={20} style={{ color: "#3b82f6" }} />
            <Typography className={classes.loadMoreText}>
              Cargando más tickets...
            </Typography>
          </div>
        )}
      </div>
    </Paper>
  );
};

export default TicketsListCustom;