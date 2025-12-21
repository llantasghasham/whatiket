import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { List, Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import GroupIcon from '@material-ui/icons/Group';
import ContactTag from "../ContactTag";
import ConnectionIcon from "../ConnectionIcon";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ShowTicketOpen from "../ShowTicketOpenModal";
import { isNil } from "lodash";
import { toast } from "react-toastify";
import { Done, HighlightOff, Replay, SwapHoriz } from "@material-ui/icons";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { 
  Avatar, 
  Badge, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box,
  Card,
  CardContent,
  Chip,
  IconButton
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  // ===== ITEM DE TICKET MODERNO =====
  ticketCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(1),
    transition: "all 0.2s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: "#e2e8f0",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
      borderColor: "#3b82f6",
      
      "&::before": {
        width: "6px",
        backgroundColor: "#3b82f6",
      }
    },
    
    "&.selected": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
      
      "&::before": {
        backgroundColor: "#3b82f6",
        width: "6px",
      }
    },
  },

  // ===== CONTEÚDO DO TICKET =====
  ticketContent: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },

  ticketHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    gap: theme.spacing(1),
  },

  avatar: {
    width: 48,
    height: 48,
    border: "3px solid white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },

  contactInfo: {
    flex: 1,
    minWidth: 0,
  },

  contactName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },

  contactNameUnread: {
    color: "#3b82f6",
  },

  lastMessage: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
    lineHeight: 1.4,
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    marginBottom: theme.spacing(1),
  },

  lastMessageUnread: {
    color: "#1a202c",
    fontWeight: 600,
  },

  // ===== BADGES E TAGS =====
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },

  modernTag: {
    height: "22px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderRadius: "6px",
    padding: "0 8px",
    color: "white",
  },

  queueTag: {
    backgroundColor: "#64748b",
  },

  whatsappTag: {
    backgroundColor: "#25D366",
  },

  facebookTag: {
    backgroundColor: "#4267B2",
  },

  instagramTag: {
    backgroundColor: "#E1306C",
  },

  userTag: {
    backgroundColor: "#1a202c",
  },

  groupTag: {
    backgroundColor: "#8b5cf6",
  },

  // ===== INFORMAÇÕES DE TEMPO =====
  timeInfo: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: theme.spacing(0.5),
  },

  timestamp: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 500,
  },

  timestampUnread: {
    color: "#3b82f6",
    fontWeight: 700,
  },

  unreadBadge: {
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: 700,
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // ===== AÇÕES DO TICKET =====
  actionsContainer: {
    padding: theme.spacing(1, 2, 2, 2),
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  actionButton: {
    minWidth: "32px",
    height: "32px",
    borderRadius: "8px",
    padding: "6px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "none",
    boxShadow: "none",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    },
  },

  acceptButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  acceptQueueButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#d97706",
    },
  },

  transferButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  closeButton: {
    backgroundColor: "#ef4444",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  reopenButton: {
    backgroundColor: "#6366f1",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#4f46e5",
    },
  },

  // ===== ESTADOS DE LOADING =====
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    zIndex: 10,
  },

  // ===== INDICADORES VISUAIS =====
  queueIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    borderRadius: "0 0 0 16px",
  },

  connectionIcon: {
    width: "16px",
    height: "16px",
    marginRight: theme.spacing(0.5),
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    ticketContent: {
      padding: theme.spacing(1.5),
    },
    
    actionsContainer: {
      padding: theme.spacing(1),
      gap: theme.spacing(0.5),
    },
    
    actionButton: {
      minWidth: "28px",
      height: "28px",
      fontSize: "11px",
    },
    
    contactName: {
      fontSize: "14px",
    },
    
    lastMessage: {
      fontSize: "13px",
    },
  },
}));

const TicketListItemCustom = ({ setTabOpen, ticket }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);

  const { get: getSetting } = useCompanySettings();

  useEffect(() => {
    console.log("======== TicketListItemCustom ===========")
    console.log(ticket)
    console.log("=========================================")
  }, [ticket])

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===== TODAS AS FUNÇÕES EXISTENTES PERMANECEM IGUAIS =====
  const handleOpenAcceptTicketWithouSelectQueue = useCallback(() => {
    setAcceptTicketWithouSelectQueueOpen(true);
  }, []);

  const handleCloseTicket = async (id) => {
    const setting = await getSetting({
      "column": "requiredTag"
    });

    if (setting.requiredTag === "enabled") {
      try {
        const contactTags = await api.get(`/contactTags/${ticket.contact.id}`);
        if (!contactTags.data.tags) {
          toast.warning(i18n.t("messagesList.header.buttons.requiredTag"))
        } else {
          await api.put(`/tickets/${id}`, {
            status: "closed",
            userId: user?.id || null,
          });
          if (isMounted.current) {
            setLoading(false);
          }
          history.push(`/tickets/`);
        }
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    } else {
      setLoading(true);
      try {
        await api.put(`/tickets/${id}`, {
          status: "closed",
          userId: user?.id || null,
        });
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
      if (isMounted.current) {
        setLoading(false);
      }
      history.push(`/tickets/`);
    }
  };

  const handleCloseIgnoreTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
        amountUsedBotQueues: 0
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const truncate = (str, len) => {
    if (!isNil(str)) {
      if (str.length > len) {
        return str.substring(0, len) + "...";
      }
      return str;
    }
  };

  const handleCloseTransferTicketModal = useCallback(() => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  }, []);

  const handleOpenTransferModal = () => {
    setLoading(true)
    setTransferTicketModalOpen(true);
    if (isMounted.current) {
      setLoading(false);
    }
    handleSelectTicket(ticket);
    history.push(`/tickets/${ticket.uuid}`);
  }

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      const otherTicket = await api.put(`/tickets/${id}`, ({
        status: ticket.isGroup && ticket.channel === 'whatsapp' ? "group" : "open",
        userId: user?.id,
      }));

      if (otherTicket.data.id !== ticket.id) {
        if (otherTicket.data.userId !== user?.id) {
          setOpenAlert(true);
          setUserTicketOpen(otherTicket.data.user.name);
          setQueueTicketOpen(otherTicket.data.queue.name);
        } else {
          setLoading(false);
          setTabOpen(ticket.isGroup ? "group" : "open");
          handleSelectTicket(otherTicket.data);
          history.push(`/tickets/${otherTicket.uuid}`);
        }
      } else {
        let setting;
        try {
          setting = await getSetting({
            "column": "sendGreetingAccepted"
          });
        } catch (err) {
          toastError(err);
        }

        if (setting?.sendGreetingAccepted === "enabled" && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")) {
          handleSendMessage(ticket.id);
        }
        if (isMounted.current) {
          setLoading(false);
        }

        setTabOpen(ticket.isGroup ? "group" : "open");
        handleSelectTicket(ticket);
        history.push(`/tickets/${ticket.uuid}`);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSendMessage = async (id) => {
    let setting;
    try {
      setting = await getSetting({
        "column": "greetingAcceptedMessage"
      })
    } catch (err) {
      toastError(err);
    }

    const msg = `${setting.greetingAcceptedMessage}`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseAlert = useCallback(() => {
    setOpenAlert(false);
    setLoading(false);
  }, []);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  // ===== FUNÇÕES PARA FORMATAÇÃO =====
  const getChannelColor = (channel) => {
    switch (channel) {
      case "whatsapp": return "#25D366";
      case "facebook": return "#4267B2";
      case "instagram": return "#E1306C";
      default: return "#64748b";
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return "";
    
    if (message.includes('fb.me')) {
      return "Clique de Anúncio";
    } else if (message.includes('data:image/png;base64')) {
      return "📍 Localização";
    } else if (message.includes('BEGIN:VCARD')) {
      return "👤 Contato";
    }
    
    return truncate(message, 60);
  };

  const isSelected = ticketId && ticketId === ticket.uuid;
  const hasUnreadMessages = Number(ticket.unreadMessages) > 0;

  return (
    <React.Fragment key={ticket.id}>
      {/* MODAIS */}
      {openAlert && (
        <ShowTicketOpen
          isOpen={openAlert}
          handleClose={handleCloseAlert}
          user={userTicketOpen}
          queue={queueTicketOpen}
        />
      )}
      {acceptTicketWithouSelectQueueOpen && (
        <AcceptTicketWithouSelectQueue
          modalOpen={acceptTicketWithouSelectQueueOpen}
          onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
          ticketId={ticket.id}
          ticket={ticket}
        />
      )}
      {transferTicketModalOpen && (
        <TransferTicketModalCustom
          modalOpen={transferTicketModalOpen}
          onClose={handleCloseTransferTicketModal}
          ticketid={ticket.id}
          ticket={ticket}
        />
      )}

      {/* CARD DO TICKET */}
      <Card
        className={clsx(classes.ticketCard, {
          selected: isSelected
        })}
        onClick={(e) => {
          const isActionButton = e.target.closest('button') || e.target.closest('.MuiIconButton-root');
          if (!isActionButton) {
            handleSelectTicket(ticket);
          }
        }}
        elevation={0}
      >
        {/* Indicador da fila */}
        <div
          className={classes.queueIndicator}
          style={{
            backgroundColor: ticket.queue?.color || "#64748b"
          }}
        />

        {/* Overlay de loading */}
        {loading && (
          <div className={classes.loadingOverlay}>
            <Typography variant="body2" color="textSecondary">
              Processando...
            </Typography>
          </div>
        )}

        {/* Informações de tempo */}
        <div className={classes.timeInfo}>
          <Typography
            className={clsx(classes.timestamp, {
              [classes.timestampUnread]: hasUnreadMessages
            })}
          >
            {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
              format(parseISO(ticket.updatedAt), "HH:mm")
            ) : (
              format(parseISO(ticket.updatedAt), "dd/MM/yyyy")
            )}
          </Typography>
          {hasUnreadMessages && (
            <div className={classes.unreadBadge}>
              {ticket.unreadMessages}
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className={classes.ticketContent}>
          <div className={classes.ticketHeader}>
            <Avatar
              className={classes.avatar}
              src={ticket?.contact?.urlPicture}
              alt={ticket?.contact?.name}
            >
              {ticket?.contact?.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <div className={classes.contactInfo}>
              <Typography
                className={clsx(classes.contactName, {
                  [classes.contactNameUnread]: hasUnreadMessages
                })}
              >
                {ticket.isGroup && ticket.channel === "whatsapp" && (
                  <GroupIcon style={{ fontSize: 16, color: "#8b5cf6" }} />
                )}
                {ticket.channel && (
                  <ConnectionIcon
                    width="16"
                    height="16"
                    className={classes.connectionIcon}
                    connectionType={ticket.channel}
                  />
                )}
                {truncate(ticket.contact?.name, 30)}
              </Typography>

              <Typography
                className={clsx(classes.lastMessage, {
                  [classes.lastMessageUnread]: hasUnreadMessages
                })}
              >
                <MarkdownWrapper>
                  {formatLastMessage(ticket.lastMessage)}
                </MarkdownWrapper>
              </Typography>
            </div>
          </div>

          {/* Tags e badges */}
          <div className={classes.tagsContainer}>
            {/* Tag da conexão */}
            {ticket?.whatsapp && (
              <Chip
                label={ticket.whatsapp.name.toUpperCase()}
                size="small"
                className={clsx(classes.modernTag, {
                  [classes.whatsappTag]: ticket.channel === "whatsapp",
                  [classes.facebookTag]: ticket.channel === "facebook",
                  [classes.instagramTag]: ticket.channel === "instagram",
                })}
              />
            )}

            {/* Tag da fila */}
            <Chip
              label={ticket.queueId ? ticket.queue?.name.toUpperCase() : 
                    ticket.status === "lgpd" ? "LGPD" : "SEM FILA"}
              size="small"
              className={clsx(classes.modernTag, classes.queueTag)}
              style={{ backgroundColor: ticket.queue?.color || "#64748b" }}
            />

            {/* Tag do usuário */}
            {ticket?.user && (
              <Chip
                label={ticket.user.name.toUpperCase()}
                size="small"
                className={clsx(classes.modernTag, classes.userTag)}
              />
            )}

            {/* Tag de grupo */}
            {ticket.isGroup && (
              <Chip
                label="GRUPO"
                size="small"
                className={clsx(classes.modernTag, classes.groupTag)}
              />
            )}

            {/* Tags personalizadas */}
            {ticket.tags?.map((tag) => (
              <ContactTag
                tag={tag}
                key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
              />
            ))}
          </div>
        </div>

        {/* Ações do ticket */}
        <div className={classes.actionsContainer}>
          {/* Aceitar ticket sem fila */}
          {(ticket.status === "pending" && !ticket.queueId) && (
            <Tooltip title="Aceptar ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.acceptButton)}
                size="small"
                loading={loading}
                onClick={handleOpenAcceptTicketWithouSelectQueue}
              >
                <Done style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Aceitar ticket com fila */}
          {(ticket.status === "pending" && ticket.queueId) && (
            <Tooltip title="Aceptar ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.acceptQueueButton)}
                size="small"
                loading={loading}
                onClick={() => handleAcepptTicket(ticket.id)}
              >
                <Done style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Transferir ticket */}
          {(["pending", "open", "group"].includes(ticket.status)) && (
            <Tooltip title="Transferir ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.transferButton)}
                size="small"
                loading={loading}
                onClick={handleOpenTransferModal}
              >
                <SwapHoriz style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Cerrar ticket */}
          {(["open", "group"].includes(ticket.status)) && (
            <Tooltip title="Cerrar ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.closeButton)}
                size="small"
                loading={loading}
                onClick={() => handleCloseTicket(ticket.id)}
              >
                <HighlightOff style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Ignorar ticket */}
          {(["pending", "lgpd"].includes(ticket.status) && 
            (user.userClosePendingTicket === "enabled" || user.profile === "admin")) && (
            <Tooltip title="Ignorar ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.closeButton)}
                size="small"
                loading={loading}
                onClick={() => handleCloseIgnoreTicket(ticket.id)}
              >
                <HighlightOff style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Reabrir ticket sem fila */}
          {(ticket.status === "closed" && !ticket.queueId) && (
            <Tooltip title="Reabrir ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.reopenButton)}
                size="small"
                loading={loading}
                onClick={handleOpenAcceptTicketWithouSelectQueue}
              >
                <Replay style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}

          {/* Reabrir ticket com fila */}
          {(ticket.status === "closed" && ticket.queueId) && (
            <Tooltip title="Reabrir ticket" placement="top">
              <ButtonWithSpinner
                className={clsx(classes.actionButton, classes.reopenButton)}
                size="small"
                loading={loading}
                onClick={() => handleAcepptTicket(ticket.id)}
              >
                <Replay style={{ fontSize: 16 }} />
              </ButtonWithSpinner>
            </Tooltip>
          )}
        </div>
      </Card>
    </React.Fragment>
  );
};

export default TicketListItemCustom;