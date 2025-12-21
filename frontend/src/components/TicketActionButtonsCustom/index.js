import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { Can } from "../Can";
import { makeStyles } from "@material-ui/core/styles";
import { 
  IconButton, 
  Menu,
  MenuItem,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Box,
  Tooltip,
  Chip,
  Fade
} from "@material-ui/core";
import { 
  DeviceHubOutlined, 
  History, 
  MoreVert, 
  PictureAsPdf, 
  Replay, 
  SwapHorizOutlined,
  HighlightOff,
  PhoneInTalk,
  Close,
  Check,
  Settings
} from "@material-ui/icons";
import { v4 as uuidv4 } from "uuid";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import ConfirmationModal from "../ConfirmationModal";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import ScheduleModal from "../ScheduleModal";
import ShowTicketOpen from "../ShowTicketOpenModal";
import { toast } from "react-toastify";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import ShowTicketLogModal from "../ShowTicketLogModal";
import TicketMessagesDialog from "../TicketMessagesDialog";
import { useTheme } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  // ===== CONTAINER PRINCIPAL =====
  actionsContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    maxWidth: "100%",
    flexWrap: "wrap",
  },

  // ===== BOTÕES MODERNOS =====
  modernButton: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    backgroundColor: "white",
    transition: "all 0.2s ease",
    position: "relative",
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    
    "& .MuiSvgIcon-root": {
      fontSize: "20px",
      transition: "color 0.2s ease",
    },
  },

  // ===== CORES DOS BOTÕES =====
  callButton: {
    "&:hover": {
      borderColor: "#10b981",
      backgroundColor: "#ecfdf5",
      
      "& .MuiSvgIcon-root": {
        color: "#10b981",
      }
    },
  },

  closeButton: {
    "&:hover": {
      borderColor: "#ef4444",
      backgroundColor: "#fef2f2",
      
      "& .MuiSvgIcon-root": {
        color: "#ef4444",
      }
    },
  },

  returnButton: {
    "&:hover": {
      borderColor: "#f59e0b",
      backgroundColor: "#fffbeb",
      
      "& .MuiSvgIcon-root": {
        color: "#f59e0b",
      }
    },
  },

  transferButton: {
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      
      "& .MuiSvgIcon-root": {
        color: "#3b82f6",
      }
    },
  },

  reopenButton: {
    "&:hover": {
      borderColor: "#8b5cf6",
      backgroundColor: "#f3f4f6",
      
      "& .MuiSvgIcon-root": {
        color: "#8b5cf6",
      }
    },
  },

  acceptButton: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    },
  },

  // ===== SWITCH MODERNO =====
  modernSwitch: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1.5),
    backgroundColor: "white",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    cursor: "pointer",
    
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
    },
  },

  switchLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    marginRight: theme.spacing(1),
    userSelect: "none",
  },

  // ===== MENU MODERNO =====
  modernMenu: {
    "& .MuiPaper-root": {
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
    },
  },

  menuItem: {
    padding: theme.spacing(1.5, 2),
    fontSize: "14px",
    fontWeight: 500,
    color: "#1a202c",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#f8fafc",
      color: "#3b82f6",
    },
  },

  // ===== DIALOG MODERNO =====
  modernDialog: {
    "& .MuiPaper-root": {
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
    }
  },

  dialogHeader: {
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
    borderBottom: "1px solid #e2e8f0",
    textAlign: "center",
  },

  dialogTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  dialogContent: {
    padding: theme.spacing(3),
    textAlign: "center",
  },

  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: theme.spacing(2),
    justifyContent: "center",
  },

  // ===== BOTÕES DO DIALOG =====
  primaryDialogButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: 600,
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    textTransform: "none",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  secondaryDialogButton: {
    backgroundColor: "#ef4444",
    color: "white",
    fontWeight: 600,
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    textTransform: "none",
    
    "&:hover": {
      backgroundColor: "#dc2626",
      transform: "translateY(-1px)",
    },
  },

  // ===== MODAL DE CHAMADA =====
  callModal: {
    "& .MuiPaper-root": {
      borderRadius: "20px",
      border: "none",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
      minHeight: "600px",
      minWidth: "800px",
    }
  },

  callFrame: {
    width: "100%",
    height: "600px",
    border: "none",
    borderRadius: "20px",
  },

  callActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "center",
  },

  callCloseButton: {
    backgroundColor: "#ef4444",
    color: "white",
    fontWeight: 600,
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  // ===== STATUS BADGE =====
  statusBadge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: 700,
    minWidth: "16px",
    height: "16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    actionsContainer: {
      gap: theme.spacing(0.5),
      padding: theme.spacing(0.5),
    },
    
    modernButton: {
      width: "36px",
      height: "36px",
      
      "& .MuiSvgIcon-root": {
        fontSize: "16px",
      },
    },
    
    modernSwitch: {
      padding: theme.spacing(0.5, 1),
    },
    
    switchLabel: {
      fontSize: "10px",
    },
  },
}));

const SessionSchema = Yup.object().shape({
  ratingId: Yup.string().required("Avaliação obrigatória"),
});

const TicketActionButtonsCustom = ({ ticket }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  
  // ===== TODOS OS ESTADOS EXISTENTES PERMANECEM IGUAIS =====
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { setCurrentTicket, setTabOpen } = useContext(TicketsContext);
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
  const [showTicketLogOpen, setShowTicketLogOpen] = useState(false);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [disableBot, setDisableBot] = useState(ticket.contact.disableBot);
  const [showSchedules, setShowSchedules] = useState(false);
  const [enableIntegration, setEnableIntegration] = useState(ticket.useIntegration);
  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [wavoipUrl, setWavoipUrl] = useState("");

  const { get: getSetting } = useCompanySettings()
  const { getPlanCompany } = usePlans();

  // ===== TODAS AS FUNÇÕES EXISTENTES PERMANECEM IGUAIS =====
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const companyId = user.companyId;
    const planConfigs = await getPlanCompany(undefined, companyId);
    setShowSchedules(planConfigs.plan.useSchedules);
    setOpenTicketMessageDialog(false);
    setDisableBot(ticket.contact.disableBot)
    setShowTicketLogOpen(false)
  }

  const handleClickOpen = async (e) => {
    const setting = await getSetting({
      "column": "requiredTag"
    });

    if (setting?.requiredTag === "enabled") {
      try {
        const contactTags = await api.get(`/contactTags/${ticket.contact.id}`);
        if (!contactTags.data.tags) {
          toast.warning(i18n.t("messagesList.header.buttons.requiredTag"))
        } else {
          setOpen(true);
        }
      } catch (err) {
        toastError(err);
      }
    } else {
      setOpen(true);
    }
  };

  const handleOpenWavoipCall = async () => {
    try {
      const { data } = await api.get(`/tickets/${ticket.id}`);
      console.log("Ticket Atualizado:", data);

      const token = data?.whatsapp?.wavoip;
      const phone = data?.contact?.number?.replace(/\D/g, "");
      const name = data?.contact?.name;

      if (!token || !phone) {
        toastError("Erro: Token ou número de telefone não disponível.");
        return;
      }

      const url = `https://app.wavoip.com/call?token=${token}&phone=${phone}&name=${name}&start_if_ready=true&close_after_call=true`;
      setWavoipUrl(url);
      setOpenModal(true);
    } catch (err) {
      toastError("Erro ao buscar os dados do ticket.");
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleClose = () => {
    formRef.current.resetForm();
    setOpen(false);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setLoading(false);
  };

  const handleOpenAcceptTicketWithouSelectQueue = async () => {
    setAcceptTicketWithouSelectQueueOpen(true);
  };

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
    if (typeof handleClose == "function") handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    if (typeof handleClose == "function") handleClose();
  };

  const handleCloseTicketWithoutFarewellMsg = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
        amountUsedBotQueues: 0
      });

      setLoading(false);
      history.push("/tickets");
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleExportPDF = async () => {
    setOpenTicketMessageDialog(true);
    handleCloseMenu();
  }

  const handleEnableIntegration = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        useIntegration: !enableIntegration
      });
      setEnableIntegration(!enableIntegration)
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleShowLogTicket = async () => {
    setShowTicketLogOpen(true);
  };

  const handleContactToggleDisableBot = async () => {
    const { id } = ticket.contact;

    try {
      const { data } = await api.put(`/contacts/toggleDisableBot/${id}`);
      ticket.contact.disableBot = data.disableBot;
      setDisableBot(data.disableBot)
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseTransferTicketModal = () => {
    setTransferTicketModalOpen(false);
  };

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
      history.push("/tickets")
    } catch (err) {
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

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      let setting;
      try {
        setting = await getSetting({
          "column": "sendGreetingAccepted"
        })
      } catch (err) {
        toastError(err);
      }

      if (setting?.sendGreetingAccepted === "enabled" && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled") && ticket.status === "pending") {
        handleSendMessage(ticket.id);
      }

      setLoading(false);

      if (status === "open" || status === "group") {
        setCurrentTicket({ ...ticket, code: "#" + status });
        setTimeout(() => {
          history.push('/tickets');
        }, 0);
        setTimeout(() => {
          history.push(`/tickets/${ticket.uuid}`);
          setTabOpen(status)
        }, 10);
      } else {
        setCurrentTicket({ id: null, code: null })
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      const otherTicket = await api.put(`/tickets/${id}`, {
        status: ticket.isGroup ? "group" : "open",
        userId: user?.id,
      });
      if (otherTicket.data.id !== ticket.id) {
        if (otherTicket.data.userId !== user?.id) {
          setOpenAlert(true)
          setUserTicketOpen(otherTicket.data.user.name)
          setQueueTicketOpen(otherTicket.data.queue.name)
          setTabOpen(otherTicket.isGroup ? "group" : "open")
        } else {
          setLoading(false);
          setTabOpen(otherTicket.isGroup ? "group" : "open")
          history.push(`/tickets/${otherTicket.data.uuid}`);
        }
      } else {
        setLoading(false);
        history.push('/tickets');
        setTimeout(() => {
          history.push(`/tickets/${ticket.uuid}`);
          setTabOpen(ticket.isGroup ? "group" : "open")
        }, 1000)
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <>
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
      {showTicketLogOpen && (
        <ShowTicketLogModal
          isOpen={showTicketLogOpen}
          handleClose={(e) => setShowTicketLogOpen(false)}
          ticketId={ticket.id}
        />
      )}
      {openTicketMessageDialog && (
        <TicketMessagesDialog
          open={openTicketMessageDialog}
          handleClose={() => setOpenTicketMessageDialog(false)}
          ticketId={ticket.id}
        />
      )}

      {/* CONTAINER DE AÇÕES */}
      <div className={classes.actionsContainer}>
        {/* BOTÃO REABRIR TICKET SEM FILA */}
        {ticket.status === "closed" && (ticket.queueId === null || ticket.queueId === undefined) && (
          <Tooltip title="Reabrir ticket" placement="top">
            <ButtonWithSpinner
              className={clsx(classes.modernButton, classes.reopenButton)}
              loading={loading}
              onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
            >
              <Replay />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {/* BOTÃO REABRIR TICKET COM FILA */}
        {(ticket.status === "closed" && ticket.queueId !== null) && (
          <Tooltip title="Reabrir ticket" placement="top">
            <ButtonWithSpinner
              className={clsx(classes.modernButton, classes.reopenButton)}
              loading={loading}
              onClick={e => handleAcepptTicket(ticket.id)}
            >
              <Replay />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {/* AÇÕES PARA TICKETS ABERTOS */}
        {(ticket.status === "open" || ticket.status === "group") && (
          <>
            {/* BOTÓN DE LLAMADA */}
            <Tooltip title="Iniciar llamada" placement="top">
              <IconButton
                className={clsx(classes.modernButton, classes.callButton)}
                onClick={handleOpenWavoipCall}
              >
                <PhoneInTalk />
              </IconButton>
            </Tooltip>

            {/* BOTÃO CERRAR TICKET */}
            <Tooltip title="Cerrar ticket" placement="top">
              <IconButton
                className={clsx(classes.modernButton, classes.closeButton)}
                onClick={handleClickOpen}
              >
                <HighlightOff />
              </IconButton>
            </Tooltip>

            {/* BOTÓN VOLVER A LA COLA */}
            <Tooltip title="Volver a la cola" placement="top">
              <IconButton
                className={clsx(classes.modernButton, classes.returnButton)}
                onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
              >
                <Replay />
              </IconButton>
            </Tooltip>

            {/* BOTÃO TRANSFERIR */}
            <Tooltip title="Transferir ticket" placement="top">
              <IconButton
                className={clsx(classes.modernButton, classes.transferButton)}
                onClick={handleOpenTransferModal}
              >
                <SwapHorizOutlined />
              </IconButton>
            </Tooltip>

            {/* SWITCH CHATBOT */}
            <Tooltip title="Activar/Desactivar chatbot" placement="top">
              <div className={classes.modernSwitch} onClick={handleContactToggleDisableBot}>
                <Typography className={classes.switchLabel}>
                  Bot
                </Typography>
                <Switch
                  size="small"
                  checked={disableBot}
                  onChange={() => {}}
                  color="primary"
                />
              </div>
            </Tooltip>

            {/* MODAIS DE CONFIRMAÇÃO E TRANSFERÊNCIA */}
            {confirmationOpen && (
              <ConfirmationModal
                title={`Eliminar ticket #${ticket.id}?`}
                open={confirmationOpen}
                onClose={setConfirmationOpen}
                onConfirm={handleDeleteTicket}
              >
                Esta acción no se puede deshacer.
              </ConfirmationModal>
            )}
            {transferTicketModalOpen && (
              <TransferTicketModalCustom
                modalOpen={transferTicketModalOpen}
                onClose={handleCloseTransferTicketModal}
                ticketid={ticket.id}
                ticket={ticket}
              />
            )}
          </>
        )}

        {/* BOTÃO ACEITAR TICKET SEM FILA */}
        {ticket.status === "pending" && (ticket.queueId === null || ticket.queueId === undefined) && (
          <Tooltip title="Aceptar ticket" placement="top">
            <ButtonWithSpinner
              className={clsx(classes.modernButton, classes.acceptButton)}
              loading={loading}
              onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
            >
              <Check />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {/* BOTÃO ACEITAR TICKET COM FILA */}
        {ticket.status === "pending" && ticket.queueId !== null && (
          <Tooltip title="Aceptar ticket" placement="top">
            <ButtonWithSpinner
              className={clsx(classes.modernButton, classes.acceptButton)}
              loading={loading}
              onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
            >
              <Check />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {/* MENÚ DE OPCIONES */}
        <Tooltip title="Más opciones" placement="top">
          <IconButton
            className={classes.modernButton}
            onClick={handleMenu}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          className={classes.modernMenu}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Can
            role={user.profile}
            perform="ticket-options:deleteTicket"
            yes={() => (
              <MenuItem 
                className={classes.menuItem}
                onClick={handleOpenConfirmationModal}
              >
                Eliminar ticket
              </MenuItem>
            )}
          />
          <MenuItem 
            className={classes.menuItem}
            onClick={handleEnableIntegration}
          >
            {enableIntegration ? "Desactivar integración" : "Activar integración"}
          </MenuItem>
          <MenuItem 
            className={classes.menuItem}
            onClick={handleShowLogTicket}
          >
            Ver registros
          </MenuItem>
          <MenuItem 
            className={classes.menuItem}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </MenuItem>
        </Menu>
      </div>

      {/* DIALOG DE FECHAMENTO */}
      <Formik
        enableReinitialize={true}
        validationSchema={SessionSchema}
        innerRef={formRef}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            actions.setSubmitting(false);
            actions.resetForm();
          }, 400);
        }}
      >
        {({ values, touched, errors, isSubmitting, setFieldValue, resetForm }) => (
          <Dialog
            open={open}
            onClose={handleClose}
            className={classes.modernDialog}
            maxWidth="sm"
            fullWidth
          >
            <Form>
              <div className={classes.dialogHeader}>
                <Typography className={classes.dialogTitle}>
                  Finalizar atención
                </Typography>
              </div>
              
              <div className={classes.dialogContent}>
                <Typography style={{ fontSize: "16px", color: "#4a5568", marginBottom: "16px" }}>
                  ¿Cómo desea finalizar esta atención?
                </Typography>
                <Typography style={{ fontSize: "14px", color: "#64748b" }}>
                  Elija si desea enviar un mensaje de despedida al cliente.
                </Typography>
              </div>
              
              <div className={classes.dialogActions}>
                <Button
                  className={classes.secondaryDialogButton}
                  onClick={e => handleCloseTicketWithoutFarewellMsg()}
                  startIcon={<Close />}
                >
                  Sin despedida
                </Button>
                <Button
                  className={classes.primaryDialogButton}
                  onClick={e => handleUpdateTicketStatus(e, "closed", user?.id, ticket?.queue?.id)}
                  startIcon={<Check />}
                >
                  Con despedida
                </Button>
              </div>
            </Form>
          </Dialog>
        )}
      </Formik>

      {/* MODAL DE CHAMADA */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        className={classes.callModal}
        maxWidth={false}
        disableBackdropClick
        disableEscapeKeyDown
        PaperProps={{
          style: { position: "relative" }
        }}
      >
        <iframe
          src={wavoipUrl}
          className={classes.callFrame}
          title="WAVoIP Call"
        />
        <div className={classes.callActions}>
          <Button
            className={classes.callCloseButton}
            onClick={handleCloseModal}
            startIcon={<Close />}
          >
            Encerrar Chamada
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default TicketActionButtonsCustom;