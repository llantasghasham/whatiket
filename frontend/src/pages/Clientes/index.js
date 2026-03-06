import React, { useReducer, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ReceiptIcon from "@material-ui/icons/Receipt";
import LaunchIcon from "@material-ui/icons/Launch";

import api from "../../services/api";
import ClientModal from "../../components/ClientModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import FaturaModal from "../../components/FaturaModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const STATUS_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Ativo", value: "active" },
  { label: "Inativo", value: "inactive" },
  { label: "Bloqueado", value: "blocked" }
];

const STATUS_LABEL = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado"
};

const STATUS_COLORS = {
  active: "#059669",
  inactive: "#6b7280",
  blocked: "#dc2626"
};

const STATUS_BG = {
  active: "#dcfce7",
  inactive: "#f3f4f6",
  blocked: "#fee2e2"
};

const TYPE_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Pessoa Física", value: "pf" },
  { label: "Pessoa Jurídica", value: "pj" }
];

const TYPE_LABEL = {
  pf: "Pessoa Física",
  pj: "Pessoa Jurídica"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return [];
    case "LOAD_CLIENTS": {
      const incoming = action.payload || [];
      const clone = [...state];
      incoming.forEach((client) => {
        const index = clone.findIndex((item) => item.id === client.id);
        if (index > -1) {
          clone[index] = client;
        } else {
          clone.push(client);
        }
      });
      return clone;
    }
    case "DELETE_CLIENT":
      return state.filter((client) => client.id !== action.payload);
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: "0.875rem",
    color: "#666",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 220,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#1976d2" },
    },
  },
  selectField: {
    minWidth: 140,
    backgroundColor: "#fff",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  addButton: {
    borderRadius: 8,
    padding: "6px 20px",
    textTransform: "none",
    fontWeight: 600,
  },
  content: {
    padding: "0 24px 16px",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tableHead: {
    backgroundColor: "var(--sidebar-color, #1e293b)",
    "& th": {
      color: "#cbd5e1",
      fontWeight: 600,
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "none",
      padding: "14px 16px",
    },
  },
  tableBody: {
    "& td": {
      padding: "12px 16px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
    },
    "& tr:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  itemAvatar: {
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 600,
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  actionBtn: {
    minWidth: "auto",
    padding: "4px 8px",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "none",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    color: "#999",
  },
}));

const Clients = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const sidebarColor = theme.palette.primary.main || "#3b82f6";

  const [clients, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [faturaModalOpen, setFaturaModalOpen] = useState(false);
  const [faturaClient, setFaturaClient] = useState(null);
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  }, [searchParam, statusFilter, typeFilter]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const controller = new AbortController();

    const fetchClients = async () => {
      try {
        const { data } = await api.get("/crm/clients", {
          params: {
            searchParam,
            status: statusFilter,
            type: typeFilter,
            pageNumber
          },
          signal: controller.signal
        });

        if (isMounted) {
          dispatch({ type: "LOAD_CLIENTS", payload: data.clients });
          setHasMore(data.hasMore);
        }
      } catch (err) {
        if (isMounted && err.name !== "CanceledError") {
          toastError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchParam, statusFilter, typeFilter, pageNumber, refreshToken]);

  const handleScroll = (event) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleOpenModal = (clientId = null) => {
    setSelectedClientId(clientId);
    setClientModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedClientId(null);
    setClientModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setRefreshToken((prev) => prev + 1);
  };

  const handleOpenFaturaModal = (client) => {
    setFaturaClient(client);
    setFaturaModalOpen(true);
  };

  const handleCloseFaturaModal = () => {
    setFaturaClient(null);
    setFaturaModalOpen(false);
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      await api.delete(`/crm/clients/${deletingClient.id}`);
      dispatch({ type: "DELETE_CLIENT", payload: deletingClient.id });
    } catch (err) {
      toastError(err);
    } finally {
      setConfirmModalOpen(false);
      setDeletingClient(null);
      setRefreshToken((prev) => prev + 1);
    }
  };

  const getInitials = (name = "") => {
    if (!name.trim()) return "C";
    const pieces = name.trim().split(" ");
    return pieces
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const formatStatus = (status) => STATUS_LABEL[status] || "Ativo";

  const statusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.active;

  const statusBg = (status) => STATUS_BG[status] || STATUS_BG.active;

  const formatType = (type) => TYPE_LABEL[type] || "Pessoa Física";

  const paginatedItems = clients.slice(
    tablePage * rowsPerPage,
    tablePage * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(clients.length / rowsPerPage);

  return (
    <Box className={classes.root} onScroll={handleScroll} style={{ "--sidebar-color": sidebarColor }}>
      <FaturaModal
        open={faturaModalOpen}
        onClose={handleCloseFaturaModal}
        fatura={
          faturaClient
            ? {
                clientId: faturaClient.id,
                client: faturaClient,
                descricao: "",
                valor: ""
              }
            : null
        }
        onSaved={() => {
          handleCloseFaturaModal();
        }}
      />
      <ClientModal
        open={clientModalOpen}
        onClose={handleCloseModal}
        clientId={selectedClientId}
        onSuccess={handleModalSuccess}
      />

      <ConfirmationModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Excluir cliente"
        onConfirm={handleDeleteClient}
      >
        Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box>
            <Typography className={classes.headerTitle}>Clientes</Typography>
            <Typography className={classes.headerSubtitle}>
              {clients.length} cliente(s) cadastrado(s)
            </Typography>
          </Box>
        </Box>

        <Box className={classes.headerRight}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Pesquisar por nome, documento ou email"
            value={searchParam}
            onChange={(event) => setSearchParam(event.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#999" }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            size="small"
            label="Tipo"
            variant="outlined"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className={classes.selectField}
          >
            {TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            variant="outlined"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={classes.selectField}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => handleOpenModal()}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.tableWrapper}>
          <Table size="small">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell style={{ width: 50 }}></TableCell>
                <TableCell>Nome</TableCell>
                <TableCell align="center">E-mail</TableCell>
                <TableCell align="center">Telefone</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
              {loading && clients.length === 0 ? (
                <TableRowSkeleton columns={7} />
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box className={classes.emptyState}>
                      <Typography>Nenhum cliente encontrado</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((client) => (
                  <TableRow
                    key={client.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => history.push(`/clientes/${client.id}`)}
                  >
                    <TableCell>
                      <Avatar
                        className={classes.itemAvatar}
                        style={{ backgroundColor: statusColor(client.status), color: "#fff" }}
                      >
                        {getInitials(client.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 600, color: "#1976d2" }}>
                        {client.name || "Cliente sem nome"}
                      </Typography>
                      <Typography variant="caption" style={{ color: "#999" }}>
                        ID: {client.id} {client.document ? `• ${client.document}` : ""}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{client.email || "—"}</TableCell>
                    <TableCell align="center">{client.phone || "—"}</TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">{formatType(client.type)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={formatStatus(client.status)}
                        className={classes.statusChip}
                        style={{
                          backgroundColor: statusBg(client.status),
                          color: statusColor(client.status),
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" style={{ gap: 4 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(client.id);
                            }}
                            style={{ color: "#1976d2" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Nova fatura">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFaturaModal(client);
                            }}
                            style={{ color: "#f59e0b" }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              history.push(`/clientes/${client.id}`);
                            }}
                            style={{ color: "#6366f1" }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingClient(client);
                              setConfirmModalOpen(true);
                            }}
                            style={{ color: "#ef4444" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {clients.length > 0 && (
            <Box className={classes.paginationBar}>
              <Typography variant="body2" style={{ color: "#666" }}>
                {i18n.t("common.showingResults", { from: tablePage * rowsPerPage + 1, to: Math.min((tablePage + 1) * rowsPerPage, clients.length), total: clients.length })}
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                <Button
                  size="small"
                  disabled={tablePage === 0}
                  onClick={() => setTablePage(tablePage - 1)}
                  className={classes.actionBtn}
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageIdx = i;
                  if (totalPages > 5) {
                    const start = Math.max(0, Math.min(tablePage - 2, totalPages - 5));
                    pageIdx = start + i;
                  }
                  return (
                    <Button
                      key={pageIdx}
                      size="small"
                      variant={pageIdx === tablePage ? "contained" : "text"}
                      color={pageIdx === tablePage ? "primary" : "default"}
                      onClick={() => setTablePage(pageIdx)}
                      style={{
                        minWidth: 32,
                        borderRadius: 6,
                        fontWeight: pageIdx === tablePage ? 700 : 400,
                      }}
                    >
                      {pageIdx + 1}
                    </Button>
                  );
                })}
                <Button
                  size="small"
                  disabled={tablePage >= totalPages - 1}
                  onClick={() => setTablePage(tablePage + 1)}
                  className={classes.actionBtn}
                >
                  Próximo
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Clients;
