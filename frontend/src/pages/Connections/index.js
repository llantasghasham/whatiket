import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { makeStyles } from "@material-ui/core/styles";
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
  Box,
  Card,
  CardContent,
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
  WhatsApp,
} from "@material-ui/icons";

import FacebookLogin from "@greatsumini/react-facebook-login";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import Grid from "@mui/material/Grid";
import CardActions from "@mui/material/CardActions";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from "../../utils/formatSerializedId";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import moment from "moment";
import QrCodeIcon from "@mui/icons-material/QrCode";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import LogoutIcon from "@mui/icons-material/Logout";
import RepeatIcon from "@mui/icons-material/Repeat";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ChannelModal from "../../HubEcosystem/components/ChannelModal";
import notificame_logo from "../../assets/notificame_logo.png";
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DevicesIcon from '@mui/icons-material/Devices';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
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

  // ===== BOTÕES =====
  modernButton: {
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    padding: theme.spacing(1, 2),
    transition: "all 0.2s ease",
    
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },

  // ===== SEÇÃO DE CONEXÕES =====
  connectionsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "400px",
  },

  connectionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  connectionsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CARDS DE CONEXÕES =====
  connectionCard: {
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

  connectionCardContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  connectionName: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
  },

  connectionInfo: {
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

  channelIcon: {
    fontSize: "48px",
    marginBottom: theme.spacing(2),
  },

  statusChip: {
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    borderRadius: "14px",
    marginBottom: theme.spacing(2),
    
    "&.connected": {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    
    "&.disconnected": {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    
    "&.qrcode": {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    
    "&.opening": {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    },
    
    "&.timeout": {
      backgroundColor: "#f3e8ff",
      color: "#7c3aed",
    },
  },

  defaultLabel: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontWeight: 600,
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "8px",
    marginTop: theme.spacing(1),
  },

  connectionActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    flexWrap: "wrap",
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

  // ===== IMPORT STATUS CARD =====
  importStatusCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    textAlign: "center",
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
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },

  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
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

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366" }} />;
    default:
      return "error";
  }
};

const Connections = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hubChannelModalOpen, setHubChannelModalOpen] = useState(false);
  const { handleLogout } = useContext(AuthContext);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [planConfig, setPlanConfig] = useState(false);

  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  // Estatísticas calculadas
  const totalConnections = whatsApps.length;
  const connectedCount = whatsApps.filter(w => w.status === 'CONNECTED').length;
  const disconnectedCount = whatsApps.filter(w => w.status === 'DISCONNECTED').length;
  const qrcodeCount = whatsApps.filter(w => w.status === 'qrcode').length;

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var before = moment(moment().format()).isBefore(user.company.dueDate);

  if (before !== true) {
    handleLogout();
  }

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    socket.on(`importMessages-${user.companyId}`, (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        history.go(0);
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    });
  }, [whatsApps]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
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
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
        {whatsApp.status === "qrcode" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                startIcon={<QrCodeIcon />}
                size="small"
                variant="contained"
                className={classes.modernButton}
                style={{
                  color: "white",
                  backgroundColor: "#437db5",
                }}
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <Can
            role={
              user.profile === "user" && user.allowConnections === "enabled"
                ? "admin"
                : user.profile
            }
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<RepeatIcon />}
                  size="small"
                  variant="contained"
                  className={classes.modernButton}
                  style={{
                    color: "white",
                    backgroundColor: "#4ec24e",
                  }}
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  variant="contained"
                  className={classes.modernButton}
                  style={{
                    color: "white",
                    backgroundColor: "#8A2BE2",
                  }}
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  startIcon={<LogoutIcon />}
                  size="small"
                  variant="contained"
                  className={classes.modernButton}
                  style={{
                    color: "white",
                    backgroundColor: "#db6565",
                  }}
                  onClick={() => {
                    handleOpenConfirmationModal("disconnect", whatsApp.id);
                  }}
                >
                  {i18n.t("connections.buttons.disconnect")}
                </Button>

                {renderImportButton(whatsApp)}
              </>
            )}
          />
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </Box>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
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
            <CropFree style={{ color: "#4ec24e" }} />
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'connected';
      case 'DISCONNECTED':
        return 'disconnected';
      case 'qrcode':
        return 'qrcode';
      case 'OPENING':
        return 'opening';
      case 'TIMEOUT':
      case 'PAIRING':
        return 'timeout';
      default:
        return 'disconnected';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'Conectado';
      case 'DISCONNECTED':
        return 'Desconectado';
      case 'qrcode':
        return 'QR Code';
      case 'OPENING':
        return 'Conectando';
      case 'TIMEOUT':
        return 'Tiempo de espera';
      case 'PAIRING':
        return 'Emparejando';
      default:
        return status;
    }
  };

  const restartWhatsapps = async () => {
    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  };

  const renderCardActions = (whatsApp) => {
    return (
      <CardActions className={classes.connectionActions}>
        <Can
          role={user.profile}
          perform="connections-page:addConnection"
          yes={() => (
            <>
              <Tooltip title="Editar Conexión" placement="top">
                <Button
                  onClick={() => handleEditWhatsApp(whatsApp)}
                  className={`${classes.actionButton} edit-button`}
                  startIcon={<Edit />}
                  size="small"
                >
                  {isMobile ? '' : 'Editar'}
                </Button>
              </Tooltip>

              <Tooltip title="Eliminar conexión" placement="top">
                <Button
                  onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}
                  className={`${classes.actionButton} delete-button`}
                  startIcon={<DeleteOutline />}
                  size="small"
                >
                  {isMobile ? '' : 'Eliminar'}
                </Button>
              </Tooltip>
            </>
          )}
        />
      </CardActions>
    );
  };

  if (user.profile === "user" && user.allowConnections === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={confirmModalInfo.title}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleSubmitConfirmationModal}
        >
          {confirmModalInfo.message}
        </ConfirmationModal>
        
        {qrModalOpen && (
          <QrcodeModal
            open={qrModalOpen}
            onClose={handleCloseQrModal}
            whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
          />
        )}
        
        <WhatsAppModal
          open={whatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        />

        <ChannelModal
          open={hubChannelModalOpen}
          onClose={() => setHubChannelModalOpen(false)}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <HubIcon />
                {i18n.t("connections.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra y monitorea todas tus conexiones de comunicación
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<RestartAltIcon />}
                variant="contained"
                className={classes.modernButton}
                style={{
                  color: "white",
                  backgroundColor: "#444394",
                }}
                onClick={restartWhatsapps}
              >
                {i18n.t("connections.restartConnections")}
              </Button>

              <Button
                startIcon={<WhatsAppIcon />}
                variant="contained"
                className={classes.modernButton}
                style={{
                  color: "white",
                  backgroundColor: "#6959CD",
                }}
                onClick={() =>
                  openInNewTab(`https://wa.me/554198239551", "_blank`)
                }
              >
                {i18n.t("connections.callSupport")}
              </Button>
              
              <PopupState variant="popover" popupId="demo-popup-menu">
                {(popupState) => (
                  <React.Fragment>
                    <Can
                      role={user.profile}
                      perform="connections-page:addConnection"
                      yes={() => (
                        <>
                          <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            className={classes.modernButton}
                            style={{
                              color: "white",
                              backgroundColor: "#3b82f6",
                            }}
                            {...bindTrigger(popupState)}
                          >
                            {i18n.t("connections.newConnection")}
                          </Button>
                          <Menu {...bindMenu(popupState)}>
                            {/* WHATSAPP */}
                            <MenuItem
                              disabled={
                                planConfig?.plan?.useWhatsapp ? false : true
                              }
                              onClick={() => {
                                handleOpenWhatsAppModal();
                                popupState.close();
                              }}
                            >
                              <WhatsApp
                                fontSize="small"
                                style={{
                                  marginRight: "10px",
                                  color: "#25D366",
                                }}
                              />
                              WhatsApp
                            </MenuItem>

                            {/* NOTIFICAME HUB */}
                            <MenuItem
                              onClick={() => setHubChannelModalOpen(true)}
                            >
                              <img
                                src={notificame_logo}
                                fontSize="small"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginRight: "10px",
                                  marginLeft: "2px",
                                  color: "#25D366",
                                }}
                              />
                              NotificaMe Hub
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    />
                  </React.Fragment>
                )}
              </PopupState>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS CONEXIONES */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <AssessmentIcon />
            Estadísticas de las Conexiones
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de Conexiones
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalConnections}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
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
                      Conectadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {connectedCount}
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
                      Desconectadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {disconnectedCount}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <SignalCellularConnectedNoInternet0Bar />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.statsCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Esperando QR
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {qrcodeCount}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <QrCodeIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* STATUS DE IMPORTAÇÃO */}
        {statusImport?.all && (
          <Box className={classes.importStatusCard}>
            <Typography component="h5" variant="h5">
              {statusImport?.this === -1
                ? i18n.t("connections.buttons.preparing")
                : i18n.t("connections.buttons.importing")}
            </Typography>
            {statusImport?.this === -1 ? (
              <Typography component="h6" variant="h6" align="center">
                <CircularProgress size={24} />
              </Typography>
            ) : (
              <>
                <Typography component="h6" variant="h6" align="center">
                  {`${i18n.t(`connections.typography.processed`)} ${
                    statusImport?.this
                  } ${i18n.t(`connections.typography.in`)} ${
                    statusImport?.all
                  }  ${i18n.t(`connections.typography.date`)}: ${
                    statusImport?.date
                  } `}
                </Typography>
                <Typography align="center">
                  <CircularProgressWithLabel
                    style={{ margin: "auto" }}
                    value={
                      (statusImport?.this / statusImport?.all) * 100
                    }
                  />
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* SEÇÃO DE CONEXÕES */}
        <Box className={classes.connectionsSection}>
          <Box className={classes.connectionsHeader}>
            <Typography className={classes.connectionsTitle}>
              Lista de Conexiones ({totalConnections})
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando conexiones...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus conexiones
              </Typography>
            </div>
          ) : whatsApps?.length === 0 ? (
            <div className={classes.emptyState}>
              <HubIcon style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                No se encontraron conexiones
              </Typography>
              <Typography variant="body2">
                Haz clic en "Nueva conexión" para agregar tu primera conexión
              </Typography>
            </div>
          ) : (
            <div className={classes.customScrollContainer}>
              <Grid container spacing={3}>
                {whatsApps.map((whatsApp) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={whatsApp.id}>
                    <Card className={classes.connectionCard}>
                      <CardContent className={classes.connectionCardContent}>
                        <Box className={classes.channelIcon}>
                          {IconChannel(whatsApp.channel)}
                        </Box>
                        
                        <Typography className={classes.connectionName}>
                          {whatsApp.name}
                        </Typography>
                        
                        <div className={classes.connectionInfo}>
                          <span>Número:</span>
                          <strong>
                            {whatsApp.number && whatsApp.channel === "whatsapp"
                              ? formatSerializedId(whatsApp.number)
                              : whatsApp.number}
                          </strong>
                        </div>
                        
                        <Box display="flex" justifyContent="center" marginBottom="16px">
                          <Chip 
                            label={getStatusLabel(whatsApp.status)}
                            className={`${classes.statusChip} ${getStatusClass(whatsApp.status)}`}
                            size="small"
                          />
                        </Box>
                        
                        <div className={classes.connectionInfo}>
                          <span>Estado visual:</span>
                          {renderStatusToolTips(whatsApp)}
                        </div>
                        
                        <div className={classes.connectionInfo}>
                          <span>Última actualización:</span>
                          <strong>
                            {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                          </strong>
                        </div>
                        
                        {whatsApp.isDefault && (
                          <Box display="flex" justifyContent="center" marginTop="8px">
                            <span className={classes.defaultLabel}>
                              {i18n.t("connections.table.default")}
                            </span>
                          </Box>
                        )}
                        
                        <Box marginTop="16px">
                          {renderActionButtons(whatsApp)}
                        </Box>
                      </CardContent>

                      {renderCardActions(whatsApp)}
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

export default Connections;