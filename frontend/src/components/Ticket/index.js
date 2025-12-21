import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import clsx from "clsx";

import { makeStyles, Paper, Box, Typography, Card } from "@material-ui/core";
import { ChatBubble, Person, Business } from "@material-ui/icons";

import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtonsCustom";
import MessagesList from "../MessagesList";
import api from "../../services/api";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";

import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TagsContainer } from "../TagsContainer";
import { isNil } from 'lodash';
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  // ===== LAYOUT PRINCIPAL MODERNO =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(2),
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    height: "calc(100vh - 32px)",
    display: "flex",
    gap: theme.spacing(2),
  },

  // ===== ÁREA PRINCIPAL DE CHAT =====
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    marginRight: 0,
    
    "&.drawer-open": {
      marginRight: drawerWidth,
    },
  },

  // ===== CABEÇALHO DO TICKET =====
  ticketHeader: {
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    padding: theme.spacing(2, 3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "80px",
    position: "relative",
    
    "&::before": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "60px",
      height: "3px",
      backgroundColor: "#3b82f6",
      borderRadius: "2px",
    },
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flex: 1,
  },

  headerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  headerSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
  },

  // ===== ÁREA DE TAGS =====
  tagsSection: {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: theme.spacing(1, 3),
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
  },

  // ===== ÁREA DE MENSAGENS =====
  messagesContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    backgroundColor: "#f9fafb",
    background: `
      linear-gradient(135deg, 
        rgba(59, 130, 246, 0.02) 0%, 
        rgba(16, 185, 129, 0.02) 100%
      )
    `,
  },

  messagesWrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  // ===== ÁREA DE INPUT =====
  inputSection: {
    backgroundColor: "white",
    borderTop: "1px solid #e2e8f0",
    padding: theme.spacing(2, 3),
    position: "relative",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "60px",
      height: "3px",
      backgroundColor: "#10b981",
      borderRadius: "2px",
    },
  },

  // ===== ESTADOS DE LOADING =====
  loadingContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    backgroundColor: "white",
    borderRadius: "16px",
    margin: theme.spacing(2),
    padding: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  loadingIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    animation: "$pulse 2s ease-in-out infinite",
  },

  loadingText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
  },

  loadingSubtext: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
    maxWidth: "300px",
  },

  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.05)",
      opacity: 0.8,
    },
  },

  // ===== ESTADO VAZIO =====
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    backgroundColor: "white",
    borderRadius: "16px",
    margin: theme.spacing(2),
    padding: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  emptyIcon: {
    width: "96px",
    height: "96px",
    borderRadius: "20px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: "16px",
    color: "#64748b",
    textAlign: "center",
    maxWidth: "400px",
    lineHeight: 1.5,
  },

  // ===== DRAWER DE CONTATO =====
  contactDrawer: {
    width: drawerWidth,
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    transition: "all 0.3s ease",
    position: "fixed",
    right: theme.spacing(2),
    top: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1000,
    transform: "translateX(100%)",
    
    "&.open": {
      transform: "translateX(0)",
    },
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 1024px)": {
    container: {
      padding: theme.spacing(1),
      height: "calc(100vh - 16px)",
    },
    
    mainWrapper: {
      "&.drawer-open": {
        marginRight: 0,
      },
    },
    
    contactDrawer: {
      width: "100%",
      right: 0,
      left: 0,
      borderRadius: "16px 16px 0 0",
      
      "&.open": {
        transform: "translateY(0)",
      },
      
      "&:not(.open)": {
        transform: "translateY(100%)",
      },
    },
  },

  "@media (max-width: 768px)": {
    ticketHeader: {
      padding: theme.spacing(1.5, 2),
      minHeight: "70px",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: theme.spacing(1),
    },
    
    headerLeft: {
      width: "100%",
    },
    
    headerIcon: {
      width: "40px",
      height: "40px",
      fontSize: "18px",
    },
    
    headerTitle: {
      fontSize: "18px",
    },
    
    headerSubtitle: {
      fontSize: "13px",
    },
    
    tagsSection: {
      padding: theme.spacing(1, 2),
    },
    
    inputSection: {
      padding: theme.spacing(1.5, 2),
    },
  },
}));

const Ticket = () => {
  const { ticketId } = useParams();
  const history = useHistory();
  const classes = useStyles();

  const { user, socket } = useContext(AuthContext);
  const { setTabOpen } = useContext(TicketsContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  const [dragDropFiles, setDragDropFiles] = useState([]);
  const { companyId } = user;
  const [notificameHub, setNotificameHub] = useState(false);

  useEffect(() => {
    console.log("======== Ticket ===========")
    console.log(ticket)
    console.log("===========================")
  }, [ticket])

  // ===== CARREGAMENTO DO TICKET =====
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          if (!isNil(ticketId) && ticketId !== "undefined") {
            const { data } = await api.get("/tickets/u/" + ticketId);

            setContact(data.contact);
            setNotificameHub(data.whatsapp.notificameHub);
            setTicket(data);
            if (["pending", "open", "group"].includes(data.status)) {
              setTabOpen(data.status);
            }
            setLoading(false);
          }
        } catch (err) {
          history.push("/tickets"); 
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, user, history]);

  // ===== WEBSOCKET =====
  useEffect(() => {
    if (!ticket && !ticket.id && ticket.uuid !== ticketId && ticketId === "undefined") {
      return;
    }

    if (user.companyId) {
      const onConnectTicket = () => {
        socket.emit("joinChatBox", `${ticket.id}`);
      }

      const onCompanyTicket = (data) => {
        if (data.action === "update" && data.ticket.id === ticket?.id) {
          setTicket(data.ticket);
        }

        if (data.action === "delete" && data.ticketId === ticket?.id) {
          history.push("/tickets");
        }
      };

      const onCompanyContactTicket = (data) => {
        if (data.action === "update") {
          setContact((prevState) => {
            if (prevState.id === data.contact?.id) {
              return { ...prevState, ...data.contact };
            }
            return prevState;
          });
        }
      };

      socket.on("connect", onConnectTicket)
      socket.on(`company-${companyId}-ticket`, onCompanyTicket);
      socket.on(`company-${companyId}-contact`, onCompanyContactTicket);

      return () => {
        socket.emit("joinChatBoxLeave", `${ticket.id}`);
        socket.off("connect", onConnectTicket);
        socket.off(`company-${companyId}-ticket`, onCompanyTicket);
        socket.off(`company-${companyId}-contact`, onCompanyContactTicket);
      };
    }
  }, [ticketId, ticket, history]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const renderMessagesList = () => {
    return (
      <>
        <div className={classes.messagesWrapper}>
          <MessagesList
            isGroup={ticket.isGroup}
            onDrop={setDragDropFiles}
            whatsappId={ticket.whatsappId}
            queueId={ticket.queueId}
            channel={ticket.channel}
          />
        </div>
        <div className={classes.inputSection}>
          <MessageInput
            ticketId={ticket.id}
            ticketStatus={ticket.status}
            ticketChannel={ticket.channel}
            notificameHub={notificameHub}
            droppedFiles={dragDropFiles}
            contactId={contact.id}
          />
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <div className={classes.loadingContainer}>
            <div className={classes.loadingIcon}>
              <ChatBubble />
            </div>
            <Typography className={classes.loadingText}>
              Cargando conversación...
            </Typography>
            <Typography className={classes.loadingSubtext}>
              Espera mientras preparamos la atención para ti
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket.id) {
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <div className={classes.emptyState}>
            <div className={classes.emptyIcon}>
              <Business />
            </div>
            <Typography className={classes.emptyTitle}>
              Ticket no encontrado
            </Typography>
            <Typography className={classes.emptyDescription}>
              El ticket solicitado no existe o no tienes permiso para acceder a él.
              Verifica si el enlace es correcto o selecciona un ticket válido.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Paper
          className={clsx(classes.mainWrapper, {
            "drawer-open": drawerOpen,
          })}
          elevation={0}
        >
          {/* CABEÇALHO DO TICKET */}
          <div className={classes.ticketHeader}>
            <div className={classes.headerLeft}>
              <div className={classes.headerIcon}>
                <Person />
              </div>
              
              <div className={classes.headerInfo}>
                {ticket.contact !== undefined && (
                  <TicketInfo
                    contact={contact}
                    ticket={ticket}
                    onClick={handleDrawerOpen}
                  />
                )}
              </div>
            </div>

            <TicketActionButtons ticket={ticket} />
          </div>

          {/* SEÇÃO DE TAGS */}
          <div className={classes.tagsSection}>
            <TagsContainer contact={contact} />
          </div>

          {/* ÁREA DE MENSAGENS */}
          <div className={classes.messagesContainer}>
            <ReplyMessageProvider>
              <ForwardMessageProvider>
                <EditMessageProvider>
                  {renderMessagesList()}
                </EditMessageProvider>
              </ForwardMessageProvider>
            </ReplyMessageProvider>
          </div>
        </Paper>

        {/* DRAWER DE CONTATO */}
        <div
          className={clsx(classes.contactDrawer, {
            open: drawerOpen,
          })}
        >
          <ContactDrawer
            open={drawerOpen}
            handleDrawerClose={handleDrawerClose}
            contact={contact}
            loading={loading}
            ticket={ticket}
          />
        </div>
      </div>
    </div>
  );
};

export default Ticket;