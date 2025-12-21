import React, { useState, useEffect, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaidIcon from '@mui/icons-material/Paid';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
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

  // ===== SEÇÃO DE ESTATÍSTICAS =====
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

  // ===== SEÇÃO DE FATURAS =====
  invoicesSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  invoicesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  invoicesTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE FATURAS =====
  invoiceCard: {
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

    "&.overdue": {
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
      
      "&::before": {
        backgroundColor: "#ef4444",
      }
    },

    "&.paid": {
      backgroundColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      
      "&::before": {
        backgroundColor: "#10b981",
      }
    },
  },

  invoiceCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  invoiceDetail: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
  },

  invoiceInfo: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 500,
    padding: theme.spacing(0.5, 1),
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    
    "& strong": {
      color: "#1a202c",
      fontWeight: 700,
    },
  },

  invoiceValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#10b981",
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },

  statusChip: {
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(2),
    
    "&.paid": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.overdue": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    
    "&.open": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
  },

  invoiceActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  actionButton: {
    borderRadius: "12px",
    padding: theme.spacing(1.5),
    minWidth: "120px",
    minHeight: "48px",
    transition: "all 0.2s ease",
    fontWeight: 600,
    
    "&.pay-button": {
      backgroundColor: "#3b82f6",
      color: "white",
      
      "&:hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-2px)",
      }
    },
    
    "&.paid-button": {
      backgroundColor: "#10b981",
      color: "white",
      cursor: "default",
      
      "&:hover": {
        backgroundColor: "#10b981",
        transform: "none",
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

  // ===== RESPONSIVIDADE MOBILE =====
  mobileCard: {
    padding: theme.spacing(2),
  },

  mobileCardContent: {
    padding: theme.spacing(2),
  },

  mobileActionButton: {
    minWidth: '80px',
    padding: theme.spacing(1),
    fontSize: "12px",
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, ] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Estatísticas calculadas
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => {
    const hoje = moment().format("DD/MM/yyyy");
    const vencimento = moment(inv.dueDate).format("DD/MM/yyyy");
    const diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    const dias = moment.duration(diff).asDays();
    return dias < 0 && inv.status !== "paid";
  }).length;
  const openInvoices = totalInvoices - paidInvoices - overdueInvoices;
  
  const totalValue = invoices.reduce((acc, inv) => acc + (inv.value || 0), 0);
  const overdueValue = invoices.filter(inv => {
    const hoje = moment().format("DD/MM/yyyy");
    const vencimento = moment(inv.dueDate).format("DD/MM/yyyy");
    const diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    const dias = moment.duration(diff).asDays();
    return dias < 0 && inv.status !== "paid";
  }).reduce((acc, inv) => acc + (inv.value || 0), 0);

  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });

          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

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

  const getInvoiceStatus = (record) => {
    const hoje = moment().format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    const diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    const dias = moment.duration(diff).asDays();
    const status = record.status;
    
    if (status === "paid") {
      return { label: "Pagado", class: "paid" };
    }
    if (dias < 0) {
      return { label: "Vencido", class: "overdue" };
    } else {
      return { label: "Pendiente", class: "open" };
    }
  };

  const getCardClass = (record) => {
    const status = getInvoiceStatus(record);
    return status.class;
  };

  const renderCardActions = (invoice) => {
    const status = getInvoiceStatus(invoice);
    
    return (
      <CardActions className={classes.invoiceActions}>
        {status.label !== "Pagado" ? (
          <Tooltip title="Haz clic para pagar esta factura" placement="top">
            <Button
              onClick={() => handleOpenContactModal(invoice)}
              className={`${classes.actionButton} pay-button`}
              startIcon={<AttachMoneyIcon />}
              size="small"
            >
              {isMobile ? 'PAGAR' : 'PAGAR FACTURA'}
            </Button>
          </Tooltip>
        ) : (
          <Button
            className={`${classes.actionButton} paid-button`}
            startIcon={<CheckCircleIcon />}
            size="small"
            disabled
          >
            {isMobile ? 'PAGADO' : 'FACTURA PAGADA'}
          </Button>
        )}
      </CardActions>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <SubscriptionModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          aria-labelledby="form-dialog-title"
          Invoice={storagePlans}
          contactId={selectedContactId}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <ReceiptIcon />
                Facturas ({totalInvoices})
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra y consulta tus facturas y pagos
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS FACTURAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Resumen financiero
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de facturas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalInvoices}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <ReceiptIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Facturas pagadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {paidInvoices}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <PaidIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Facturas vencidas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {overdueInvoices}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <WarningIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Valor en atraso
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: "24px" }}>
                      {overdueValue.toLocaleString('es-ES', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUpIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE FATURAS */}
        <Box className={classes.invoicesSection}>
          <Box className={classes.invoicesHeader}>
            <Typography className={classes.invoicesTitle}>
              Lista de facturas ({totalInvoices})
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando facturas...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus facturas
              </Typography>
            </div>
          ) : invoices.length === 0 ? (
            <div className={classes.emptyState}>
              <ReceiptIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontraron facturas
              </Typography>
              <Typography variant="body2">
                Tus facturas aparecerán aquí cuando se generen
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {invoices.map((invoice) => {
                  const status = getInvoiceStatus(invoice);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={invoice.id}>
                      <Card className={`${classes.invoiceCard} ${status.class}`}>
                        <CardContent className={classes.invoiceCardContent}>
                          <Typography className={classes.invoiceDetail}>
                            {invoice.detail}
                          </Typography>
                          
                          <Box display="flex" justifyContent="center" marginBottom="16px">
                            <Chip 
                              label={status.label}
                              className={`${classes.statusChip} ${status.class}`}
                              size="small"
                              icon={
                                status.class === 'paid' ? <CheckCircleIcon /> :
                                status.class === 'overdue' ? <WarningIcon /> :
                                <ReceiptIcon />
                              }
                            />
                          </Box>
                          
                          <Typography className={classes.invoiceValue}>
                            {invoice.value.toLocaleString('es-ES', { style: 'currency', currency: 'BRL' })}
                          </Typography>
                          
                          <div className={classes.invoiceInfo}>
                            <span>Usuarios:</span>
                            <strong>{invoice.users}</strong>
                          </div>
                          
                          <div className={classes.invoiceInfo}>
                            <span>Conexiones:</span>
                            <strong>{invoice.connections}</strong>
                          </div>
                          
                          <div className={classes.invoiceInfo}>
                            <span>Colas:</span>
                            <strong>{invoice.queues}</strong>
                          </div>
                          
                          <div className={classes.invoiceInfo}>
                            <span>Vencimiento:</span>
                            <strong>{moment(invoice.dueDate).format("DD/MM/YYYY")}</strong>
                          </div>
                        </CardContent>

                        {renderCardActions(invoice)}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Invoices;