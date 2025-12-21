import React, { useCallback, useContext, useEffect, useState } from "react";

import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
  Card,
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  CircularProgress
} from "@material-ui/core";
import { 
  GetApp, 
  Close, 
  PictureAsPdf, 
  CheckCircle,
  Error as ErrorIcon,
  Info
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessagesList from "../MessagesList";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import html2pdf from "html2pdf.js";

const useStyles = makeStyles((theme) => ({
  // ===== DIALOG MODERNO =====
  modernDialog: {
    "& .MuiPaper-root": {
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
      maxWidth: "90vw",
      maxHeight: "90vh",
      minWidth: "600px",
      minHeight: "500px",
    }
  },

  // ===== HEADER DO DIALOG =====
  dialogHeader: {
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
    
    "&::after": {
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

  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
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

  dialogTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  dialogSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
  },

  closeButton: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    width: "36px",
    height: "36px",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    
    "&:hover": {
      backgroundColor: "#fef2f2",
      borderColor: "#ef4444",
      color: "#ef4444",
    },
  },

  // ===== CONTEÚDO DO DIALOG =====
  dialogContent: {
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    minHeight: "400px",
  },

  // ===== CARDS DE STATUS =====
  statusCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    transition: "all 0.2s ease",
  },

  statusCardProcessing: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },

  statusCardSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },

  statusCardError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },

  statusIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },

  statusIconProcessing: {
    backgroundColor: "#3b82f6",
  },

  statusIconSuccess: {
    backgroundColor: "#10b981",
  },

  statusIconError: {
    backgroundColor: "#ef4444",
  },

  statusText: {
    flex: 1,
  },

  statusTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  statusDescription: {
    fontSize: "14px",
    color: "#64748b",
  },

  // ===== ÁREA DE EXPORTAÇÃO =====
  exportContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
  },

  exportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },

  exportTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  exportOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },

  optionCard: {
    padding: theme.spacing(2),
    backgroundColor: "white",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
    },
    
    "&.selected": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
    },
  },

  optionIcon: {
    fontSize: "24px",
    color: "#3b82f6",
    marginBottom: theme.spacing(1),
  },

  optionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
  },

  optionDescription: {
    fontSize: "12px",
    color: "#64748b",
  },

  // ===== PROGRESSO =====
  progressContainer: {
    marginTop: theme.spacing(2),
  },

  progressText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },

  progressBar: {
    borderRadius: "4px",
    backgroundColor: "#f1f5f9",
    
    "& .MuiLinearProgress-bar": {
      backgroundColor: "#3b82f6",
    },
  },

  // ===== AÇÕES DO DIALOG =====
  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    gap: theme.spacing(2),
    justifyContent: "space-between",
  },

  actionButton: {
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    textTransform: "none",
    transition: "all 0.2s ease",
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    
    "&:disabled": {
      backgroundColor: "#94a3b8",
      color: "white",
    },
  },

  secondaryButton: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    
    "&:hover": {
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
    },
  },

  // ===== INFORMAÇÕES DO TICKET =====
  ticketInfo: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: theme.spacing(2),
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(2),
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: theme.spacing(2),
  },

  infoItem: {
    textAlign: "center",
  },

  infoLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(0.5),
  },

  infoValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a202c",
  },

  // ===== RESPONSIVIDADE =====
  "@media (max-width: 768px)": {
    modernDialog: {
      "& .MuiPaper-root": {
        minWidth: "95vw",
        minHeight: "80vh",
        margin: theme.spacing(1),
      }
    },
    
    dialogHeader: {
      padding: theme.spacing(2),
    },
    
    dialogContent: {
      padding: theme.spacing(2),
    },
    
    exportOptions: {
      gridTemplateColumns: "1fr",
    },
    
    infoGrid: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
}));

export default function TicketMessagesDialog({ open, handleClose, ticketId }) {
  const history = useHistory();
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [progress, setProgress] = useState(0);
  const [ticket, setTicket] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  // ===== CARREGAMENTO DO TICKET =====
  useEffect(() => {
    if (open && ticketId) {
      fetchTicketData();
    }
  }, [open, ticketId]);

  const fetchTicketData = async () => {
    try {
      const { data } = await api.get(`/tickets/u/${ticketId}`);
      setTicket(data);
    } catch (err) {
      toastError("Error al cargar datos del ticket");
    }
  };

  // ===== FUNCIÓN DE EXPORTACIÓN =====
  const handleExportToPDF = useCallback(async () => {
    setLoading(true);
    setExportStatus('processing');
    setProgress(0);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Buscar elementos para exportación
      const messagesListElement = document.getElementById("messagesList");
      const headerElement = document.getElementById("TicketHeader");

      if (!messagesListElement) {
        throw new Error("Elemento de mensajes no encontrado");
      }

      // Configuraciones del PDF
      const pdfOptions = {
        margin: 1,
        filename: `reporte_atencion_${ticketId}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Crear container para el PDF
      const containerElement = document.createElement("div");
      containerElement.style.backgroundColor = '#ffffff';
      containerElement.style.padding = '20px';
      containerElement.style.fontFamily = 'Arial, sans-serif';

      // Añadir encabezado personalizado
      const headerClone = document.createElement("div");
      headerClone.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
          <h1 style="color: #1a202c; margin: 0 0 10px 0;">Reporte de Atención</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Ticket #${ticketId} - ${new Date().toLocaleDateString('pt-BR')}</p>
          ${ticket ? `
            <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: left;">
              <div><strong>Contato:</strong> ${ticket.contact?.name || 'N/A'}</div>
              <div><strong>Status:</strong> ${ticket.status || 'N/A'}</div>
              <div><strong>Usuário:</strong> ${ticket.user?.name || 'N/A'}</div>
              <div><strong>Fila:</strong> ${ticket.queue?.name || 'N/A'}</div>
            </div>
          ` : ''}
        </div>
      `;

      // Clonar e preparar mensagens
      const messagesListClone = messagesListElement.cloneNode(true);
      messagesListClone.style.maxHeight = 'none';
      messagesListClone.style.overflow = 'visible';

      // Montar container final
      containerElement.appendChild(headerClone);
      containerElement.appendChild(messagesListClone);

      // Gerar PDF
      await html2pdf()
        .from(containerElement)
        .set(pdfOptions)
        .save();

      clearInterval(progressInterval);
      setProgress(100);
      setExportStatus('success');
      
      toast.success("PDF exportado com sucesso!");
      
      // Fechar dialog após sucesso
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Erro na exportação:", error);
      setExportStatus('error');
      toastError("Erro ao exportar PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, ticket, handleClose]);

  // ===== AUTO-EXPORTAÇÃO =====
  useEffect(() => {
    if (open && ticketId) {
      // Auto-exportar após um breve delay
      const timer = setTimeout(() => {
        handleExportToPDF();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [open, ticketId, handleExportToPDF]);

  const getStatusContent = () => {
    switch (exportStatus) {
      case 'processing':
        return {
          icon: <CircularProgress size={20} style={{ color: 'white' }} />,
          title: "Processando exportação...",
          description: "Preparando o relatório em PDF. Aguarde alguns instantes.",
          cardClass: classes.statusCardProcessing,
          iconClass: classes.statusIconProcessing,
        };
      case 'success':
        return {
          icon: <CheckCircle />,
          title: "Exportação concluída!",
          description: "O arquivo PDF foi gerado e salvo com sucesso.",
          cardClass: classes.statusCardSuccess,
          iconClass: classes.statusIconSuccess,
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          title: "Erro na exportação",
          description: "Não foi possível gerar o arquivo PDF. Tente novamente.",
          cardClass: classes.statusCardError,
          iconClass: classes.statusIconError,
        };
      default:
        return {
          icon: <Info />,
          title: "Preparando exportação...",
          description: "Carregando dados do ticket para gerar o relatório.",
          cardClass: classes.statusCard,
          iconClass: classes.statusIcon,
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      className={classes.modernDialog}
      maxWidth={false}
    >
      {/* HEADER */}
      <div className={classes.dialogHeader}>
        <div className={classes.headerContent}>
          <div className={classes.headerIcon}>
            <PictureAsPdf />
          </div>
          <div className={classes.headerInfo}>
            <Typography className={classes.dialogTitle}>
              Exportar Conversa em PDF
            </Typography>
            <Typography className={classes.dialogSubtitle}>
              Gere um relatório completo do atendimento
            </Typography>
          </div>
        </div>
        <IconButton
          className={classes.closeButton}
          onClick={handleClose}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </div>

      {/* CONTEÚDO */}
      <DialogContent className={classes.dialogContent}>
        {/* INFORMAÇÕES DO TICKET */}
        {ticket && (
          <Card className={classes.ticketInfo} elevation={0}>
            <div className={classes.infoGrid}>
              <div className={classes.infoItem}>
                <div className={classes.infoLabel}>Ticket</div>
                <div className={classes.infoValue}>#{ticket.id}</div>
              </div>
              <div className={classes.infoItem}>
                <div className={classes.infoLabel}>Contato</div>
                <div className={classes.infoValue}>{ticket.contact?.name || 'N/A'}</div>
              </div>
              <div className={classes.infoItem}>
                <div className={classes.infoLabel}>Status</div>
                <div className={classes.infoValue}>
                  <Chip 
                    label={ticket.status} 
                    size="small"
                    style={{
                      backgroundColor: ticket.status === 'open' ? '#10b981' : 
                                     ticket.status === 'closed' ? '#ef4444' : '#f59e0b',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>
              <div className={classes.infoItem}>
                <div className={classes.infoLabel}>Usuário</div>
                <div className={classes.infoValue}>{ticket.user?.name || 'N/A'}</div>
              </div>
            </div>
          </Card>
        )}

        {/* STATUS DA EXPORTAÇÃO */}
        <Fade in={true}>
          <Card className={`${classes.statusCard} ${statusContent.cardClass}`} elevation={0}>
            <div className={`${classes.statusIcon} ${statusContent.iconClass}`}>
              {statusContent.icon}
            </div>
            <div className={classes.statusText}>
              <Typography className={classes.statusTitle}>
                {statusContent.title}
              </Typography>
              <Typography className={classes.statusDescription}>
                {statusContent.description}
              </Typography>
            </div>
          </Card>
        </Fade>

        {/* BARRA DE PROGRESSO */}
        {exportStatus === 'processing' && (
          <div className={classes.progressContainer}>
            <Typography className={classes.progressText}>
              Progresso: {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              className={classes.progressBar}
            />
          </div>
        )}

        {/* OPÇÕES DE EXPORTAÇÃO */}
        <div className={classes.exportContainer}>
          <div className={classes.exportHeader}>
            <Typography className={classes.exportTitle}>
              <GetApp />
              Formato de Exportação
            </Typography>
          </div>
          
          <div className={classes.exportOptions}>
            <div 
              className={`${classes.optionCard} ${selectedFormat === 'pdf' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('pdf')}
            >
              <PictureAsPdf className={classes.optionIcon} />
              <div className={classes.optionTitle}>PDF Completo</div>
              <div className={classes.optionDescription}>
                Relatório formatado com todas as mensagens
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* AÇÕES */}
      <DialogActions className={classes.dialogActions}>
        <Button
          className={`${classes.actionButton} ${classes.secondaryButton}`}
          onClick={handleClose}
          disabled={loading}
        >
          Cerrar
        </Button>
        
        <Box display="flex" gap={1}>
          {exportStatus === 'error' && (
            <Button
              className={`${classes.actionButton} ${classes.primaryButton}`}
              onClick={handleExportToPDF}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <GetApp />}
            >
              Tentar Novamente
            </Button>
          )}
          
          {exportStatus === 'idle' && (
            <Button
              className={`${classes.actionButton} ${classes.primaryButton}`}
              onClick={handleExportToPDF}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <GetApp />}
            >
              Exportar PDF
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}