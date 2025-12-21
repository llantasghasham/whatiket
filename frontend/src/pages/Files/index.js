import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
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
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from '@mui/icons-material/Save';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const reducer = (state, action) => {
    if (action.type === "LOAD_FILES") {
        const files = action.payload;
        const newFiles = [];

        files.forEach((fileList) => {
            const fileListIndex = state.findIndex((s) => s.id === fileList.id);
            if (fileListIndex !== -1) {
                state[fileListIndex] = fileList;
            } else {
                newFiles.push(fileList);
            }
        });

        return [...state, ...newFiles];
    }

    if (action.type === "UPDATE_FILES") {
        const fileList = action.payload;
        const fileListIndex = state.findIndex((s) => s.id === fileList.id);

        if (fileListIndex !== -1) {
            state[fileListIndex] = fileList;
            return [...state];
        } else {
            return [fileList, ...state];
        }
    }

    if (action.type === "DELETE_FILE") {
        const fileListId = action.payload;

        const fileListIndex = state.findIndex((s) => s.id === fileListId);
        if (fileListIndex !== -1) {
            state.splice(fileListIndex, 1);
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

    // ===== SEÇÃO DE ARQUIVOS =====
    filesSection: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: theme.spacing(3),
        marginBottom: theme.spacing(4),
        border: "1px solid #e2e8f0",
        minHeight: "400px",
    },

    filesHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(3),
        paddingBottom: theme.spacing(2),
        borderBottom: "1px solid #e2e8f0",
    },

    filesTitle: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#1a202c",
    },

    // ===== CARDS DE ARQUIVOS =====
    fileCard: {
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
    },

    fileCardContent: {
        padding: theme.spacing(3),
        textAlign: "center",
    },

    fileName: {
        fontSize: "18px",
        fontWeight: 700,
        color: "#1a202c",
        marginBottom: theme.spacing(2),
    },

    fileInfo: {
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

    fileIcon: {
        fontSize: "48px",
        marginBottom: theme.spacing(2),
        color: "#3b82f6",
    },

    fileActions: {
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

const FileLists = () => {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { user, socket } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedFileList, setSelectedFileList] = useState(null);
    const [deletingFileList, setDeletingFileList] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [files, dispatch] = useReducer(reducer, []);
    const [fileListModalOpen, setFileListModalOpen] = useState(false);

    // Estatísticas calculadas
    const totalFiles = files.length;
    const recentFiles = files.filter(f => {
        const fileDate = new Date(f.createdAt || f.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return fileDate >= weekAgo;
    }).length;

    const fetchFileLists = useCallback(async () => {
        try {
            const { data } = await api.get("/files/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_FILES", payload: data.files });
            setHasMore(data.hasMore);
            setLoading(false);
        } catch (err) {
            toastError(err);
        }
    }, [searchParam, pageNumber]);

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            fetchFileLists();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, fetchFileLists]);

    useEffect(() => {
        const onFileEvent = (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_FILES", payload: data.files });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_FILE", payload: +data.fileId });
            }
        };

        socket.on(`company-${user.companyId}-file`, onFileEvent);
        return () => {
            socket.off(`company-${user.companyId}-file`, onFileEvent);
        };
    }, [socket]);

    const handleOpenFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(true);
    };

    const handleCloseFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditFileList = (fileList) => {
        setSelectedFileList(fileList);
        setFileListModalOpen(true);
    };

    const handleDeleteFileList = async (fileListId) => {
        try {
            await api.delete(`/files/${fileListId}`);
            toast.success(i18n.t("files.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingFileList(null);
        setSearchParam("");
        setPageNumber(1);

        dispatch({ type: "RESET" });
        setPageNumber(1);
        await fetchFileLists();
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

    const renderCardActions = (fileList) => {
        return (
            <CardActions className={classes.fileActions}>
                <Tooltip title="Editar archivo" placement="top">
                    <Button
                        onClick={() => handleEditFileList(fileList)}
                        className={`${classes.actionButton} edit-button`}
                        startIcon={<EditIcon />}
                        size="small"
                    >
                        {isMobile ? '' : 'Editar'}
                    </Button>
                </Tooltip>

                <Tooltip title="Eliminar archivo" placement="top">
                    <Button
                        onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingFileList(fileList);
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

    if (user.profile === "user") {
        return <ForbiddenPage />;
    }

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <ConfirmationModal
                    title={deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`}
                    open={confirmModalOpen}
                    onClose={setConfirmModalOpen}
                    onConfirm={() => handleDeleteFileList(deletingFileList.id)}
                >
                    {i18n.t("files.confirmationModal.deleteMessage")}
                </ConfirmationModal>
                
                <FileModal
                    open={fileListModalOpen}
                    onClose={handleCloseFileListModal}
                    reload={fetchFileLists}
                    aria-labelledby="form-dialog-title"
                    fileListId={selectedFileList && selectedFileList.id}
                />

                {/* CABEÇALHO */}
                <Box className={classes.header}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography className={classes.headerTitle}>
                                <FolderIcon />
                                {i18n.t("files.title")}
                            </Typography>
                            <Typography className={classes.headerSubtitle}>
                                Gestiona y organiza tus archivos y documentos
                            </Typography>
                        </Box>
                        <Box className={classes.headerActions}>
                            <Button
                                onClick={handleOpenFileListModal}
                                className={classes.addButton}
                                startIcon={<AddIcon />}
                            >
                                {i18n.t("files.buttons.add")}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* SEÇÃO DE BUSCA */}
                <Box className={classes.searchSection}>
                    <Box className={classes.searchHeader}>
                        <Typography className={classes.searchTitle}>
                            <SearchIcon />
                            Buscar archivos
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

                {/* SECCIÓN: ESTADÍSTICAS DE ARCHIVOS */}
                <Box className={classes.cardSection}>
                    <Typography className={classes.sectionTitle}>
                        <AssessmentIcon />
                        Estadísticas de archivos
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Total de archivos
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {totalFiles}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                                        <DescriptionIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Archivos recientes
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {recentFiles}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                                        <TrendingUpIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Almacenamiento
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {Math.round(totalFiles * 2.5)}MB
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                                        <StorageIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.statsCard, classes.cardRed)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Disponible
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {hasMore ? '∞' : 'Max'}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                                        <FolderIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* SEÇÃO DE ARQUIVOS */}
                <Box className={classes.filesSection}>
                    <Box className={classes.filesHeader}>
                        <Typography className={classes.filesTitle}>
                            Lista de archivos ({totalFiles})
                        </Typography>
                    </Box>

                    {loading ? (
                        <div className={classes.loadingContainer}>
                            <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                            <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                Cargando archivos...
                            </Typography>
                            <Typography variant="body2" style={{ color: "#64748b" }}>
                                Espera mientras buscamos tus archivos
                            </Typography>
                        </div>
                    ) : files.length === 0 ? (
                        <div className={classes.emptyState}>
                            <FolderIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
                            <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                No se encontraron archivos
                            </Typography>
                            <Typography variant="body2">
                                Haz clic en "Añadir" para subir tu primer archivo
                            </Typography>
                        </div>
                    ) : (
                        <div className={classes.customScrollContainer} onScroll={handleScroll}>
                            <Grid container spacing={3}>
                                {files.map((fileList) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={fileList.id}>
                                        <Card className={classes.fileCard}>
                                            <CardContent className={classes.fileCardContent}>
                                                <DescriptionIcon className={classes.fileIcon} />
                                                
                                                <Typography className={classes.fileName}>
                                                    {fileList.name}
                                                </Typography>
                                                
                                                <div className={classes.fileInfo}>
                                                    <span>ID:</span>
                                                    <strong>{fileList.id}</strong>
                                                </div>
                                                
                                                <div className={classes.fileInfo}>
                                                    <span>Tipo:</span>
                                                    <strong>Archivo</strong>
                                                </div>
                                                
                                                <div className={classes.fileInfo}>
                                                    <span>Estado:</span>
                                                    <Chip 
                                                        label="Activo"
                                                        size="small"
                                                        style={{
                                                            backgroundColor: "#dcfce7",
                                                            color: "#166534",
                                                            fontWeight: 600,
                                                            fontSize: "11px"
                                                        }}
                                                    />
                                                </div>
                                            </CardContent>

                                            {renderCardActions(fileList)}
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

export default FileLists;