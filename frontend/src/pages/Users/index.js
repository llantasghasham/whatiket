import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { AccountCircle } from "@material-ui/icons";
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import whatsappIcon from '../../assets/nopicture.png'
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext, socketManager } from "../../context/Socket/SocketContext";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Avatar, Box, Chip, Tooltip } from "@material-ui/core";
import ForbiddenPage from "../../components/ForbiddenPage";
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import clsx from "clsx";

const backendUrl = getBackendUrl();

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
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

  cardRed: {
    "&::before": {
      backgroundColor: "#ef4444",
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

  // ===== BOTÕES =====
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

  // ===== SEÇÃO DE USUÁRIOS =====
  usersSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  usersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  usersTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE USUÁRIOS =====
  userCard: {
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

  userCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  userName: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
  },

  userAvatar: {
    width: "80px",
    height: "80px",
    margin: "16px auto",
    border: "4px solid #f1f5f9",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    position: "relative",
    cursor: "pointer",
    transition: "all 0.2s ease",
    
    "&:hover": {
      transform: "scale(1.05)",
      border: "4px solid #3b82f6",
    }
  },

  avatarContainer: {
    position: "relative",
    display: "inline-block",
    margin: "16px auto",
  },

  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(59, 130, 246, 0.8)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease",
    cursor: "pointer",
    
    "&:hover": {
      opacity: 1,
    },
    
    "& .MuiSvgIcon-root": {
      color: "white",
      fontSize: "24px",
    }
  },

  hiddenInput: {
    display: "none",
  },

  uploadProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },

  userInfo: {
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

  profileChip: {
    fontWeight: 700,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    
    "&.admin": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    
    "&.user": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.super": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
  },

  userActions: {
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

const Users = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const [uploadingUserId, setUploadingUserId] = useState(null);
  const { user: loggedInUser, socket } = useContext(AuthContext);
  const { profileImage } = loggedInUser;

  // Estatísticas calculadas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.profile === 'admin').length;
  const normalUsers = users.filter(u => u.profile === 'user').length;
  const superUsers = users.filter(u => u.profile === 'super').length;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchUsers();
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (loggedInUser) {
      const companyId = loggedInUser.companyId;
      const onCompanyUser = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_USERS", payload: data.user });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_USER", payload: +data.userId });
        }
      };
      socket.on(`company-${companyId}-user`, onCompanyUser);
      return () => {
        socket.off(`company-${companyId}-user`, onCompanyUser);
      };
    }
  }, [socket]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleProfileImageUpload = async (event, userId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona solo archivos de imagen');
      return;
    }

    // Validar tamaño del archivo (máx. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe tener como máximo 5MB');
      return;
    }

    setUploadingUserId(userId);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const { data } = await api.post(`/users/${userId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Actualizar el usuario en la lista
      dispatch({ type: "UPDATE_USERS", payload: data });
      
      toast.success('¡Imagen de perfil actualizada con éxito!');
    } catch (err) {
      console.error('Error al subir imagen:', err);
      toastError(err);
    } finally {
      setUploadingUserId(null);
      // Limpiar el input
      event.target.value = '';
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    setPageNumber((prevPage) => prevPage + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const renderProfileImage = (user) => {
    const isUploading = uploadingUserId === user.id;
    
    const getAvatarSrc = () => {
      if (user.id === loggedInUser.id) {
        return `${backendUrl}/public/company${user.companyId}/user/${profileImage || 'default-avatar.png'}`;
      }
      return user.profileImage 
        ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` 
        : whatsappIcon;
    };

    return (
      <div className={classes.avatarContainer}>
        <input
          accept="image/*"
          className={classes.hiddenInput}
          id={`profile-image-${user.id}`}
          type="file"
          onChange={(e) => handleProfileImageUpload(e, user.id)}
        />
        <label htmlFor={`profile-image-${user.id}`}>
          <Avatar
            src={getAvatarSrc()}
            alt={user.name}
            className={classes.userAvatar}
            onError={(e) => {
              e.target.src = whatsappIcon;
            }}
          />
          
          {!isUploading && (
            <div className={classes.avatarOverlay}>
              <PhotoCameraIcon />
            </div>
          )}
          
          {isUploading && (
            <div className={classes.uploadProgress}>
              <CircularProgress size={30} style={{ color: "white" }} />
            </div>
          )}
        </label>
      </div>
    );
  };

  const getProfileClass = (profile) => {
    switch (profile?.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'user':
        return 'user';
      case 'super':
        return 'super';
      default:
        return 'user';
    }
  };

  const getProfileLabel = (profile) => {
    switch (profile?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      case 'super':
        return 'Super Admin';
      default:
        return profile || 'N/A';
    }
  };

  const renderCardActions = (user) => {
    return (
      <CardActions className={classes.userActions}>
        <Tooltip title="Editar usuario" placement="top">
          <Button
            onClick={() => handleEditUser(user)}
            className={`${classes.actionButton} edit-button`}
            startIcon={<EditIcon />}
            size="small"
          >
            {isMobile ? '' : 'Editar'}
          </Button>
        </Tooltip>

        <Tooltip title="Eliminar usuario" placement="top">
          <Button
            onClick={() => {
              setConfirmModalOpen(true);
              setDeletingUser(user);
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

  if (loggedInUser.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingUser &&
            `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteUser(deletingUser.id)}
        >
          {i18n.t("users.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <UserModal
          open={userModalOpen}
          onClose={handleCloseUserModal}
          aria-labelledby="form-dialog-title"
          userId={selectedUser && selectedUser.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <PeopleIcon />
                {i18n.t("users.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra usuarios, perfiles y permisos del sistema
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                onClick={handleOpenUserModal}
                className={classes.addButton}
                startIcon={<PersonAddIcon />}
              >
                {i18n.t("users.buttons.add")}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE BUSCA */}
        <Box className={classes.searchSection}>
          <Box className={classes.searchHeader}>
            <Typography className={classes.searchTitle}>
              <SearchIcon />
              Buscar usuarios
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

        {/* SECCIÓN: ESTADÍSTICAS DE LOS USUARIOS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de usuarios
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de usuarios
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalUsers}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <PeopleIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Administradores
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {adminUsers}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <AdminPanelSettingsIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Usuarios normales
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {normalUsers}
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
                      Super administradores
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {superUsers}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <SupervisorAccountIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE USUÁRIOS */}
        <Box className={classes.usersSection}>
          <Box className={classes.usersHeader}>
            <Typography className={classes.usersTitle}>
              Lista de usuarios ({totalUsers})
            </Typography>
          </Box>

          {loading && !loadingMore ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando usuarios...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Por favor espera mientras buscamos los usuarios
              </Typography>
            </div>
          ) : users.length === 0 ? (
            <div className={classes.emptyState}>
              <PeopleIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontró ningún usuario
              </Typography>
              <Typography variant="body2">
                Crea el primer usuario o ajusta los filtros de búsqueda
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer} onScroll={handleScroll}>
              <Grid container spacing={3}>
                {users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                    <Card className={classes.userCard}>
                      <CardContent className={classes.userCardContent}>
                        <Typography className={classes.userName}>
                          {user.name}
                        </Typography>
                        
                        <Typography variant="caption" style={{ 
                          color: "#64748b", 
                          fontSize: "11px", 
                          marginBottom: "8px",
                          display: "block"
                        }}>
                          Haz clic en la foto para cambiar
                        </Typography>
                        
                        {renderProfileImage(user)}
                        
                        <div className={classes.userInfo}>
                          <span>ID:</span>
                          <strong>{user.id}</strong>
                        </div>
                        
                        <div className={classes.userInfo}>
                          <span>Email:</span>
                          <strong>{user.email}</strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="8px">
                          <Chip 
                            label={getProfileLabel(user.profile)}
                            className={`${classes.profileChip} ${getProfileClass(user.profile)}`}
                            size="small"
                          />
                        </Box>
                        
                        <div className={classes.userInfo}>
                          <span>Estado:</span>
                          <UserStatusIcon user={user} />
                        </div>
                        
                        {!isMobile && (
                          <>
                            <div className={classes.userInfo}>
                              <span>Inicio:</span>
                              <strong>{user.startWork || "N/A"}</strong>
                            </div>
                            
                            <div className={classes.userInfo}>
                              <span>Fin:</span>
                              <strong>{user.endWork || "N/A"}</strong>
                            </div>
                          </>
                        )}
                      </CardContent>

                      {renderCardActions(user)}
                    </Card>
                  </Grid>
                ))}
                
                {loadingMore && (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" padding={2}>
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

export default Users;