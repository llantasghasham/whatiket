import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// Ícones modernos e bonitos
import DashboardIcon from "@mui/icons-material/Dashboard";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CodeIcon from "@mui/icons-material/Code";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ForumIcon from "@mui/icons-material/Forum";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import BusinessIcon from "@mui/icons-material/Business";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import CampaignIcon from "@mui/icons-material/Campaign";
import ShapeLineIcon from "@mui/icons-material/ShapeLine";
import WebhookIcon from "@mui/icons-material/Webhook";
import WorkIcon from "@mui/icons-material/Work";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BuildIcon from "@mui/icons-material/Build";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.mode === 'dark' 
      ? "#1a1d23"
      : "#ffffff",
    height: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
    borderRight: theme.palette.mode === 'dark'
      ? "1px solid #2d3748"
      : "1px solid #e2e8f0",
    position: "relative",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: theme.palette.mode === 'dark' ? "#4a5568" : "#cbd5e0",
      borderRadius: "2px",
      "&:hover": {
        background: theme.palette.mode === 'dark' ? "#718096" : "#a0aec0",
      },
    },
  },
  
  menuContainer: {
    padding: "20px 0",
  },
  
  // Menu principal limpo
  menuHeader: {
    height: "44px",
    borderRadius: "10px",
    margin: "2px 12px",
    backgroundColor: "transparent",
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark' 
        ? "rgba(74, 85, 104, 0.1)" 
        : "rgba(247, 250, 252, 0.8)",
    },
    "&.active": {
      backgroundColor: theme.palette.mode === 'dark'
        ? `${theme.palette.primary.main}15`
        : `${theme.palette.primary.main}08`,
      "& .MuiTypography-root": {
        fontWeight: "600",
        color: theme.palette.primary.main,
      },
    },
  },

  // Submenu limpo
  listItem: {
    height: "36px",
    borderRadius: "8px",
    margin: "1px 12px 1px 20px",
    backgroundColor: "transparent",
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.mode === 'dark' 
        ? "rgba(74, 85, 104, 0.08)" 
        : "rgba(247, 250, 252, 0.6)",
    },
    "&.active": {
      backgroundColor: theme.palette.mode === 'dark'
        ? `${theme.palette.primary.main}12`
        : `${theme.palette.primary.main}06`,
      "&:before": {
        content: '""',
        position: "absolute",
        left: "-8px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "3px",
        height: "16px",
        background: theme.palette.primary.main,
        borderRadius: "0 2px 2px 0",
      },
      "& .MuiTypography-root": {
        fontWeight: "600",
        color: theme.palette.primary.main,
      },
    },
  },

  // Tipografia simples
  menuHeaderText: {
    fontSize: "14px",
    fontWeight: "500",
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&.active": {
      fontWeight: "600",
      color: theme.palette.primary.main,
    },
  },

  listItemText: {
    fontSize: "13px",
    fontWeight: "400",
    color: theme.palette.text.secondary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&.active": {
      fontWeight: "600",
      color: theme.palette.primary.main,
    },
  },

  // Ícones coloridos simples
  menuHeaderIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    height: 32,
    width: 32,
    position: "relative",
    "&.dashboard": {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#ffffff",
    },
    "&.communication": {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#ffffff",
    },
    "&.campaigns": {
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#ffffff",
    },
    "&.flows": {
      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      color: "#ffffff",
    },
    "&.tools": {
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      color: "#ffffff",
    },
    "&.admin": {
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      color: "#333333",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.1rem",
    },
  },

  // Ícones de subitems simples
  itemIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "6px",
    height: 24,
    width: 24,
    backgroundColor: theme.palette.mode === 'dark' 
      ? "rgba(74, 85, 104, 0.2)" 
      : "rgba(226, 232, 240, 0.5)",
    color: theme.palette.text.secondary,
    "&.active": {
      backgroundColor: theme.palette.primary.main,
      color: "#ffffff",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "0.9rem",
    },
  },

  // Container de submenu limpo
  submenu: {
    backgroundColor: "transparent",
    margin: "4px 0 8px 0",
    paddingTop: "4px",
    paddingBottom: "4px",
  },

  // Badge moderno
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ff6b6b",
      color: "#ffffff",
      fontSize: "10px",
      fontWeight: "600",
      minWidth: "16px",
      height: "16px",
      borderRadius: "8px",
      border: `2px solid ${theme.palette.background.paper}`,
    },
  },

  // Ícones de expansão
  expandIcon: {
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease",
    fontSize: "1.2rem",
    "&.expanded": {
      transform: "rotate(180deg)",
      color: theme.palette.primary.main,
    },
  },

  // Tooltip moderno
  tooltip: {
    backgroundColor: theme.palette.mode === 'dark' ? "#2d3748" : "#1a202c",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "500",
    borderRadius: "6px",
    padding: "6px 8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },

  // Separadores sutis
  menuSeparator: {
    height: "1px",
    background: theme.palette.mode === 'dark'
      ? "rgba(74, 85, 104, 0.2)"
      : "rgba(226, 232, 240, 0.8)",
    margin: "12px 20px",
    opacity: 0.6,
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip 
        title={primary} 
        placement="right" 
        arrow
        classes={{ tooltip: classes.tooltip }}
      >
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem 
          button 
          component={renderLink} 
          className={`${classes.listItem} ${isActive ? "active" : ""}`}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge badgeContent="!" color="error" overlap="circular" className={classes.badge}>
                  <div className={`${classes.itemIcon} ${isActive ? "active" : ""}`}>{icon}</div>
                </Badge>
              ) : (
                <div className={`${classes.itemIcon} ${isActive ? "active" : ""}`}>{icon}</div>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText 
            primary={
              <Typography className={`${classes.listItemText} ${isActive ? "active" : ""}`}>
                {primary}
              </Typography>
            } 
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      return [...state, ...action.payload];
    case "UPDATE_CHATS":
      return state.map((chat) => (chat.id === action.payload.id ? action.payload : chat));
    case "DELETE_CHAT":
      return state.filter((chat) => chat.id !== action.payload);
    case "RESET":
      return [];
    case "CHANGE_CHAT":
      return state.map((chat) => (chat.id === action.payload.chat.id ? action.payload.chat : chat));
    default:
      return state;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  
  // Estados dos menus
  const [openManagementSubmenu, setOpenManagementSubmenu] = useState(false);
  const [openCommunicationSubmenu, setOpenCommunicationSubmenu] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openAdministrationSubmenu, setOpenAdministrationSubmenu] = useState(false);
  const [openToolsSubmenu, setOpenToolsSubmenu] = useState(false);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState("1.92");
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  // Verificação de estados ativos
  const isManagementActive =
    location.pathname === "/" || 
    location.pathname.startsWith("/reports") || 
    location.pathname.startsWith("/moments");

  const isCommunicationActive =
    location.pathname.startsWith("/tickets") ||
    location.pathname.startsWith("/quick-messages") ||
    location.pathname.startsWith("/contacts") ||
    location.pathname.startsWith("/schedules") ||
    location.pathname.startsWith("/tags") ||
    location.pathname.startsWith("/chats");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") || 
    location.pathname.startsWith("/flowbuilders");

  const isAdministrationActive =
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/queues") ||
    location.pathname.startsWith("/prompts") ||
    location.pathname.startsWith("/queue-integration") ||
    location.pathname.startsWith("/connections") ||
    location.pathname.startsWith("/allConnections") ||
    location.pathname.startsWith("/files") ||
    location.pathname.startsWith("/financeiro") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/companies") ||
    location.pathname.startsWith("/announcements");

  const isToolsActive =
    location.pathname.startsWith("/messages-api") ||
    location.pathname.startsWith("/kanban") ||
    location.pathname.startsWith("/todolist") ||
    location.pathname.startsWith("/helps") ||
    location.pathname.startsWith("/documentacao");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      try {
        const _version = await getVersion();
        setVersion(_version.version || "1.92");
      } catch (error) {
        setVersion("1.92");
      }
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root} onClick={drawerClose}>
      <div className={classes.menuContainer}>
      
        {/* === GERENCIAMENTO === */}
        {planExpired && (
          <Can
            role={
              (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
                ? "admin"
                : user.profile
            }
            perform={"drawer-admin-items:view"}
            yes={() => (
              <>
                <Tooltip 
                  title={collapsed ? "Gestión" : ""} 
                  placement="right" 
                  arrow
                  classes={{ tooltip: classes.tooltip }}
                >
                  <ListItem
                    button
                    onClick={() => setOpenManagementSubmenu((prev) => !prev)}
                    className={`${classes.menuHeader} ${isManagementActive ? "active" : ""}`}
                  >
                    <ListItemIcon>
                      <div className={`${classes.menuHeaderIcon} dashboard`}>
                        <DashboardIcon />
                      </div>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography className={`${classes.menuHeaderText} ${isManagementActive ? "active" : ""}`}>
                          Gestión
                        </Typography>
                      }
                    />
                    {openManagementSubmenu ? 
                      <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
                      <ExpandMoreIcon className={classes.expandIcon} />
                    }
                  </ListItem>
                </Tooltip>
                <Collapse in={openManagementSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
                  <Can
                    role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
                    perform={"drawer-admin-items:view"}
                    yes={() => (
                      <>
                        <ListItemLink
                          to="/"
                          primary="Dashboard"
                          icon={<DashboardIcon />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/reports"
                          primary="Informes"
                          icon={<ListAltIcon />}
                          tooltip={collapsed}
                        />
                      </>
                    )}
                  />
                  <Can
                    role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
                    perform={"drawer-admin-items:view"}
                    yes={() => (
                      <ListItemLink
                        to="/moments"
                        primary="Chats en tiempo real"
                        icon={<ForumIcon />}
                        tooltip={collapsed}
                      />
                    )}
                  />
                </Collapse>
              </>
            )}
          />
        )}

        {/* === COMUNICAÇÃO === */}
        <Tooltip 
          title={collapsed ? "Comunicación" : ""} 
          placement="right" 
          arrow
          classes={{ tooltip: classes.tooltip }}
        >
          <ListItem
            button
            onClick={() => setOpenCommunicationSubmenu((prev) => !prev)}
            className={`${classes.menuHeader} ${isCommunicationActive ? "active" : ""}`}
          >
            <ListItemIcon>
              <div className={`${classes.menuHeaderIcon} communication`}>
                <ChatBubbleIcon />
              </div>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography className={`${classes.menuHeaderText} ${isCommunicationActive ? "active" : ""}`}>
                  Comunicación
                </Typography>
              }
            />
            {openCommunicationSubmenu ? 
              <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
              <ExpandMoreIcon className={classes.expandIcon} />
            }
          </ListItem>
        </Tooltip>
        <Collapse in={openCommunicationSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
          {planExpired && (
            <ListItemLink
              to="/tickets"
              primary="Tickets"
              icon={<WhatsAppIcon />}
              tooltip={collapsed}
            />
          )}

          {planExpired && (
            <ListItemLink
              to="/quick-messages"
              primary="Respuestas rápidas"
              icon={<FlashOnIcon />}
              tooltip={collapsed}
            />
          )}

          {planExpired && (
            <ListItemLink
              to="/contacts"
              primary="Contactos"
              icon={<ContactPhoneIcon />}
              tooltip={collapsed}
            />
          )}

          {showSchedules && planExpired && (
            <ListItemLink
              to="/schedules"
              primary="Agendamientos"
              icon={<ScheduleIcon />}
              tooltip={collapsed}
            />
          )}

          {planExpired && (
            <ListItemLink
              to="/tags"
              primary="Etiquetas"
              icon={<LocalOfferIcon />}
              tooltip={collapsed}
            />
          )}

          {showInternalChat && planExpired && (
            <ListItemLink
              to="/chats"
              primary="Chat interno"
              icon={
                <Badge color="secondary" variant="dot" invisible={invisible} className={classes.badge}>
                  <ForumIcon />
                </Badge>
              }
              tooltip={collapsed}
            />
          )}
        </Collapse>

        {/* Separador */}
        <div className={classes.menuSeparator} />

        {/* === CAMPANHAS === */}
        {showCampaigns && planExpired && (
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <>
                <Tooltip 
                  title={collapsed ? "Campañas" : ""} 
                  placement="right" 
                  arrow
                  classes={{ tooltip: classes.tooltip }}
                >
                  <ListItem
                    button
                    onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                    className={`${classes.menuHeader} ${isCampaignRouteActive ? "active" : ""}`}
                  >
                    <ListItemIcon>
                      <div className={`${classes.menuHeaderIcon} campaigns`}>
                        <CampaignIcon />
                      </div>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography className={`${classes.menuHeaderText} ${isCampaignRouteActive ? "active" : ""}`}>
                          Campañas
                        </Typography>
                      }
                    />
                    {openCampaignSubmenu ? 
                      <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
                      <ExpandMoreIcon className={classes.expandIcon} />
                    }
                  </ListItem>
                </Tooltip>
                <Collapse in={openCampaignSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
                  <ListItemLink
                    to="/campaigns"
                    primary="Lista de campañas"
                    icon={<ListAltIcon />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/contact-lists"
                    primary="Lista de contactos"
                    icon={<PeopleIcon />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/campaigns-config"
                    primary="Configuraciones"
                    icon={<SettingsIcon />}
                    tooltip={collapsed}
                  />
                </Collapse>
              </>
            )}
          />
        )}

        {/* === FLUXOS === */}
        {planExpired && (
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <>
                <Tooltip 
                  title={collapsed ? "Flujos" : ""} 
                  placement="right" 
                  arrow
                  classes={{ tooltip: classes.tooltip }}
                >
                  <ListItem
                    button
                    onClick={() => setOpenFlowSubmenu((prev) => !prev)}
                    className={`${classes.menuHeader} ${isFlowbuilderRouteActive ? "active" : ""}`}
                  >
                    <ListItemIcon>
                      <div className={`${classes.menuHeaderIcon} flows`}>
                        <WebhookIcon />
                      </div>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography className={`${classes.menuHeaderText} ${isFlowbuilderRouteActive ? "active" : ""}`}>
                          Constructor de flujos
                        </Typography>
                      }
                    />
                    {openFlowSubmenu ? 
                      <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
                      <ExpandMoreIcon className={classes.expandIcon} />
                    }
                  </ListItem>
                </Tooltip>
                <Collapse in={openFlowSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
                  <ListItemLink
                    to="/phrase-lists"
                    primary="Flujo de campaña"
                    icon={<CampaignIcon />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/flowbuilders"
                    primary="Flujo de conversación"
                    icon={<ShapeLineIcon />}
                    tooltip={collapsed}
                  />
                </Collapse>
              </>
            )}
          />
        )}

        {/* === FERRAMENTAS === */}
        <Tooltip 
          title={collapsed ? "Herramientas" : ""} 
          placement="right" 
          arrow
          classes={{ tooltip: classes.tooltip }}
        >
          <ListItem
            button
            onClick={() => setOpenToolsSubmenu((prev) => !prev)}
            className={`${classes.menuHeader} ${isToolsActive ? "active" : ""}`}
          >
            <ListItemIcon>
              <div className={`${classes.menuHeaderIcon} tools`}>
                <BuildIcon />
              </div>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography className={`${classes.menuHeaderText} ${isToolsActive ? "active" : ""}`}>
                  Herramientas
                </Typography>
              }
            />
            {openToolsSubmenu ? 
              <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
              <ExpandMoreIcon className={classes.expandIcon} />
            }
          </ListItem>
        </Tooltip>
        <Collapse in={openToolsSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
          {showExternalApi && planExpired && (
            <ListItemLink
              to="/messages-api"
              primary="API de mensajes"
              icon={<CodeIcon />}
              tooltip={collapsed}
            />
          )}

          {showKanban && planExpired && (
            <ListItemLink
              to="/kanban"
              primary="Kanban"
              icon={<ViewKanbanIcon />}
              tooltip={collapsed}
            />
          )}

          <ListItemLink
            to="/todolist"
            primary="Lista de tareas"
            icon={<EventAvailableIcon />}
            tooltip={collapsed}
          />

          <ListItemLink
            to="/helps"
            primary="Ayuda"
            icon={<HelpOutlineIcon />}
            tooltip={collapsed}
          />

          <ListItemLink
            to="/documentacao"
            primary="Documentación"
            icon={<DescriptionIcon />}
            tooltip={collapsed}
          />
        </Collapse>

        {/* Separador */}
        <div className={classes.menuSeparator} />

        {/* === ADMINISTRAÇÃO === */}
        <Can
          role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              <Tooltip 
                title={collapsed ? "Administración" : ""} 
                placement="right" 
                arrow
                classes={{ tooltip: classes.tooltip }}
              >
                <ListItem
                  button
                  onClick={() => setOpenAdministrationSubmenu((prev) => !prev)}
                  className={`${classes.menuHeader} ${isAdministrationActive ? "active" : ""}`}
                >
                  <ListItemIcon>
                    <div className={`${classes.menuHeaderIcon} admin`}>
                      <SettingsIcon />
                    </div>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={`${classes.menuHeaderText} ${isAdministrationActive ? "active" : ""}`}>
                        Administración
                      </Typography>
                    }
                  />
                  {openAdministrationSubmenu ? 
                    <ExpandLessIcon className={`${classes.expandIcon} expanded`} /> : 
                    <ExpandMoreIcon className={classes.expandIcon} />
                  }
                </ListItem>
              </Tooltip>
              <Collapse in={openAdministrationSubmenu} timeout="auto" unmountOnExit className={classes.submenu}>
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    primary="Avisos"
                    icon={<AnnouncementIcon />}
                    tooltip={collapsed}
                  />
                )}

                {planExpired && (
                  <ListItemLink
                    to="/users"
                    primary="Usuarios"
                    icon={<PeopleIcon />}
                    tooltip={collapsed}
                  />
                )}

                {planExpired && (
                  <ListItemLink
                    to="/queues"
                    primary="Colas"
                    icon={<AccountTreeIcon />}
                    tooltip={collapsed}
                  />
                )}

                {showOpenAi && planExpired && (
                  <ListItemLink
                    to="/prompts"
                    primary="Prompts de IA"
                    icon={<AllInclusiveIcon />}
                    tooltip={collapsed}
                  />
                )}

                {showIntegrations && planExpired && (
                  <ListItemLink
                    to="/queue-integration"
                    primary="Integración de colas"
                    icon={<DeviceHubIcon />}
                    tooltip={collapsed}
                  />
                )}

                {planExpired && (
                  <Can
                    role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                    perform={"drawer-admin-items:view"}
                    yes={() => (
                      <ListItemLink
                        to="/connections"
                        primary="Conexiones"
                        icon={<SyncAltIcon />}
                        showBadge={connectionWarning}
                        tooltip={collapsed}
                      />
                    )}
                  />
                )}

                {user.super && (
                  <ListItemLink
                    to="/allConnections"
                    primary="Todas las conexiones"
                    icon={<SyncAltIcon />}
                    tooltip={collapsed}
                  />
                )}

                {planExpired && (
                  <ListItemLink
                    to="/files"
                    primary="Archivos"
                    icon={<AttachFileIcon />}
                    tooltip={collapsed}
                  />
                )}

                <ListItemLink
                  to="/financeiro"
                  primary="Finanzas"
                  icon={<LocalAtmIcon />}
                  tooltip={collapsed}
                />

                {planExpired && (
                  <ListItemLink
                    to="/settings"
                    primary="Configuraciones"
                    icon={<SettingsIcon />}
                    tooltip={collapsed}
                  />
                )}

                {user.super && (
                  <ListItemLink
                    to="/companies"
                    primary="Empresas"
                    icon={<BusinessIcon />}
                    tooltip={collapsed}
                  />
                )}
              </Collapse>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default MainListItems;