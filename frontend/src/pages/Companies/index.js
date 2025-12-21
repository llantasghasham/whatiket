import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

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
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from "@material-ui/icons/Search";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CompanyModal from "../../components/CompaniesModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import usePlans from "../../hooks/usePlans";
import moment from "moment";

import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const reducer = (state, action) => {
    if (action.type === "LOAD_COMPANIES") {
        const companies = action.payload;
        const newCompanies = [];

        companies.forEach((company) => {
            const companyIndex = state.findIndex((u) => u.id === company.id);
            if (companyIndex !== -1) {
                state[companyIndex] = company;
            } else {
                newCompanies.push(company);
            }
        });

        return [...state, ...newCompanies];
    }

    if (action.type === "UPDATE_COMPANIES") {
        const company = action.payload;
        const companyIndex = state.findIndex((u) => u.id === company.id);

        if (companyIndex !== -1) {
            state[companyIndex] = company;
            return [...state];
        } else {
            return [company, ...state];
        }
    }

    if (action.type === "DELETE_COMPANIES") {
        const companyId = action.payload;

        const companyIndex = state.findIndex((u) => u.id === companyId);
        if (companyIndex !== -1) {
            state.splice(companyIndex, 1);
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

    // ===== BOTÃO ADICIONAR =====
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

    // ===== SEÇÃO DE EMPRESAS =====
    companiesSection: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: theme.spacing(3),
        marginBottom: theme.spacing(4),
        border: "1px solid #e2e8f0",
        minHeight: "400px",
    },

    companiesHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(3),
        paddingBottom: theme.spacing(2),
        borderBottom: "1px solid #e2e8f0",
    },

    companiesTitle: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#1a202c",
    },

    // ===== CARDS DE EMPRESAS =====
    companyCard: {
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

        "&.warning": {
            backgroundColor: "#fffbeb",
            borderColor: "#fed7aa",
            
            "&::before": {
                backgroundColor: "#f59e0b",
            }
        },

        "&.overdue": {
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
            
            "&::before": {
                backgroundColor: "#ef4444",
            }
        },
    },

    companyCardContent: {
        padding: theme.spacing(3),
        textAlign: "center",
    },

    companyName: {
        fontSize: "18px",
        fontWeight: 700,
        color: "#1a202c",
        marginBottom: theme.spacing(2),
    },

    companyInfo: {
        fontSize: "13px",
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

    companyIcon: {
        fontSize: "48px",
        marginBottom: theme.spacing(2),
        color: "#3b82f6",
    },

    statusChip: {
        fontWeight: 600,
        fontSize: "12px",
        height: "28px",
        borderRadius: "14px",
        marginBottom: theme.spacing(1),
        
        "&.active": {
            backgroundColor: "#dcfce7",
            color: "#166534",
        },
        
        "&.inactive": {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
        },
    },

    planValue: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#10b981",
        textAlign: "center",
        marginBottom: theme.spacing(1),
    },

    companyActions: {
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

    // ===== RESPONSIVIDADE MOBILE =====
    mobileCard: {
        padding: theme.spacing(2),
    },

    mobileCardContent: {
        padding: theme.spacing(2),
    },

    mobileActionButton: {
        minWidth: '40px',
        padding: theme.spacing(1),
        margin: theme.spacing(0, 0.5),
        borderRadius: "8px",
    },
}));

const Companies = () => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [companyModalOpen, setCompanyModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [companies, dispatch] = useReducer(reducer, []);
    const { dateToClient, datetimeToClient } = useDate();

    const { user, socket } = useContext(AuthContext);

    // Estatísticas calculadas
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === true).length;
    const inactiveCompanies = companies.filter(c => c.status === false).length;
    const totalRevenue = companies.reduce((acc, company) => {
        return acc + (company.plan?.amount || 0);
    }, 0);
    
    const overdueCompanies = companies.filter(company => {
        if (moment(company.dueDate).isValid()) {
            const now = moment();
            const dueDate = moment(company.dueDate);
            const diff = dueDate.diff(now, "days");
            return diff <= 0;
        }
        return false;
    }).length;

    useEffect(() => {
        async function fetchData() {
            if (!user.super) {
                toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
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
            const fetchCompanies = async () => {
                try {
                    const { data } = await api.get("/companiesPlan/", {
                        params: { searchParam, pageNumber },
                    });
                    dispatch({ type: "LOAD_COMPANIES", payload: data.companies });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchCompanies();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    const handleOpenCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        setSelectedCompany(null);
        setCompanyModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setCompanyModalOpen(true);
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await api.delete(`/companies/${companyId}`);
            toast.success(i18n.t("compaies.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingCompany(null);
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

    const renderStatus = (row) => {
        return row.status === false ? "No" : "Sí";
    };

    const renderPlanValue = (row) => {
        return row.planId !== null ? row.plan.amount ? row.plan.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) : '00.00' : "-";
    };

    const getCardClass = (company) => {
        if (moment(company.dueDate).isValid()) {
            const now = moment();
            const dueDate = moment(company.dueDate);
            const diff = dueDate.diff(now, "days");
            if (diff >= 1 && diff <= 5) {
                return "warning";
            }
            if (diff <= 0) {
                return "overdue";
            }
        }
        return "";
    };

    const renderCardActions = (company) => {
        return (
            <CardActions className={classes.companyActions}>
                <Tooltip title="Editar empresa" placement="top">
                    <Button
                        onClick={() => handleEditCompany(company)}
                        className={`${classes.actionButton} edit-button`}
                        startIcon={<EditIcon />}
                        size="small"
                    >
                        {isMobile ? '' : 'Editar'}
                    </Button>
                </Tooltip>

                <Tooltip title="Eliminar empresa" placement="top">
                    <Button
                        onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingCompany(company);
                        }}
                        className={`${classes.actionButton} delete-button`}
                        startIcon={<DeleteOutlineIcon />}
                        size="small"
                    >
                        {isMobile ? '' : 'Eliminar'}
                    </Button>
                </Tooltip>
            </CardActions>
        );
    };

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <ConfirmationModal
                    title={
                        deletingCompany &&
                        `${i18n.t("compaies.confirmationModal.deleteTitle")} ${deletingCompany.name}?`
                    }
                    open={confirmModalOpen}
                    onClose={setConfirmModalOpen}
                    onConfirm={() => handleDeleteCompany(deletingCompany.id)}
                >
                    {i18n.t("compaies.confirmationModal.deleteMessage")}
                </ConfirmationModal>
                
                <CompanyModal
                    open={companyModalOpen}
                    onClose={handleCloseCompanyModal}
                    aria-labelledby="form-dialog-title"
                    companyId={selectedCompany && selectedCompany.id}
                />

                {/* CABEÇALHO */}
                <Box className={classes.header}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography className={classes.headerTitle}>
                                <BusinessIcon />
                                {i18n.t("compaies.title")} ({totalCompanies})
                            </Typography>
                            <Typography className={classes.headerSubtitle}>
                                Administra todas las empresas del sistema y sus planes
                            </Typography>
                        </Box>
                        <Box className={classes.headerActions}>
                            <Button
                                onClick={handleOpenCompanyModal}
                                className={classes.addButton}
                                startIcon={<AddIcon />}
                            >
                                {i18n.t("compaies.buttons.add")}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* SEÇÃO DE BUSCA */}
                <Box className={classes.searchSection}>
                    <Box className={classes.searchHeader}>
                        <Typography className={classes.searchTitle}>
                            <SearchIcon />
                            Buscar empresas
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder={i18n.t("contacts.searchPlaceholder")}
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

                {/* SECCIÓN: ESTADÍSTICAS DE LAS EMPRESAS */}
                <Box className={classes.cardSection}>
                    <Typography className={classes.sectionTitle}>
                        <AssessmentIcon />
                        Estadísticas de empresas
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Total de empresas
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {totalCompanies}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                                        <BusinessIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Empresas activas
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {activeCompanies}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                                        <CheckCircleIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardRed)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Empresas vencidas
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {overdueCompanies}
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
                                            Ingresos totales
                                        </Typography>
                                        <Typography className={classes.cardValue} style={{ fontSize: "24px" }}>
                                            R$ {totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                                        <AttachMoneyIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* SEÇÃO DE EMPRESAS */}
                <Box className={classes.companiesSection}>
                    <Box className={classes.companiesHeader}>
                        <Typography className={classes.companiesTitle}>
                            Lista de empresas ({totalCompanies})
                        </Typography>
                    </Box>

                    {loading ? (
                        <div className={classes.loadingContainer}>
                            <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                            <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                Cargando empresas...
                            </Typography>
                            <Typography variant="body2" style={{ color: "#64748b" }}>
                                Por favor espera mientras buscamos las empresas
                            </Typography>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className={classes.emptyState}>
                            <BusinessIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
                            <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                No se encontró ninguna empresa
                            </Typography>
                            <Typography variant="body2">
                                Haz clic en "Agregar" para registrar la primera empresa
                            </Typography>
                        </div>
                    ) : (
                        <div className={classes.customScrollContainer} onScroll={handleScroll}>
                            <Grid container spacing={3}>
                                {companies.map((company) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                                        <Card className={`${classes.companyCard} ${getCardClass(company)}`}>
                                            <CardContent className={classes.companyCardContent}>
                                                <BusinessIcon className={classes.companyIcon} />
                                                
                                                <Typography className={classes.companyName}>
                                                    {company.name}
                                                </Typography>
                                                
                                                <Box display="flex" justifyContent="center" marginBottom="8px">
                                                    <Chip 
                                                        label={renderStatus(company.status) === 'Sí' ? 'Activa' : 'Inactiva'}
                                                        className={`${classes.statusChip} ${company.status ? 'active' : 'inactive'}`}
                                                        size="small"
                                                        icon={company.status ? <CheckCircleIcon /> : <WarningIcon />}
                                                    />
                                                </Box>
                                                
                                                <Typography className={classes.planValue}>
                                                    R$ {renderPlanValue(company)}
                                                </Typography>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Email:</span>
                                                    <strong>{company.email}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Plan:</span>
                                                    <strong>{company?.plan?.name || 'N/A'}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Creado el:</span>
                                                    <strong>{dateToClient(company.createdAt)}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Vencimiento:</span>
                                                    <strong>{dateToClient(company.dueDate)}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Recurrencia:</span>
                                                    <strong>{company.recurrence || 'N/A'}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Último inicio de sesión:</span>
                                                    <strong>{datetimeToClient(company.lastLogin)}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Archivos:</span>
                                                    <strong>{company.numberFileFolder || 0}</strong>
                                                </div>
                                                
                                                <div className={classes.companyInfo}>
                                                    <span>Carpeta:</span>
                                                    <strong>{company.folderSize || '0 MB'}</strong>
                                                </div>
                                            </CardContent>

                                            {renderCardActions(company)}
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

export default Companies;