import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO, set } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Stack } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Divider,
  Box,
  Chip,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import WhatsAppModalCompany from "../../components/CompanyWhatsapps";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import ForbiddenPage from "../../components/ForbiddenPage";

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DevicesIcon from '@mui/icons-material/Devices';
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
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

  cardPurple: {
    "&::before": {
      backgroundColor: "#8b5cf6",
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

  companyIcon: {
    fontSize: "48px",
    marginBottom: theme.spacing(2),
    color: "#3b82f6",
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
  },

  // ===== CARD DE TOTAIS =====
  totalCard: {
    backgroundColor: "#1a202c",
    color: "white",
    borderRadius: "16px",
    border: "1px solid #374151",
    transition: "all 0.3s ease",
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
      backgroundColor: "#8b5cf6",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
      
      "&::before": {
        width: "6px",
      }
    },
  },

  totalCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: "white",
  },

  totalTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "white",
    marginBottom: theme.spacing(2),
  },

  totalInfo: {
    fontSize: "14px",
    color: "#d1d5db",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 500,
    padding: theme.spacing(0.5, 1),
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    
    "& strong": {
      color: "white",
      fontWeight: 700,
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

  // ===== TOOLTIPS CUSTOMIZADOS =====
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "0",
    maxWidth: 450
  },
  tooltipPopper: {
    textAlign: "center"
  },
  buttonProgress: {
    color: green[500]
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const IconChannel = channel => {
  switch (channel) {
    case "facebook":
      return <Facebook />;
    case "instagram":
      return <Instagram />;
    case "whatsapp":
      return <WhatsApp />;
    default:
      return "error";
  }
};

const AllConnections = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user, socket } = useContext(AuthContext);
  const { list } = useCompanies();
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(true);
  const [loadingComp, setLoadingComp] = useState(false);
  const [whats, setWhats] = useState([]);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [filterConnections, setFilterConnections] = useState([]);
  const [companyWhatsApps, setCompanyWhatsApps] = useState(null);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const history = useHistory();
  if (!user.super) {
    history.push("/tickets")
  }

  // Estatísticas calculadas
  const totalCompanies = companies.length;
  const totalConnections = whats.length;
  const totalConnected = whats.filter(w => w.status === 'CONNECTED').length;
  const totalDisconnected = whats.filter(w => w.status !== 'CONNECTED').length;

  useEffect(() => {
    setLoadingWhatsapp(true);
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/whatsapp/all/?session=0");
        setWhats(data);
        setLoadingWhatsapp(false);
      } catch (err) {
        setLoadingWhatsapp(false);
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  const responseFacebook = response => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken
        })
        .then(response => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch(error => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoadingComp(true);
    try {
      const companyList = await list();
      setCompanies(companyList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoadingComp(false);
  }

  const responseInstagram = response => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken
        })
        .then(response => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch(error => {
          toastError(error);
        });
    }
  };

  const handleStartWhatsAppSession = async whatsAppId => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async whatsAppId => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = (whatsappsFilter, comp) => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
    if (whatsappsFilter?.length > 0) {
      setFilterConnections(whatsappsFilter);
      setCompanyWhatsApps(comp);
    }
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
    setFilterConnections([]);
    setCompanyWhatsApps(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/admin/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.disconnected"));
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderActionButtons = whatsApp => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleOpenQrModal(whatsApp)}
          >
            {i18n.t("connections.buttons.qrcode")}
          </Button>
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => handleStartWhatsAppSession(whatsApp.id)}
            >
              {i18n.t("connections.buttons.tryAgain")}
            </Button>{" "}
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleRequestNewQrCode(whatsApp.id)}
            >
              {i18n.t("connections.buttons.newQr")}
            </Button>
          </>
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => {
                handleOpenConfirmationModal("disconnect", whatsApp.id);
              }}
            >
              {i18n.t("connections.buttons.disconnect")}
            </Button>
          )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = whatsApp => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const renderCardActions = (company) => {
    return (
      <CardActions className={classes.companyActions}>
        {user.profile === "admin" && (
          <Tooltip title="Gestionar conexiones" placement="top">
            <Button
              onClick={() =>
                handleOpenWhatsAppModal(
                  whats.filter((item) => item?.companyId === company?.id),
                  company
                )
              }
              className={`${classes.actionButton} edit-button`}
              startIcon={<Edit />}
              size="small"
            >
              {isMobile ? '' : 'Gestionar'}
            </Button>
          </Tooltip>
        )}
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
          title={confirmModalInfo.title}
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={handleSubmitConfirmationModal}
        >
          {confirmModalInfo.message}
        </ConfirmationModal>
        
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
        
        <WhatsAppModalCompany
          open={whatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          filteredWhatsapps={filterConnections}
          companyInfos={companyWhatsApps}
          whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <SupervisedUserCircleIcon />
                {i18n.t("connections.title")} - Super Admin
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Supervisa y gestiona todas las conexiones de todas las empresas
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <PopupState variant="popover" popupId="demo-popup-menu">
                {popupState => (
                  <React.Fragment>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      className={classes.addButton}
                      {...bindTrigger(popupState)}
                    >
                      Nueva conexión
                    </Button>
                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={() => {
                          handleOpenWhatsAppModal();
                          popupState.close();
                        }}
                      >
                        <WhatsApp
                          fontSize="small"
                          style={{
                            marginRight: "10px"
                          }}
                        />
                        WhatsApp
                      </MenuItem>
                      <FacebookLogin
                        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        version="13.0"
                        scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                        callback={responseFacebook}
                        render={renderProps => (
                          <MenuItem onClick={renderProps.onClick}>
                            <Facebook
                              fontSize="small"
                              style={{
                                marginRight: "10px"
                              }}
                            />
                            Facebook
                          </MenuItem>
                        )}
                      />

                      <FacebookLogin
                        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        version="13.0"
                        scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                        callback={responseInstagram}
                        render={renderProps => (
                          <MenuItem onClick={renderProps.onClick}>
                            <Instagram
                              fontSize="small"
                              style={{
                                marginRight: "10px"
                              }}
                            />
                            Instagram
                          </MenuItem>
                        )}
                      />
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS GLOBALES */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas globales
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
              <Card className={clsx(classes.statsCard, classes.cardPurple)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de conexiones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalConnections}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconPurple)}>
                    <DevicesIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Conexiones activas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalConnected}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <SignalCellular4Bar />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Conexiones inactivas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalDisconnected}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <SignalCellularConnectedNoInternet0Bar />
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
              Empresas y sus conexiones ({totalCompanies})
            </Typography>
          </Box>

          {loadingWhatsapp ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando conexiones...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos todas las conexiones
              </Typography>
            </div>
          ) : companies?.length === 0 ? (
            <div className={classes.emptyState}>
              <BusinessIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontró ninguna empresa
              </Typography>
              <Typography variant="body2">
                Registra empresas para gestionar tus conexiones
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {companies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                    <Card className={classes.companyCard}>
                      <CardContent className={classes.companyCardContent}>
                        <BusinessIcon className={classes.companyIcon} />
                        
                        <Typography className={classes.companyName}>
                          {company?.name}
                        </Typography>
                        
                        <div className={classes.companyInfo}>
                          <span>ID:</span>
                          <strong>{company?.id}</strong>
                        </div>
                        
                        <div className={classes.companyInfo}>
                          <span>Conectadas:</span>
                          <strong>
                            {whats?.length &&
                              whats.filter((item) => item?.companyId === company?.id && item?.status === "CONNECTED").length}
                          </strong>
                        </div>
                        
                        <div className={classes.companyInfo}>
                          <span>Desconectadas:</span>
                          <strong>
                            {whats?.length &&
                              whats.filter((item) => item?.companyId === company?.id && item?.status !== "CONNECTED").length}
                          </strong>
                        </div>
                        
                        <div className={classes.companyInfo}>
                          <span>Total:</span>
                          <strong>
                            {whats?.length && whats.filter((item) => item?.companyId === company?.id).length}
                          </strong>
                        </div>
                      </CardContent>

                      {renderCardActions(company)}
                    </Card>
                  </Grid>
                ))}
                
                {/* CARD DE TOTAIS GERAIS */}
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card className={classes.totalCard}>
                    <CardContent className={classes.totalCardContent}>
                      <SupervisedUserCircleIcon className={classes.companyIcon} style={{ color: "#8b5cf6" }} />
                      
                      <Typography className={classes.totalTitle}>
                        Totales generales
                      </Typography>
                      
                      <div className={classes.totalInfo}>
                        <span>Empresas:</span>
                        <strong>{totalCompanies}</strong>
                      </div>
                      
                      <div className={classes.totalInfo}>
                        <span>Conectadas:</span>
                        <strong>{totalConnected}</strong>
                      </div>
                      
                      <div className={classes.totalInfo}>
                        <span>Desconectadas:</span>
                        <strong>{totalDisconnected}</strong>
                      </div>
                      
                      <div className={classes.totalInfo}>
                        <span>Total de conexiones:</span>
                        <strong>{totalConnections}</strong>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default AllConnections;