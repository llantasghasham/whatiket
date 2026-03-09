import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { i18n } from "../translate/i18n";
import { useHistory, useLocation } from "react-router-dom";
import {
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Collapse,
} from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";

// Ícones
import DashboardIcon from "@material-ui/icons/Dashboard";
import PeopleIcon from "@material-ui/icons/People";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SettingsIcon from "@material-ui/icons/Settings";
import ContactsIcon from "@material-ui/icons/Contacts";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import GroupIcon from "@material-ui/icons/Group";
import SmartToyIcon from "@material-ui/icons/Android";
import ViewListIcon from "@material-ui/icons/ViewList";
import BarChartIcon from "@material-ui/icons/BarChart";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import BuildIcon from "@material-ui/icons/Build";
import BusinessIcon from "@material-ui/icons/Business";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import NotificationsIcon from "@material-ui/icons/Notifications";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import RefreshIcon from "@material-ui/icons/Refresh";
import SyncIcon from "@material-ui/icons/Sync";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CachedIcon from "@material-ui/icons/Cached";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import PersonIcon from "@material-ui/icons/Person";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ListAltIcon from "@material-ui/icons/ListAlt";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TuneIcon from "@material-ui/icons/Tune";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import FolderIcon from "@material-ui/icons/Folder";
import ShareIcon from "@material-ui/icons/Share";
import ChatIcon from "@material-ui/icons/Chat";
import ExtensionIcon from "@material-ui/icons/Extension";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import VideoLibraryIcon from "@material-ui/icons/VideoLibrary";
import PhotoIcon from "@material-ui/icons/Photo";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import QueueIcon from "@material-ui/icons/Queue";
import PhoneIcon from "@material-ui/icons/Phone";
import LabelIcon from "@material-ui/icons/Label";
import SearchIcon from "@material-ui/icons/Search";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import GavelIcon from "@material-ui/icons/Gavel";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";

import { AuthContext } from "../context/Auth/AuthContext";
import ColorModeContext from "./themeContext";
import { usePlanPermissions } from "../context/PlanPermissionsContext";
import { usePagePermissions } from "../context/PagePermissionsContext";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import SearchTicketModal from "../components/SearchTicketModal";
import UserLanguageSelector from "../components/UserLanguageSelector";
import { getBackendUrl } from "../config";
import f002Image from "../assets/f002.png";
import logo from "../assets/logo.png";
import ColorModeContext from "./themeContext";
import { useSystemAlert } from "../components/SystemAlert";

const backendUrl = getBackendUrl();

const MANAGER_DENIED_PATHS = new Set(["/financeiro"]);
const PROFESSIONAL_ALLOWED_PATHS = new Set([
  "/atendimentos",
  "/chamadas",
  "/kanban",
  "/funil",
  "/etiquetas",
  "/user-schedules",
  "/consultas/dados",
  "/consultas/dividas-credito",
  "/consultas/juridico",
  "/consultas/veiculo",
  "/contatos",
  "/clientes",
  "/leads",
  "/helps"
]);
const ATTENDANT_ALLOWED_PATHS = new Set([
  "/atendimentos",
  "/chamadas",
  "/kanban",
  "/funil",
  "/etiquetas",
  "/user-schedules",
  "/consultas/dados",
  "/consultas/dividas-credito",
  "/consultas/juridico",
  "/consultas/veiculo",
  "/contatos",
  "/helps"
]);

const normalizePath = (path = "") => path.toLowerCase();

const collapsedDrawerWidth = 72;
const expandedDrawerWidth = 220;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f8f9fa",
  },
  // Header Styles - Fundo transparente
  appBar: (props) => ({
    backgroundColor: "transparent !important",
    background: "transparent !important",
    color: "#3b82f6",
    boxShadow: "none !important",
    borderBottom: "none",
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: props.drawerWidth,
    width: `calc(100% - ${props.drawerWidth}px)`,
    transition: "margin-left 0.2s ease, width 0.2s ease",
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
      width: "100%",
    },
  }),
  toolbar: {
    minHeight: "64px",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },
  menuButton: {
    display: "none",
    color: "#3b82f6",
  },
  hamburgerButton: (props) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    color: "#ffffff",
    backgroundColor: props.primaryColor || "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      color: "#ffffff",
    },
    "&:hover": {
      backgroundColor: props.primaryColor || "#2563eb",
      filter: "brightness(0.9)",
      transform: "scale(1.05)",
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }),
  searchContainer: {
    position: "relative",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    width: "100%",
    maxWidth: "400px",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  mobileLogo: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      alignItems: "center",
      height: "40px",
      "& img": {
        height: "36px",
        width: "auto",
      },
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000000",
  },
  searchButton: (props) => ({
    position: "absolute",
    right: "4px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: props.primaryColor || "#3b82f6",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px",
    minWidth: "36px",
    height: "36px",
    "&:hover": {
      backgroundColor: props.primaryColor || "#2563eb",
      filter: "brightness(0.9)",
    },
  }),
  inputRoot: {
    color: "#3b82f6",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1.5, 6, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: "14px",
    color: "#3b82f6",
    "&::placeholder": {
      color: "#000000",
      opacity: 1,
    },
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    height: "100%",
  },
  iconButton: (props) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    color: "#ffffff",
    backgroundColor: props.primaryColor || "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      color: "#ffffff",
    },
    "&:hover": {
      backgroundColor: props.primaryColor || "#2563eb",
      filter: "brightness(0.9)",
      transform: "scale(1.05)",
    },
  }),
  avatar: (props) => ({
    width: "40px",
    height: "40px",
    cursor: "pointer",
    border: "2px solid #e5e7eb",
    backgroundColor: props.primaryColor || "#3b82f6",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: props.primaryColor || "#3b82f6",
      transform: "scale(1.05)",
    },
  }),
  // Sidebar Styles - Escuro com ícones
  drawer: (props) => ({
    width: props.drawerWidth,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }),
  drawerPaper: (props) => ({
    width: props.drawerWidth,
    backgroundColor: props.primaryColor || "#3b82f6",
    borderRight: "none",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 0,
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "none",
    transition: "width 0.2s ease, background-color 0.3s ease",
    [theme.breakpoints.down("md")]: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    "&::-webkit-scrollbar": {
      display: "none",
    },
  }),
  mobileDrawer: {
    [theme.breakpoints.up("lg")]: {
      display: "none",
    },
  },
  drawerHeader: (props) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: props.drawerWidth > collapsedDrawerWidth ? "flex-start" : "center",
    padding: props.drawerWidth > collapsedDrawerWidth ? "16px 12px" : "16px 0",
    minHeight: "64px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: props.primaryColor || "#3b82f6",
  }),
  logo: (props) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: props.drawerWidth > collapsedDrawerWidth ? "flex-start" : "center",
    cursor: "pointer",
    width: "100%",
  }),
  logoIcon: (props) => ({
    fontSize: props.drawerWidth > collapsedDrawerWidth ? "36px" : "32px",
    color: "#3b82f6",
    transition: "font-size 0.2s ease",
  }),
  logoText: {
    display: "none",
  },
  companyLogo: (props) => ({
    height: "36px",
    width: props.drawerWidth > collapsedDrawerWidth ? "160px" : "36px",
    objectFit: "contain",
    borderRadius: "8px",
    transition: "width 0.2s ease",
  }),
  faviconLogo: {
    height: "32px",
    width: "32px",
    objectFit: "contain",
    borderRadius: "6px",
  },
  sidebarContent: (props) => ({
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: props.drawerWidth > collapsedDrawerWidth ? "12px 8px" : "8px 0",
    width: "100%",
    boxSizing: "border-box",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  }),
  menuSectionLabel: (props) => ({
    display: props.drawerWidth > collapsedDrawerWidth ? "block" : "none",
    fontSize: "0.68rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "12px 16px 4px",
  }),
  menuList: (props) => ({
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: props.drawerWidth > collapsedDrawerWidth ? "stretch" : "center",
    gap: "4px",
  }),
  menuItem: (props) => ({
    padding: props.drawerWidth > collapsedDrawerWidth ? "10px 14px" : "12px",
    margin: "0",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    minHeight: "auto",
    width: props.drawerWidth > collapsedDrawerWidth ? "100%" : "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: props.drawerWidth > collapsedDrawerWidth ? "flex-start" : "center",
    gap: props.drawerWidth > collapsedDrawerWidth ? "12px" : 0,
    "&:hover": {
      backgroundColor: props.sidebarHoverBg || "rgba(59, 130, 246, 0.1)",
      "& .MuiListItemIcon-root": {
        color: props.sidebarActiveColor || "#000000",
      },
    },
    "&.active": {
      backgroundColor: props.sidebarActiveBg || "rgba(59, 130, 246, 0.15)",
      "& .MuiListItemIcon-root": {
        color: props.sidebarActiveColor || "#000000",
      },
    },
  }),
  menuIcon: (props) => ({
    minWidth: props.drawerWidth > collapsedDrawerWidth ? "auto" : "initial",
    color: props.sidebarIconColor || "#ffffff",
    margin: props.drawerWidth > collapsedDrawerWidth ? "0 0 0 4px" : 0,
    "& .MuiSvgIcon-root": {
      fontSize: "22px",
    },
  }),
  menuText: (props) => ({
    display: props.drawerWidth > collapsedDrawerWidth ? "block" : "none",
    color: props.sidebarTextColor || "#f1f5f9",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "0.2px",
  }),
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ef4444",
      color: "#ffffff",
      fontSize: "10px",
      minWidth: "16px",
      height: "16px",
      top: "4px",
      right: "4px",
    },
  },
  menuDivider: (props) => ({
    width: props.drawerWidth > collapsedDrawerWidth ? "80%" : "32px",
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: props.drawerWidth > collapsedDrawerWidth ? "12px auto" : "8px auto",
  }),
  submenuParent: (props) => ({
    padding: props.drawerWidth > collapsedDrawerWidth ? "10px 14px" : "12px",
    margin: "0",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    minHeight: "auto",
    width: props.drawerWidth > collapsedDrawerWidth ? "100%" : "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: props.drawerWidth > collapsedDrawerWidth ? "flex-start" : "center",
    gap: props.drawerWidth > collapsedDrawerWidth ? "12px" : 0,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: props.sidebarHoverBg || "rgba(59, 130, 246, 0.1)",
      "& .MuiListItemIcon-root": {
        color: props.sidebarActiveColor || "#000000",
      },
    },
    "&.active": {
      backgroundColor: props.sidebarActiveBg || "rgba(59, 130, 246, 0.08)",
    },
  }),
  submenuExpandIcon: (props) => ({
    color: props.sidebarIconColor ? (props.sidebarIconColor + "99") : "rgba(255, 255, 255, 0.6)",
    fontSize: "18px",
    marginLeft: "auto",
    display: props.drawerWidth > collapsedDrawerWidth ? "block" : "none",
    transition: "transform 0.2s ease",
  }),
  submenuList: (props) => ({
    paddingLeft: props.drawerWidth > collapsedDrawerWidth ? "20px" : 0,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  submenuItem: (props) => ({
    padding: props.drawerWidth > collapsedDrawerWidth ? "6px 14px 6px 16px" : "8px",
    margin: "0",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    minHeight: "auto",
    width: props.drawerWidth > collapsedDrawerWidth ? "100%" : "40px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: props.drawerWidth > collapsedDrawerWidth ? "flex-start" : "center",
    "&:hover": {
      backgroundColor: props.sidebarHoverBg || "rgba(59, 130, 246, 0.1)",
    },
    "&.active": {
      backgroundColor: "transparent",
    },
  }),
  submenuText: (props) => ({
    display: props.drawerWidth > collapsedDrawerWidth ? "block" : "none",
    color: props.sidebarTextColor ? (props.sidebarTextColor + "d9") : "rgba(241, 245, 249, 0.85)",
    fontSize: "13px",
    fontWeight: 400,
    letterSpacing: "0.2px",
  }),
  submenuTextActive: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -2,
      left: 0,
      width: "20px",
      height: "2px",
      backgroundColor: "#ffffff",
      borderRadius: "1px",
    },
  },
  // Content Styles
  content: (props) => ({
    flex: 1,
    overflow: "auto",
    marginTop: props.shouldHideLayout ? 0 : "64px",
    backgroundColor: "#f8f9fa",
    height: props.shouldHideLayout ? "100vh" : "calc(100vh - 64px)",
    transition: "width 0.2s ease",
    [theme.breakpoints.down("md")]: {
      marginTop: props.shouldHideLayout ? 0 : "64px",
      height: props.shouldHideLayout ? "100vh" : "calc(100vh - 64px)",
    },
  }),
  // Mobile Bottom Navigation
  mobileBottomNav: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "70px",
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e5e7eb",
      justifyContent: "space-around",
      alignItems: "center",
      zIndex: theme.zIndex.drawer + 2,
      padding: "0 8px",
      paddingBottom: "env(safe-area-inset-bottom)",
      boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
    },
  },
  mobileNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#000000",
    minWidth: "56px",
    "&:hover": {
      backgroundColor: "rgba(59, 130, 246, 0.08)",
    },
    "&.active": {
      color: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.12)",
      "& $mobileNavIcon": {
        color: "#3b82f6",
      },
      "& $mobileNavLabel": {
        color: "#3b82f6",
        fontWeight: 600,
      },
    },
  },
  mobileNavIcon: {
    fontSize: "24px",
    marginBottom: "2px",
  },
  mobileNavLabel: {
    fontSize: "10px",
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1.2,
  },
  mobileNavHomeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    marginTop: "-20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  mobileNavHomeIcon: {
    fontSize: "28px",
  },
  contentWithMobileNav: {
    [theme.breakpoints.down("sm")]: {
      paddingBottom: "-80px",
    },
  },
  hideOnMobile: {
    [theme.breakpoints.down("sm")]: {
      display: "none !important",
    },
  },
  // Menu Dropdown
  dropdownMenu: {
    marginTop: "8px",
    "& .MuiPaper-root": {
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e5e7eb",
    },
  },
  dropdownItem: {
    padding: "12px 16px",
    fontSize: "14px",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  dropdownIcon: {
    minWidth: "36px",
    color: "#6b7280",
  },
  divider: {
    margin: "8px 0",
    backgroundColor: "#e5e7eb",
  },
  // Estilos do Banner IA SDR
  aiSdrBanner: {
    margin: "16px 12px 20px 12px",
    padding: "0",
    background: "#2a2a2a",
    borderRadius: "12px",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    position: "relative",
    overflow: "hidden",
  },
  bannerContent: {
    padding: "16px",
    position: "relative",
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "white !important",
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  bannerSubtitle: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.7) !important",
    lineHeight: "1.4",
    fontWeight: "400",
    marginBottom: "12px",
  },
  bannerImage: {
    width: "100%",
    height: "120px",
    backgroundImage: `url(${f002Image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "8px",
    marginBottom: "12px",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
      borderRadius: "8px",
    },
  },
  bannerButton: {
    width: "100%",
    padding: "10px 16px",
    background: "#ffffff",
    border: "none",
    borderRadius: "8px",
    color: "#2a2a2a",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    "&:hover": {
      background: "#f0f0f0",
      transform: "translateY(-1px)",
    },
  },
}));

const LoggedInLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    return localStorage.getItem("sidebarPinned") === "true";
  });
  const [drawerExpanded, setDrawerExpanded] = useState(() => !isMobile || sidebarPinned);
  const drawerWidth = isMobile
    ? expandedDrawerWidth
    : drawerExpanded
      ? expandedDrawerWidth
      : collapsedDrawerWidth;
  const showMenuLabels = drawerWidth > collapsedDrawerWidth || isMobile;
  const primaryColor = theme.palette.primary.main || "#3b82f6";
  const history = useHistory();
  const location = useLocation();
  
  const { user, handleLogout, loading, isMobileSession } = useContext(AuthContext);
  const { planActive, loading: planLoading } = usePlanPermissions();
  const {
    canAccessPage,
    loading: permissionsLoading,
    pagePermissionsMode
  } = usePagePermissions();
  const { showAlert } = useSystemAlert();
  
  // Verificar se está no modo mobile app (via URL params)
  const urlParams = new URLSearchParams(location.search);
  const mobileApp = urlParams.get('mobileApp') === 'true';
  const hideHeader = urlParams.get('hideHeader') === 'true';
  const hideMenu = urlParams.get('hideMenu') === 'true';

  // Detectar se está na página atendimentomobile
  const isAtendimentosMobilePage = location.pathname.startsWith("/atendimentomobile");

  // Ocultar layout completamente se estiver na página atendimentomobile
  const shouldHideLayout = isAtendimentosMobilePage;
  
  const classes = useStyles({ 
    theme, 
    drawerWidth, 
    drawerExpanded, 
    isMobileSession, 
    primaryColor: theme?.palette?.primary?.main || "#3b82f6",
    shouldHideLayout,
    sidebarIconColor: theme?.sidebarIconColor || "#ffffff",
    sidebarTextColor: theme?.sidebarTextColor || "#f1f5f9",
    sidebarActiveBg: theme?.sidebarActiveBg || "rgba(59,130,246,0.15)",
    sidebarActiveColor: theme?.sidebarActiveColor || "#000000",
    sidebarHoverBg: theme?.sidebarHoverBg || "rgba(59,130,246,0.1)",
  });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    if (sidebarPinned) {
      setDrawerExpanded(true);
    } else {
      setDrawerExpanded(!isMobile);
    }
  }, [isMobile, sidebarPinned]);

  const handleToggleSidebarPin = () => {
    const newValue = !sidebarPinned;
    setSidebarPinned(newValue);
    localStorage.setItem("sidebarPinned", String(newValue));
    setDrawerExpanded(newValue || !isMobile);
  };

  useEffect(() => {
    if (user?.profileImage) {
      const nextUrl = `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}`;
      setProfileUrl((current) => (current !== nextUrl ? nextUrl : current));
    } else {
      setProfileUrl((current) => (current !== null ? null : current));
    }
  }, [user?.profileImage, user?.companyId]);

  // Sincronizar idioma del usuario al cargar (si no tiene preferencia, usar español)
  useEffect(() => {
    if (user) {
      const lang = user.language || "es";
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [user?.language, user?.id]);

  // RTL para árabe (العربية)
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    const html = document.documentElement;
    if (html.getAttribute("dir") !== dir) {
      html.setAttribute("dir", dir);
      html.setAttribute("lang", i18n.language || "es");
    }
  }, [i18n.language]);

  // BLOQUEIO PARA PLANOS VENCIDOS
  useEffect(() => {
    if (planLoading || loading) return;
    if (!planActive && !user?.company?.status && location.pathname !== "/financeiro") {
      history.push("/financeiro");
      showAlert({
        type: "warning",
        title: i18n.t("auth.planExpired.title"),
        message: i18n.t("auth.planExpired.message"),
        confirmText: i18n.t("auth.planExpired.confirmText"),
      });
    }
  }, [planActive, planLoading, loading, location.pathname, history, user?.company?.status]);

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
    setUserMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    setUserMenuOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Detectar se está dentro de uma conversa de ticket (para ocultar menu mobile e header)
  const isInsideTicketConversation =
    /\/tickets\/[a-zA-Z0-9-]+$/i.test(location.pathname) ||
    /\/atendimentos\/[a-zA-Z0-9-]+$/i.test(location.pathname);

  // Detectar se está no Flow Builder (para ocultar menu lateral)
  const isFlowBuilderPage = 
    location.pathname.startsWith("/flowbuilder/") && 
    location.pathname !== "/flowbuilder" && 
    location.pathname !== "/flowbuilder/";

  const menuGroups = useMemo(
    () => [
      {
        title: i18n.t("layout.menu.painel"),
        icon: <DashboardIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.dashboard"), path: "/painel", exact: true },
          { title: i18n.t("layout.menu.relatorios"), path: "/relatorios" },
        ],
      },
      {
        title: i18n.t("layout.menu.inbox"),
        icon: <ChatIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.conversas"), path: "/atendimentos" },
          { title: i18n.t("layout.menu.chamadas"), path: "/chamadas" },
        ],
      },
      {
        title: i18n.t("layout.menu.kanban"),
        icon: <ViewKanbanIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.kanban"), path: "/kanban" },
          { title: i18n.t("layout.menu.funil"), path: "/funil" },
          { title: i18n.t("layout.menu.etiquetas"), path: "/etiquetas" },
        ],
      },
      {
        title: i18n.t("layout.menu.consultas"),
        icon: <SearchIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.dados"), path: "/consultas/dados" },
          { title: i18n.t("layout.menu.dividasCredito"), path: "/consultas/dividas-credito" },
          { title: i18n.t("layout.menu.juridico"), path: "/consultas/juridico" },
          { title: i18n.t("layout.menu.veiculo"), path: "/consultas/veiculo" },
        ],
      },
      {
        title: i18n.t("layout.menu.usuarios"),
        icon: <GroupIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.contatos"), path: "/contatos" },
          { title: i18n.t("layout.menu.leads"), path: "/leads" },
          { title: i18n.t("layout.menu.clientes"), path: "/clientes" },
          { title: i18n.t("layout.menu.usuarios"), path: "/users" },
        ],
      },
      {
        title: i18n.t("layout.menu.automacao"),
        icon: <SmartToyIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.agenteIA"), path: "/agentes" },
          { title: i18n.t("layout.menu.construtorFluxo"), path: "/flowbuilders" },
          { title: i18n.t("layout.menu.disparos"), path: "/campanhas" },
          { title: i18n.t("layout.menu.campanhas"), path: "/phrase-lists" },
          { title: i18n.t("layout.menu.respostasRapidas"), path: "/quick-messages" },
          { title: i18n.t("layout.menu.integracoes"), path: "/integracao" },
          { title: i18n.t("layout.menu.ferramentas"), path: "/ferramentas" },
        ],
      },
      {
        title: i18n.t("layout.menu.produtividade"),
        icon: <TrendingUpIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.produtos"), path: "/produtos" },
          { title: i18n.t("layout.menu.catalogo"), path: "/catalogo-produtos" },
          { title: i18n.t("layout.menu.servicos"), path: "/servicos" },
          { title: i18n.t("layout.menu.ordensServico"), path: "/ordens-servico" },
          { title: i18n.t("layout.menu.agenda"), path: "/user-schedules" },
          { title: i18n.t("layout.menu.projetos"), path: "/projects" },
        ],
      },
      {
        title: i18n.t("layout.menu.ajuda"),
        icon: <HelpOutlineIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.ajuda"), path: "/helps" },
          { title: i18n.t("layout.menu.documentacao"), path: "/messages-api" },
        ],
      },
      {
        title: i18n.t("layout.menu.configuracoes"),
        icon: <SettingsIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.canais"), path: "/canais" },
          { title: i18n.t("layout.menu.departamentos"), path: "/departamentos" },
          { title: i18n.t("layout.menu.pagamentos"), path: "/payment-settings" },
          { title: i18n.t("layout.menu.faturas"), path: "/faturas" },
          { title: i18n.t("layout.menu.contasPagar"), path: "/financeiro-manager" },
        ],
      },
      {
        title: i18n.t("layout.menu.sistema"),
        icon: <BuildIcon />,
        disabled: !planActive && location.pathname !== "/financeiro",
        children: [
          { title: i18n.t("layout.menu.listaContatos"), path: "/contact-lists" },
          { title: i18n.t("layout.menu.importarContatos"), path: "/contatos/import" },
          { title: i18n.t("layout.menu.automacoes"), path: "/automations" },
          { title: i18n.t("layout.menu.financeiro"), path: "/financeiro" },
          { title: i18n.t("layout.menu.lembretes"), path: "/lembretes" },
          { title: i18n.t("layout.menu.configuracoes"), path: "/settings" },
          { title: i18n.t("layout.menu.meuPainelAfiliado"), path: "/afiliados" },
          { title: i18n.t("layout.menu.afiliados"), path: "/admin/afiliados", superAdmin: true },
          { title: i18n.t("layout.menu.cupons"), path: "/admin/cupons", superAdmin: true },
          { title: i18n.t("layout.menu.comissoes"), path: "/admin/comissoes", superAdmin: true },
          { title: i18n.t("layout.menu.saques"), path: "/admin/saques", superAdmin: true },
          { title: i18n.t("layout.menu.banners"), path: "/slider-banners", superAdmin: true },
          { title: i18n.t("layout.menu.videoTutorial"), path: "/tutorial-videos", superAdmin: true },
          { title: i18n.t("layout.menu.traducoes"), path: "/translation-manager", superAdmin: true },
          { title: i18n.t("layout.menu.whitelabel"), path: "/whitelabel", superAdmin: true },
          { title: i18n.t("layout.menu.empresas"), path: "/empresas", superAdmin: true },
          { title: i18n.t("layout.menu.planos"), path: "/planos", superAdmin: true },
        ],
      },
    ],
    [planActive, location.pathname, i18n.language]
  );

  const isAdmin = user?.profile === "admin";
  const isSuperAdmin = isAdmin && user?.companyId === 1 && user?.id === 1;
  const userRole = (user?.userType || "admin").toLowerCase();

  const roleAllowsPath = useCallback(
    (path) => {
      if (!path) return false;
      if (isSuperAdmin) return true;

      const normalizedPath = normalizePath(path);

      switch (userRole) {
        case "admin":
          return true;
        case "manager":
          return !MANAGER_DENIED_PATHS.has(normalizedPath);
        case "professional":
          return PROFESSIONAL_ALLOWED_PATHS.has(normalizedPath);
        case "attendant":
          return ATTENDANT_ALLOWED_PATHS.has(normalizedPath);
        default:
          return true;
      }
    },
    [isSuperAdmin, userRole]
  );

  const hasMenuAccess = useCallback(
    (path) => {
      if (!path) return false;
      if (!roleAllowsPath(path)) return false;
      if (isSuperAdmin) return true;

      if (pagePermissionsMode === "custom") {
        if (permissionsLoading) return false;
        return canAccessPage(path);
      }

      return true;
    },
    [roleAllowsPath, isSuperAdmin, pagePermissionsMode, permissionsLoading, canAccessPage]
  );

  const filteredMenuGroups = useMemo(() => {
    // Para todos os usuários (incluindo admins), filtrar baseado nas permissões de página
    // Super admins sempre têm acesso a tudo
    if (isSuperAdmin) return menuGroups;
    
    // Para admins normais e outros usuários, filtrar baseado nas permissões
    return menuGroups
      .map((group) => {
        if (!group.children) {
          return group.path && hasMenuAccess(group.path) ? group : null;
        }
        
        // Filtra os filhos baseado nas permissões de página
        const filtered = group.children.filter((child) => {
          // Se ainda estiver carregando as permissões, mostra tudo (para evitar flicker)
          if (permissionsLoading) return true;
          
          // Verifica se o usuário tem acesso à página
          const hasAccess = hasMenuAccess(child.path);
          if (!hasAccess) return false;

          // Para admins normais, ocultar itens superAdmin
          if (isAdmin && child.superAdmin) return false;
          
          return true;
        });
        
        // Se o grupo não tiver filhos após filtragem, não mostra o grupo
        if (filtered.length === 0) return null;
        
        return { ...group, children: filtered };
      })
      .filter(group => group !== null); // Remove grupos vazios
  }, [isAdmin, isSuperAdmin, menuGroups, canAccessPage, permissionsLoading]);

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Auto-expand the menu group that contains the current path
  useEffect(() => {
    filteredMenuGroups.forEach((group) => {
      if (group.children) {
        const hasActivePath = group.children.some(
          (child) => location.pathname === child.path || location.pathname.startsWith(child.path + "/")
        );
        if (hasActivePath) {
          setOpenMenus((prev) => ({ ...prev, [group.title]: true }));
        }
      }
    });
  }, [location.pathname, filteredMenuGroups]);

  const MenuItemWithTooltip = ({ path, icon, title, exact = false, disabled = false }) => {
    const isActive = exact
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + "/");

    const handleClick = (event) => {
      if (disabled) {
        event.preventDefault();
        showAlert({
          type: "warning",
          title: i18n.t("auth.planExpired.title"),
          message: i18n.t("auth.planExpired.message"),
          confirmText: i18n.t("auth.planExpired.confirmText"),
        });
        return;
      }
      
      // Verifica permissões de página (aplica para todos exceto super admins)
      if (!hasMenuAccess(path)) {
        event.preventDefault();
        showAlert({
          type: "error",
          title: "Acesso Negado",
          message: i18n.t("layout.noPermission"),
          confirmText: "Entendi",
        });
        return;
      }
      
      if (!isActive) {
        history.push(path);
      }
    };

    const item = (
      <ListItem
        button
        disabled={disabled}
        onClick={handleClick}
        className={`${classes.menuItem} ${isActive ? "active" : ""}`}
      >
        <ListItemIcon className={classes.menuIcon}>{icon}</ListItemIcon>
        {showMenuLabels && (
          <ListItemText
            primary={title}
            classes={{ primary: classes.menuText }}
          />
        )}
      </ListItem>
    );

    if (showMenuLabels) {
      return item;
    }

    return (
      <Tooltip title={title} placement="right" arrow>
        {item}
      </Tooltip>
    );
  };

  const DrawerContent = () => (
    <div>
      <div className={classes.drawerHeader}>
        <Tooltip title={i18n.t("layout.menu.painel")} placement="right">
          <div className={classes.logo} onClick={() => history.push("/painel")}>
            {showMenuLabels ? (
              (theme.appLogoLight || theme.calculatedLogoLight?.()) ? (
                <img
                  src={theme.calculatedLogoLight ? theme.calculatedLogoLight() : theme.appLogoLight}
                  alt="Logo"
                  className={classes.companyLogo}
                />
              ) : (
                <DashboardIcon className={classes.logoIcon} />
              )
            ) : (
              (theme.appLogoLoading || theme.appLogoFavicon) ? (
                <img
                  src={theme.appLogoLoading || theme.appLogoFavicon}
                  alt="Logo"
                  className={classes.faviconLogo}
                />
              ) : (
                <DashboardIcon className={classes.logoIcon} />
              )
            )}
          </div>
        </Tooltip>
      </div>

      <div className={classes.sidebarContent}>
        <List className={classes.menuList}>
          <div className={classes.menuSectionLabel}>Menu</div>
          {filteredMenuGroups.map((group) => {
            // Item sem submenu (ex: Kanban)
            if (!group.children) {
              return (
                <MenuItemWithTooltip
                  key={group.path}
                  path={group.path}
                  icon={group.icon}
                  title={group.title}
                  disabled={group.disabled}
                />
              );
            }

            // Item com submenu
            const isOpen = openMenus[group.title] || false;
            const hasActivePath = group.children.some(
              (child) => location.pathname === child.path || location.pathname.startsWith(child.path + "/")
            );

            const parentItem = (
              <ListItem
                button
                onClick={() => {
                  if (group.disabled) {
                    showAlert({
                      type: "warning",
                      title: i18n.t("auth.planExpired.title"),
                      message: i18n.t("auth.planExpired.messageFeature"),
                      confirmText: i18n.t("auth.planExpired.confirmText"),
                    });
                    return;
                  }
                  toggleMenu(group.title);
                }}
                className={`${classes.submenuParent} ${hasActivePath ? "active" : ""}`}
                disabled={group.disabled}
              >
                <ListItemIcon className={classes.menuIcon}>{group.icon}</ListItemIcon>
                {showMenuLabels && (
                  <>
                    <ListItemText
                      primary={group.title}
                      classes={{ primary: classes.menuText }}
                    />
                    {isOpen ? (
                      <ExpandLessIcon className={classes.submenuExpandIcon} />
                    ) : (
                      <ExpandMoreIcon className={classes.submenuExpandIcon} />
                    )}
                  </>
                )}
              </ListItem>
            );

            return (
              <div key={group.title}>
                {showMenuLabels ? (
                  parentItem
                ) : (
                  <Tooltip title={group.title} placement="right" arrow>
                    {parentItem}
                  </Tooltip>
                )}
                <Collapse in={isOpen && showMenuLabels} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={classes.submenuList}>
                    {group.children.map((child) => {
                      const isChildActive = child.exact
                        ? location.pathname === child.path
                        : location.pathname === child.path || location.pathname.startsWith(child.path + "/");

                      return (
                        <ListItem
                          button
                          key={child.path}
                          onClick={() => {
                            if (!isChildActive) history.push(child.path);
                          }}
                          className={`${classes.submenuItem} ${isChildActive ? "active" : ""}`}
                        >
                          <ListItemText
                            primary={child.title}
                            classes={{ primary: `${classes.submenuText} ${isChildActive ? classes.submenuTextActive : ""}` }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </div>
            );
          })}
          <div className={classes.menuSectionLabel}>Version 3.5.5</div>
        </List>
      </div>
    </div>
  );

  return (
    <div className={classes.root}>
      {/* Sidebar Desktop - Ocultar se estiver no modo mobile app */}
      {!shouldHideLayout && (
        <Drawer
          className={classes.drawer}
          variant="permanent"
          onMouseEnter={() => {
            if (!isMobile && !sidebarPinned) setDrawerExpanded(true);
          }}
          onMouseLeave={() => {
            if (!isMobile && !sidebarPinned) setDrawerExpanded(false);
          }}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Sidebar Mobile - Ocultar se estiver no modo mobile app */}
      {!shouldHideLayout && (
        <Drawer
          className={classes.mobileDrawer}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Header - Ocultar se estiver no modo mobile app */}
      {!shouldHideLayout && (
        <AppBar position="fixed" color="transparent" elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            {/* Seção Esquerda */}
            <div className={classes.headerLeft}>
              {/* Back Button - Visível apenas no Flow Builder */}
              {isFlowBuilderPage && (
              <IconButton
                className={classes.menuButton}
                onClick={() => history.push("/flowbuilders")}
                edge="start"
                title="Voltar para lista de fluxos"
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            
            {/* Menu Button Mobile - Oculto no Flow Builder */}
            {!isFlowBuilderPage && (
              <IconButton
                className={classes.menuButton}
                onClick={handleDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Hamburger Button - Desktop */}
            {!isFlowBuilderPage && !isMobile && (
              <IconButton
                className={classes.hamburgerButton}
                onClick={handleToggleSidebarPin}
                title={sidebarPinned ? "Recolher menu" : "Fixar menu aberto"}
              >
                {sidebarPinned ? <CloseIcon style={{ fontSize: 22 }} /> : <MenuIcon style={{ fontSize: 22 }} />}
              </IconButton>
            )}

            {/* Busca - Oculto no mobile */}
            <div 
              className={classes.searchContainer}
              onClick={() => setSearchModalOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder={i18n.t("layout.searchPlaceholder")}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                readOnly
                style={{ cursor: "pointer" }}
              />
              <Button className={classes.searchButton}>
                <SearchIcon style={{ fontSize: 18 }} />
              </Button>
            </div>

            {/* Logo - Visível apenas no mobile */}
            <div className={classes.mobileLogo}>
              {(theme.appLogoLight || theme.calculatedLogoLight?.()) ? (
                <img 
                  src={theme.calculatedLogoLight ? theme.calculatedLogoLight() : theme.appLogoLight} 
                  alt="Logo" 
                />
              ) : (
                <img src={logo} alt="Logo" />
              )}
            </div>
          </div>

          {/* Seção Direita */}
          <div className={classes.headerRight}>
            {/* Modo oscuro / claro */}
            <Tooltip title={theme.palette.type === "dark" ? (i18n.t("layout.darkMode.light") || "Modo claro") : (i18n.t("layout.darkMode.dark") || "Modo oscuro")}>
              <IconButton
                className={classes.iconButton}
                onClick={colorMode.toggleColorMode}
                aria-label={theme.palette.type === "dark" ? "Modo claro" : "Modo oscuro"}
              >
                {theme.palette.type === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Botão Refresh */}
            <IconButton
              className={classes.iconButton}
              onClick={handleRefreshPage}
              title={i18n.t("mainDrawer.appBar.user.refresh")}
            >
              <CachedIcon />
            </IconButton>

            {/* Volume */}
            <div className={classes.iconButton}>
              <NotificationsVolume setVolume={setVolume} volume={volume} />
            </div>

            {/* Idioma */}
            <UserLanguageSelector />

            {/* Avatar do Usuário */}
            <Avatar
              className={classes.avatar}
              src={profileUrl}
              onClick={handleUserMenuClick}
            >
              {!profileUrl && <PersonIcon />}
            </Avatar>
          </div>
        </Toolbar>
      </AppBar>
      )}

      {/* Menu do Usuário - Ocultar se estiver no modo mobile app */}
      {!shouldHideLayout && (
        <Menu
          anchorEl={anchorEl}
          open={userMenuOpen}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          className={classes.dropdownMenu}
        >
          <MenuItem onClick={handleOpenUserModal} className={classes.dropdownItem}>
            <ListItemIcon className={classes.dropdownIcon}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Meu Perfil" />
          </MenuItem>
          
          <Divider className={classes.divider} />
          
          <MenuItem onClick={handleLogoutClick} className={classes.dropdownItem}>
            <ListItemIcon className={classes.dropdownIcon}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary={isMobileSession ? "Sair do app" : "Sair"} />
          </MenuItem>
        </Menu>
      )}

      {/* Modal do Usuário - Ocultar se estiver no modo mobile app */}
      {!shouldHideLayout && userModalOpen && (
        <UserModal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
          userId={user?.id}
        />
      )}

      {/* Modal de Busca de Conversas */}
      <SearchTicketModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Conteúdo Principal */}
      <main className={`${classes.content} ${!isInsideTicketConversation && !isFlowBuilderPage && !isAtendimentosMobilePage ? classes.contentWithMobileNav : ""}`}>
        {children}
      </main>

      {/* Menu Mobile Fixo - Oculto no desktop, dentro de conversa de ticket, no Flow Builder e na página atendimentomobile */}
      {!isInsideTicketConversation && !isFlowBuilderPage && !isAtendimentosMobilePage && (
        <div className={classes.mobileBottomNav}>
          {/* Botão 1 - Painel */}
          <div
            className={`${classes.mobileNavItem} ${isActivePath("/painel") ? "active" : ""}`}
            onClick={() => history.push("/painel")}
          >
            <DashboardIcon className={classes.mobileNavIcon} />
            <span className={classes.mobileNavLabel}>{i18n.t("layout.menu.painel")}</span>
          </div>

          {/* Botão 2 - Contatos */}
          <div
            className={`${classes.mobileNavItem} ${isActivePath("/contatos") ? "active" : ""}`}
            onClick={() => history.push("/contatos")}
          >
            <ContactsIcon className={classes.mobileNavIcon} />
            <span className={classes.mobileNavLabel}>{i18n.t("layout.menu.contatos")}</span>
          </div>

          {/* Botão Home (Centro) - Tickets */}
          <div
            className={classes.mobileNavHomeBtn}
            onClick={() => history.push("/atendimentos")}
          >
            <ChatIcon className={classes.mobileNavHomeIcon} />
          </div>

          {/* Botão 4 - Canais */}
          <div
            className={`${classes.mobileNavItem} ${isActivePath("/canais") ? "active" : ""}`}
            onClick={() => history.push("/canais")}
          >
            <DeviceHubIcon className={classes.mobileNavIcon} />
            <span className={classes.mobileNavLabel}>{i18n.t("layout.menu.canais")}</span>
          </div>

          {/* Botão 5 - Relatórios */}
          <div
            className={`${classes.mobileNavItem} ${isActivePath("/relatorios") ? "active" : ""}`}
            onClick={() => history.push("/relatorios")}
          >
            <BarChartIcon className={classes.mobileNavIcon} />
            <span className={classes.mobileNavLabel}>{i18n.t("layout.menu.relatorios")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedInLayout;