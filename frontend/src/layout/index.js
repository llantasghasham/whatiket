import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";
// import moment from "moment";

// import { isNill } from "lodash";
// import SoftPhone from "react-softphone";
// import { WebSocketInterface } from "jssip";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  // FormControl,
  Badge,
  withStyles,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";

// Ícones modernizados e elegantes
import MenuIcon from "@material-ui/icons/Menu"; // Manter o menu padrão compatível
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AutorenewIcon from "@material-ui/icons/Autorenew"; // Ícone mais dinâmico para refresh
import EmailIcon from "@material-ui/icons/Email"; // Manter email padrão por compatibilidade
import CodeIcon from "@material-ui/icons/Code"; // Manter code padrão por compatibilidade
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined"; // Info mais elegante
import FacebookIcon from "@material-ui/icons/Facebook";
import YouTubeIcon from "@material-ui/icons/YouTube";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder"; // Relógio mais moderno
import UpdateIcon from "@material-ui/icons/Update";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined"; // Avatar outlined
import ScheduleIcon from "@material-ui/icons/Schedule";
import DashboardIcon from "@material-ui/icons/Dashboard"; // Ícone compatível para versão

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
// import DarkMode from "../components/DarkMode";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import logo from "../assets/logo.png";
import logoDark from "../assets/logo-black.png";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";

import ColorModeContext from "./themeContext";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import VersionControl from "../components/VersionControl";

// import { SocketContext } from "../context/Socket/SocketContext";

const backendUrl = getBackendUrl();

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary,
      border:
        theme.mode === "light"
          ? "1px solid rgba(0 124 102)"
          : "1px solid rgba(255, 255, 255, 0.5)",
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary,
    },
  },
  chip: {
    background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
    height: "28px",
    boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
    border: "none",
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    color: theme.palette.dark.main,
    boxShadow: "none",
    borderRadius: 0,
    background: theme.palette.barraSuperior,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
  },
  clock: {
    color: "#ffd700", // Dourado mais elegante
    fontSize: 14,
    marginLeft: 16,
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px", // Espaço ligeiramente maior
  },
  clockIcon: {
    fontSize: "20px", // Ligeiramente maior
    color: "#ffd700",
    animation: "$clockPulse 3s infinite",
    filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    boxShadow: "none",
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
    color: "white",
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "hidden",
  },

  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  containerWithScroll: {
    flex: 1,
    overflowY: "scroll",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    borderRadius: "8px",
    border: "2px solid transparent",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "-ms-overflow-style": "none",
    "scrollbar-width": "none",
  },
  NotificationsPopOver: {
    // color: theme.barraSuperior.secondary.main,
  },
  logo: {
    width: "100%",
    height: "45px",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "100%",
      maxWidth: 180,
    },
    logo: theme.logo,
    content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")"
  },
  hideLogo: {
    display: "none",
  },
  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease",
    "&:hover": {
      border: "2px solid rgba(255, 255, 255, 0.6)",
      transform: "scale(1.05)",
    },
  },
  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutDialog: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "16px",
    padding: theme.spacing(4),
    maxWidth: "500px",
  },
  aboutTitle: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    textAlign: "center",
    fontSize: "1.5rem",
  },
  aboutContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  aboutItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: "12px",
    backgroundColor: theme.palette.background.default,
    border: "1px solid",
    borderColor: theme.palette.divider,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  aboutIcon: {
    color: theme.palette.primary.main,
    minWidth: "40px",
    fontSize: "24px",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  },
  aboutLink: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.2s ease",
    "&:hover": {
      textDecoration: "underline",
      color: theme.palette.secondary.main,
    },
  },
  versionText: {
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    marginTop: theme.spacing(2),
    textAlign: "center",
    fontWeight: "500",
  },
  headerButton: {
    color: "white",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      transform: "scale(1.05)",
    },
  },
  modernRefreshButton: {
    color: "white",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      transform: "rotate(180deg) scale(1.1)",
    },
    "&:active": {
      transform: "rotate(360deg) scale(1.05)",
    },
  },
  modernMenuButton: {
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    marginRight: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      transform: "scale(1.08)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  userMenu: {
    "& .MuiPaper-root": {
      borderRadius: "16px",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      marginTop: theme.spacing(1),
      backdropFilter: "blur(10px)",
    },
    "& .MuiMenuItem-root": {
      padding: "14px 24px",
      fontSize: "14px",
      borderRadius: "8px",
      margin: "4px 8px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(102, 126, 234, 0.12)",
        transform: "translateX(4px)",
      },
    },
  },
  // Animações modernizadas
  "@keyframes clockPulse": {
    "0%, 100%": {
      transform: "scale(1)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.15)",
      opacity: 0.85,
    },
  },
  "@keyframes iconGlow": {
    "0%, 100%": {
      filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))",
    },
    "50%": {
      filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))",
    },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userToken, setUserToken] = useState("disabled");
  const [loadingUserToken, setLoadingUserToken] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user, socket } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [aboutOpen, setAboutOpen] = useState(false);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const getSetting = async () => {
      const response = await settings.get("wtV");

      if (response) {
        setUserToken("disabled");
      } else {
        setUserToken("disabled");
      }
    };

    // getSetting();
  });

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;
    if (companyId) {
      const ImageUrl = user.profileImage;
      if (ImageUrl !== undefined && ImageUrl !== null)
        setProfileUrl(
          `${backendUrl}/public/company${companyId}/user/${ImageUrl}`
        );
      else setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`);

      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toastError("Sua conta foi acessada em outro computador.");
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1000);
        }
      }

      socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);

      socket.emit("userStatus");
      const interval = setInterval(() => {
        socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => {
        socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
        clearInterval(interval);
      };
    }
  }, [socket]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleOpenAbout = () => {
    setAboutOpen(true);
    handleCloseMenu();
  };

  const handleCloseAbout = () => {
    setAboutOpen(false);
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img className={drawerOpen ? classes.logo : classes.hideLogo}
            style={{
              display: "block",
              margin: "0 auto",
              height: "50px",
              width: "100%",
            }}
            alt="logo" />
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          <MainListItems collapsed={!drawerOpen} />
        </List>
        <Divider />
      </Drawer>

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            variant="contained"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(classes.modernMenuButton, drawerOpen && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {greaterThenSm &&
              user?.profile === "admin" &&
              user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>! (
                {i18n.t("mainDrawer.appBar.user.active")}{" "}
                {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {userToken === "enabled" && user?.companyId === 1 && (
            <Chip
              className={classes.chip}
              label={i18n.t("mainDrawer.appBar.user.token")}
            />
          )}
          
          {/* Relógio modernizado com ícone elegante */}
          <div className={classes.clock}>
            <QueryBuilderIcon className={classes.clockIcon} />
            <Typography component="span" style={{ fontSize: 14, fontWeight: "600" }}>
              {currentTime}
            </Typography>
          </div>

          <NotificationsVolume setVolume={setVolume} volume={volume} />

          {/* Botão de refresh ultra moderno */}
          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            className={classes.modernRefreshButton}
            title="Atualizar página"
          >
            <AutorenewIcon />
          </IconButton>

          {user.id && <NotificationsPopOver volume={volume} />}

          <AnnouncementsPopover />

          <ChatPopover />

          <div>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              onClick={handleMenu}
            >
              <Avatar
                alt="User Avatar"
                className={classes.avatar2}
                src={profileUrl}
              />
            </StyledBadge>

            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
              className={classes.userMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleOpenAbout}>
                Sobre
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        {children ? children : null}
      </main>

      {/* About Dialog com ícones modernos */}
      <Dialog
        open={aboutOpen}
        onClose={handleCloseAbout}
        aria-labelledby="about-dialog-title"
        PaperProps={{
          className: classes.aboutDialog,
        }}
      >
        <DialogTitle id="about-dialog-title" className={classes.aboutTitle}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <InfoOutlinedIcon style={{ marginRight: 8 }} />
            Información del Sistema
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box className={classes.aboutContent}>
            <Box className={classes.aboutItem}>
              <CodeIcon className={classes.aboutIcon} />
              <Typography><strong>Desarrollador:</strong> ProgramaTICxa2</Typography>
            </Box>
            <Box className={classes.aboutItem}>
              <EmailIcon className={classes.aboutIcon} />
              <Typography>
                <strong>Email:</strong>{" "}
                <Link
                  href="mailto:contato@conectai.cloud"
                  className={classes.aboutLink}
                >
                admin@aprogramaticxa2.dev
                </Link>
              </Typography>
            </Box>
            <Box className={classes.aboutItem}>
              <WhatsAppIcon className={classes.aboutIcon} />
              <Typography>
                <strong>WhatsApp:</strong>{" "}
                <Link
                  href="https://wa.me/57359412689"
                  target="_blank"
                  rel="noopener"
                  className={classes.aboutLink}
                >
                  +57 341097865236
                </Link>
              </Typography>
            </Box>
            <Box className={classes.aboutItem}>
              <DashboardIcon className={classes.aboutIcon} />
              <Typography><strong>Versión:</strong> 1.92</Typography>
            </Box>
          </Box>
          <Typography variant="body2" className={classes.versionText}>
            2025 - Todos los derechos reservados
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbout} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LoggedInLayout;