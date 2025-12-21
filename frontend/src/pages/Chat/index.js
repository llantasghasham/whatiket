import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { i18n } from "../../translate/i18n";
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import { 
  Chat as ChatIcon,
  Assessment,
  TrendingUp,
  Message,
  People,
  FilterList,
  ExpandLess,
  ExpandMore,
  Clear
} from "@material-ui/icons";
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

  // ===== SEÇÃO DE FILTROS =====
  filterSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    cursor: "pointer",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid #e2e8f0",
  },

  filterTitle: {
    fontSize: "20px",
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

  mainCard: {
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
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  secondaryButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  dangerButton: {
    backgroundColor: "#ef4444",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  // ===== SEÇÃO DE CHAT =====
  chatSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: 0,
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    minHeight: "600px",
  },

  chatHeader: {
    padding: theme.spacing(3),
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },

  chatTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== GRID CONTAINER =====
  gridContainer: {
    height: "600px",
    backgroundColor: "white",
  },

  gridItem: {
    height: "100%",
    borderRight: "1px solid #e2e8f0",
    
    "&:last-child": {
      borderRight: "none",
    }
  },

  gridItemTab: {
    height: "92%",
    width: "100%",
  },

  btnContainer: {
    padding: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },

  // ===== TABS =====
  tabsContainer: {
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    
    "& .MuiTabs-root": {
      minHeight: "48px",
    },
    
    "& .MuiTab-root": {
      fontSize: "16px",
      fontWeight: 600,
      textTransform: "none",
      color: "#64748b",
      minHeight: "48px",
      
      "&.Mui-selected": {
        color: "#3b82f6",
      }
    },
    
    "& .MuiTabs-indicator": {
      backgroundColor: "#3b82f6",
      height: "3px",
    }
  },

  // ===== MODAL =====
  dialog: {
    "& .MuiPaper-root": {
      borderRadius: "20px",
      maxWidth: "600px",
    }
  },

  dialogHeader: {
    padding: theme.spacing(3),
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  dialogTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  dialogContent: {
    padding: theme.spacing(3),
  },

  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: theme.spacing(2),
  },

  // ===== CAMPOS DE TEXTO =====
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

  // ===== TOGGLE BUTTON =====
  toggleButton: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    padding: theme.spacing(1),
    borderRadius: "8px",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#f1f5f9",
      color: "#3b82f6",
    },
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit") {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
        });
        handleLoadNewChat(data);
        window.location.reload(); // Recarrega a página após salvar um novo chat
      }
      handleClose();
    } catch (err) { }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.dialog}
    >
      <DialogTitle className={classes.dialogHeader}>
        <Typography className={classes.dialogTitle}>
          {i18n.t("chatInternal.modal.title")}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Grid spacing={3} container>
          <Grid xs={12} item>
            <TextField
              label="Título"
              placeholder="Digite el título del chat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              className={classes.modernTextField}
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleClose}
          startIcon={<CancelIcon />}
          className={clsx(classes.modernButton, classes.dangerButton)}
        >
          {i18n.t("chatInternal.modal.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          startIcon={<SaveIcon />}
          className={clsx(classes.modernButton, classes.secondaryButton)}
          variant="contained"
          disabled={users === undefined || users.length === 0 || title === null || title === "" || title === undefined}
        >
          {i18n.t("chatInternal.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  // Estatísticas calculadas
  const totalChats = chats.length;
  const totalMessages = messages.length;
  const activeChats = chats.filter(chat => chat.updatedAt && 
    new Date(chat.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const myChats = chats.filter(chat => 
    chat.users && chat.users.some(u => u.user.id === user.id)
  ).length;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = user.companyId;

    const onChatUser = (data) => {
      console.log(data)
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        }));
      }
    }
    const onChat = (data) => {
      if (data.action === "delete") {
        setChats((prev) => prev.filter((c) => c.id !== +data.id));
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    }

    const onCurrentChat = (data) => {
      if (data.action === "new-message") {
        setMessages((prev) => [...prev, data.newMessage]);
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.newMessage.chatId) {
            return {
              ...data.chat,
            };
          }
          return chat;
        }));
        if (scrollToBottomRef.current) {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 100);
        }
      }

      if (data.action === "update") {
        setChats((prev) => prev.map((chat) => {
          if (chat.id === data.chat.id) {
            return {
              ...data.chat,
            };
          }
          return chat;
        }));
        if (scrollToBottomRef.current) {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 100);
        }
      }
    }

    socket.on(`company-${companyId}-chat-user-${user.id}`, onChatUser);
    socket.on(`company-${companyId}-chat`, onChat);
    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
    }

    return () => {
      socket.off(`company-${companyId}-chat-user-${user.id}`, onChatUser);
      socket.off(`company-${companyId}-chat`, onChat);
      if (isObject(currentChat) && has(currentChat, "id")) {
        socket.off(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) { }
  };

  const sendMessage = async (contentMessage) => {
    if (!contentMessage || !contentMessage.trim()) {
      return;
    }
    
    if (!currentChat || !currentChat.id) {
      console.error('No hay chat seleccionado');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage.trim(),
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) { }
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (err) { }
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const renderGrid = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid className={classes.gridItem} md={3} item>
          <div className={classes.btnContainer}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogType("new");
                setShowDialog(true);
              }}
              className={clsx(classes.modernButton, classes.primaryButton)}
              variant="contained"
              fullWidth
            >
              {i18n.t("chatInternal.new")}
            </Button>
          </div>
          <ChatList
            chats={chats}
            pageInfo={chatsPageInfo}
            loading={loading}
            handleSelectChat={(chat) => selectChat(chat)}
            handleDeleteChat={(chat) => deleteChat(chat)}
            handleEditChat={() => {
              setDialogType("edit");
              setShowDialog(true);
            }}
          />
        </Grid>
        <Grid className={classes.gridItem} md={9} item>
          {isObject(currentChat) && has(currentChat, "id") && (
            <ChatMessages
              chat={currentChat}
              scrollToBottomRef={scrollToBottomRef}
              pageInfo={messagesPageInfo}
              messages={messages}
              loading={loading}
              handleSendMessage={sendMessage}
              handleLoadMore={loadMoreMessages}
            />
          )}
        </Grid>
      </Grid>
    );
  };

  const renderTab = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid md={12} item>
          <div className={classes.tabsContainer}>
            <Tabs
              value={tab}
              indicatorColor="primary"
              textColor="primary"
              onChange={(e, v) => setTab(v)}
              aria-label="chat tabs"
            >
              <Tab label="Chats" />
              <Tab label="Mensagens" />
            </Tabs>
          </div>
        </Grid>
        {tab === 0 && (
          <Grid className={classes.gridItemTab} md={12} item>
            <div className={classes.btnContainer}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowDialog(true)}
                className={clsx(classes.modernButton, classes.primaryButton)}
                variant="contained"
                fullWidth
              >
                Novo Chat
              </Button>
            </div>
            <ChatList
              chats={chats}
              pageInfo={chatsPageInfo}
              loading={loading}
              handleSelectChat={(chat) => selectChat(chat)}
              handleDeleteChat={(chat) => deleteChat(chat)}
            />
          </Grid>
        )}
        {tab === 1 && (
          <Grid className={classes.gridItemTab} md={12} item>
            {isObject(currentChat) && has(currentChat, "id") && (
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            )}
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ChatModal
          type={dialogType}
          open={showDialog}
          chat={currentChat}
          handleLoadNewChat={(data) => {
            setMessages([]);
            setMessagesPage(1);
            setCurrentChat(data);
            setTab(1);
            history.push(`/chats/${data.uuid}`);
          }}
          handleClose={() => setShowDialog(false)}
        />

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <ChatIcon />
                Chat interno
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Comunicación en tiempo real entre colaboradores
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                className={clsx(classes.modernButton, classes.primaryButton)}
                onClick={() => {
                  setDialogType("new");
                  setShowDialog(true);
                }}
              >
                Nuevo chat
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO: ESTATÍSTICAS DO CHAT */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas del chat
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de chats
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalChats}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <ChatIcon />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Mis chats
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {myChats}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <People />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Chats activos (24 h)
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {activeChats}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Mensajes
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalMessages}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <Message />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE CHAT */}
        <Box className={classes.chatSection}>
          <Box className={classes.chatHeader}>
            <Typography className={classes.chatTitle}>
              Chat interno
            </Typography>
          </Box>
          
          {loading && chats.length === 0 ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando chats...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus chats
              </Typography>
            </div>
          ) : (
            <>
              {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
            </>
          )}
        </Box>
      </div>
    </div>
  );
}

export default withWidth()(Chat);