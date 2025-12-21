import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Switch from "@material-ui/core/Switch";
import { 
  makeStyles,
  Typography,
  Box,
  Divider,
  ListItemIcon,
  Chip,
  Fade
} from "@material-ui/core";
import {
  Delete,
  SwapHoriz,
  Schedule,
  VolumeOff,
  VolumeUp,
  Close,
  Warning,
  Settings,
  Info
} from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles((theme) => ({
  // ===== MENU MODERNO =====
  modernMenu: {
    "& .MuiPaper-root": {
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
      minWidth: "280px",
      backgroundColor: "white",
    }
  },

  // ===== HEADER DO MENU =====
  menuHeader: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
    
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "40px",
      height: "2px",
      backgroundColor: "#3b82f6",
      borderRadius: "1px",
    },
  },

  headerTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
  },

  // ===== SEÇÕES DO MENU =====
  menuSection: {
    padding: theme.spacing(1, 0),
  },

  sectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: theme.spacing(1, 3),
    marginBottom: theme.spacing(0.5),
  },

  // ===== ITENS DO MENU =====
  modernMenuItem: {
    padding: theme.spacing(1.5, 3),
    minHeight: "48px",
    transition: "all 0.2s ease",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    
    "&:hover": {
      backgroundColor: "#f8fafc",
      transform: "translateX(4px)",
      
      "&::before": {
        opacity: 1,
        width: "4px",
      }
    },
    
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "0px",
      backgroundColor: "#3b82f6",
      transition: "all 0.2s ease",
      opacity: 0,
    },
  },

  // ===== CORES DOS ITENS =====
  dangerItem: {
    "&:hover": {
      backgroundColor: "#fef2f2",
      
      "&::before": {
        backgroundColor: "#ef4444",
      },
      
      "& .MuiListItemIcon-root": {
        color: "#ef4444",
      },
      
      "& .MuiTypography-root": {
        color: "#ef4444",
      }
    },
  },

  warningItem: {
    "&:hover": {
      backgroundColor: "#fffbeb",
      
      "&::before": {
        backgroundColor: "#f59e0b",
      },
      
      "& .MuiListItemIcon-root": {
        color: "#f59e0b",
      },
      
      "& .MuiTypography-root": {
        color: "#f59e0b",
      }
    },
  },

  successItem: {
    "&:hover": {
      backgroundColor: "#ecfdf5",
      
      "&::before": {
        backgroundColor: "#10b981",
      },
      
      "& .MuiListItemIcon-root": {
        color: "#10b981",
      },
      
      "& .MuiTypography-root": {
        color: "#10b981",
      }
    },
  },

  infoItem: {
    "&:hover": {
      backgroundColor: "#eff6ff",
      
      "&::before": {
        backgroundColor: "#3b82f6",
      },
      
      "& .MuiListItemIcon-root": {
        color: "#3b82f6",
      },
      
      "& .MuiTypography-root": {
        color: "#3b82f6",
      }
    },
  },

  // ===== ÍCONES DOS ITENS =====
  itemIcon: {
    minWidth: "auto",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    
    "& svg": {
      fontSize: "16px",
    }
  },

  // ===== CONTEÚDO DOS ITENS =====
  itemContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  itemTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a202c",
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.25),
  },

  itemDescription: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.3,
  },

  // ===== SWITCH CUSTOMIZADO =====
  modernSwitch: {
    padding: theme.spacing(1.5, 3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    minHeight: "48px",
    transition: "all 0.2s ease",
    position: "relative",
    cursor: "pointer",
    
    "&:hover": {
      backgroundColor: "#f8fafc",
      transform: "translateX(4px)",
      
      "&::before": {
        opacity: 1,
        width: "4px",
      }
    },
    
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "0px",
      backgroundColor: "#3b82f6",
      transition: "all 0.2s ease",
      opacity: 0,
    },
  },

  switchIcon: {
    minWidth: "auto",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    
    "& svg": {
      fontSize: "16px",
    }
  },

  switchContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  switchTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a202c",
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.25),
  },

  switchDescription: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.3,
  },

  customSwitch: {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#3b82f6",
      
      "& + .MuiSwitch-track": {
        backgroundColor: "#3b82f6",
        opacity: 0.5,
      }
    },
    
    "& .MuiSwitch-track": {
      backgroundColor: "#e2e8f0",
    }
  },

  // ===== STATUS INDICATOR =====
  statusIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    marginLeft: "auto",
  },

  statusIndicatorOff: {
    backgroundColor: "#ef4444",
  },

  // ===== DIVIDER CUSTOMIZADO =====
  modernDivider: {
    margin: theme.spacing(1, 0),
    backgroundColor: "#f1f5f9",
    height: "1px",
  },

  // ===== BADGES E LABELS =====
  menuBadge: {
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
    marginLeft: "auto",
  },

  warningBadge: {
    backgroundColor: "#f59e0b",
  },

  successBadge: {
    backgroundColor: "#10b981",
  },

  // ===== ANIMAÇÕES =====
  fadeIn: {
    animation: "$fadeIn 0.3s ease-in",
  },

  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(-10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    modernMenu: {
      "& .MuiPaper-root": {
        minWidth: "260px",
        maxWidth: "90vw",
      }
    },
    
    menuHeader: {
      padding: theme.spacing(1.5, 2),
    },
    
    modernMenuItem: {
      padding: theme.spacing(1, 2),
      minHeight: "44px",
    },
    
    modernSwitch: {
      padding: theme.spacing(1, 2),
      minHeight: "44px",
    },
  },
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const classes = useStyles();
  
  // ===== TODOS OS ESTADOS EXISTENTES PERMANECEM IGUAIS =====
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acceptAudioMessage, setAcceptAudio] = useState(ticket.contact.acceptAudioMessage);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===== TODAS AS FUNÇÕES EXISTENTES PERMANECEM IGUAIS =====
  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenConfirmationModal = e => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = e => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleCloseTicketWithoutFarewellMsg = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
      });

      setLoading(false);
      history.push("/tickets");
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleContactToggleAcceptAudio = async () => {
    try {
      const contact = await api.put(
        `/contacts/toggleAcceptAudio/${ticket.contact.id}`
      );
      setAcceptAudio(contact.data.acceptAudioMessage);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenScheduleModal = () => {
    handleClose();
    setContactId(ticket.contact.id);
    setScheduleModalOpen(true);
  }

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setContactId(null);
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
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
        elevation={0}
      >
        {/* HEADER DO MENU */}
        <div className={classes.menuHeader}>
          <Typography className={classes.headerTitle}>
            <Settings />
            Opciones del Ticket
          </Typography>
          <Typography className={classes.headerSubtitle}>
            Ticket #{ticket.id} • {ticket.contact.name}
          </Typography>
        </div>

        {/* SECCIÓN: ACCIONES RÁPIDAS */}
        <div className={classes.menuSection}>
          <Typography className={classes.sectionTitle}>
            Acciones rápidas
          </Typography>

          {/* CERRAR SIN DESPEDIDA */}
          <MenuItem 
            className={`${classes.modernMenuItem} ${classes.warningItem}`}
            onClick={handleCloseTicketWithoutFarewellMsg}
          >
            <ListItemIcon className={classes.itemIcon}>
              <Close />
            </ListItemIcon>
            <div className={classes.itemContent}>
              <Typography className={classes.itemTitle}>
                Cerrar sin despedida
              </Typography>
              <Typography className={classes.itemDescription}>
                Cierra la atención sin enviar un mensaje final
              </Typography>
            </div>
          </MenuItem>

          {/* AGENDAR */}
          <MenuItem 
            className={`${classes.modernMenuItem} ${classes.infoItem}`}
            onClick={handleOpenScheduleModal}
          >
            <ListItemIcon className={classes.itemIcon}>
              <Schedule />
            </ListItemIcon>
            <div className={classes.itemContent}>
              <Typography className={classes.itemTitle}>
                Agendar Retorno
              </Typography>
              <Typography className={classes.itemDescription}>
                Definir data/hora para retornar ao cliente
              </Typography>
            </div>
          </MenuItem>

          {/* TRANSFERIR */}
          <MenuItem 
            className={`${classes.modernMenuItem} ${classes.successItem}`}
            onClick={handleOpenTransferModal}
          >
            <ListItemIcon className={classes.itemIcon}>
              <SwapHoriz />
            </ListItemIcon>
            <div className={classes.itemContent}>
              <Typography className={classes.itemTitle}>
                Transferir Ticket
              </Typography>
              <Typography className={classes.itemDescription}>
                Enviar para outro usuário ou departamento
              </Typography>
            </div>
          </MenuItem>
        </div>

        <Divider className={classes.modernDivider} />

        {/* SEÇÃO: CONFIGURAÇÕES */}
        <div className={classes.menuSection}>
          <Typography className={classes.sectionTitle}>
            Configurações do Contato
          </Typography>

          {/* SWITCH DE AUDIO */}
          <div 
            className={classes.modernSwitch}
            onClick={handleContactToggleAcceptAudio}
          >
            <div className={classes.switchIcon}>
              {acceptAudioMessage ? <VolumeUp /> : <VolumeOff />}
            </div>
            <div className={classes.switchContent}>
              <Typography className={classes.switchTitle}>
                Mensajes de Audio
              </Typography>
              <Typography className={classes.switchDescription}>
                {acceptAudioMessage ? "Audios permitidos" : "Audios bloqueados"}
              </Typography>
            </div>
            <Switch
              size="small"
              checked={acceptAudioMessage}
              onChange={() => {}}
              className={classes.customSwitch}
              color="primary"
            />
          </div>
        </div>

        <Divider className={classes.modernDivider} />

        {/* SEÇÃO: ZONA DE PERIGO */}
        <div className={classes.menuSection}>
          <Typography className={classes.sectionTitle}>
            Zona de Perigo
          </Typography>

          {/* DELETAR TICKET */}
          <Can
            role={user.profile}
            perform="ticket-options:deleteTicket"
            yes={() => (
              <MenuItem 
                className={`${classes.modernMenuItem} ${classes.dangerItem}`}
                onClick={handleOpenConfirmationModal}
              >
                <ListItemIcon className={classes.itemIcon}>
                  <Delete />
                </ListItemIcon>
                <div className={classes.itemContent}>
                  <Typography className={classes.itemTitle}>
                    Eliminar ticket
                  </Typography>
                  <Typography className={classes.itemDescription}>
                    Elimina permanentemente el ticket del sistema
                  </Typography>
                </div>
                <div className={classes.menuBadge}>
                  <Warning style={{ fontSize: 10 }} />
                </div>
              </MenuItem>
            )}
          />
        </div>
      </Menu>

      {/* MODAIS */}
      <ConfirmationModal
        title={`Confirmar eliminación del ticket #${ticket.id}`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        <Box textAlign="center" p={2}>
          <Warning style={{ fontSize: 48, color: "#f59e0b", marginBottom: 16 }} />
          <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 600 }}>
            ¡Esta acción no se puede deshacer!
          </Typography>
          <Typography style={{ color: "#64748b", marginBottom: 16 }}>
            El ticket y todo el historial de conversaciones del contacto <strong>{ticket.contact.name}</strong> serán eliminados permanentemente del sistema.
          </Typography>
          <Chip
            label="Acción Irreversible"
            style={{
              backgroundColor: "#fef2f2",
              color: "#ef4444",
              fontWeight: 600,
              border: "1px solid #fecaca"
            }}
          />
        </Box>
      </ConfirmationModal>

      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        aria-labelledby="form-dialog-title"
        contactId={contactId}
      />
    </>
  );
};

export default TicketOptionsMenu;