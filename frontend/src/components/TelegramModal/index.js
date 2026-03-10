import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import { Telegram } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: "#0088cc",
    color: "white",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  instructionBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: "1px solid #e0e0e0",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#0088cc",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    marginRight: 8,
  },
  link: {
    color: "#0088cc",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
}));

const TelegramModal = ({ open, onClose, connectionId, companyId }) => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  const webhookUrl = connectionId ? `${backendUrl.replace(/\/$/, "")}/telegram-webhook/${connectionId}` : "";

  useEffect(() => {
    if (!open) return;
    setName("");
    setToken("");
    setGreetingMessage("");
    if (connectionId) {
      setLoading(true);
      api
        .get(`/whatsapp/${connectionId}?session=0`)
        .then(({ data }) => {
          setName(data.name || "");
          setToken(data.token ? "••••••••••••" : "");
          setGreetingMessage(data.greetingMessage || "");
        })
        .catch(toastError)
        .finally(() => setLoading(false));
    }
  }, [open, connectionId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Ingrese un nombre para la conexión.");
      return;
    }
    if (!connectionId) {
      if (!token.trim() || token === "••••••••••••") {
        toast.error("Ingrese el token del bot de Telegram.");
        return;
      }
      setLoading(true);
      try {
        const queues = await api.get("/queue").then((r) => r.data);
        const queueIds = queues?.map((q) => q.id) || [];
        if (queueIds.length > 1 && !greetingMessage.trim()) {
          toast.error(i18n.t("errors.ERR_WAPP_GREETING_REQUIRED") || "El mensaje de saludo es obligatorio cuando hay más de una fila.");
          setLoading(false);
          return;
        }
        const { data } = await api.post("/whatsapp", {
          name: name.trim(),
          token: token.trim(),
          channel: "telegram",
          status: "CONNECTED",
          queueIds,
          isDefault: false,
          greetingMessage: greetingMessage.trim() || undefined,
        });
        toast.success("Conexión Telegram creada. Configure el webhook.");
        onClose();
        if (data?.id) {
          handleSetWebhook(data.id);
        }
        window.location.reload();
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await api.put(`/whatsapp/${connectionId}`, {
          name: name.trim(),
          greetingMessage: greetingMessage.trim() || undefined,
          ...(token !== "••••••••••••" && token.trim() ? { token: token.trim() } : {}),
        });
        toast.success("Conexión actualizada.");
        onClose();
        window.location.reload();
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetWebhook = async (connId) => {
    const id = connId || connectionId;
    if (!id) return;
    setSettingWebhook(true);
    try {
      await api.post(`/telegram/set-webhook/${id}`);
      toast.success("Webhook configurado correctamente.");
    } catch (err) {
      toastError(err);
    } finally {
      setSettingWebhook(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        <Telegram style={{ fontSize: 28 }} />
        {i18n.t("connections.telegram.title") || "Conectar Telegram"}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          label={i18n.t("connections.telegram.name") || "Nombre de la conexión"}
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mi Bot Telegram"
          disabled={loading}
          style={{ marginBottom: 16 }}
        />

        {!connectionId && (
          <TextField
            label={i18n.t("connections.telegram.token") || "Token del bot"}
            fullWidth
            variant="outlined"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            disabled={loading}
            helperText="Obtenga el token en @BotFather de Telegram"
            style={{ marginBottom: 16 }}
          />
        )}

        <TextField
          label={i18n.t("queueModal.form.greetingMessage") || "Mensaje de saludo"}
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={greetingMessage}
          onChange={(e) => setGreetingMessage(e.target.value)}
          placeholder="¡Hola! ¿En qué puedo ayudarte?"
          disabled={loading}
          helperText={
            i18n.t("connections.telegram.greetingHelper") ||
            "Obligatorio cuando hay más de una fila. Se muestra al usuario al iniciar conversación."
          }
          style={{ marginBottom: 16 }}
        />

        <Box className={classes.instructionBox}>
          <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
            <span className={classes.stepNumber}>1</span>
            Crear bot en Telegram
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Abra{" "}
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className={classes.link}>
              @BotFather
            </a>{" "}
            en Telegram, envíe /newbot y siga las instrucciones. Copie el token que le proporcione.
          </Typography>
        </Box>

        {connectionId && webhookUrl && (
          <Box className={classes.instructionBox}>
            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
              <span className={classes.stepNumber}>2</span>
              Configurar webhook
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
              Después de guardar, haga clic en "Configurar webhook" para que Telegram envíe los mensajes a su servidor.
            </Typography>
            <Typography variant="caption" display="block" style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
              {webhookUrl}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: 16 }}>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        {connectionId && (
          <Button
            onClick={() => handleSetWebhook()}
            color="primary"
            disabled={settingWebhook}
          >
            {settingWebhook ? <CircularProgress size={24} /> : "Configurar webhook"}
          </Button>
        )}
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : connectionId ? "Guardar" : "Crear conexión"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TelegramModal;
