import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialog: {
    borderRadius: 12,
  },
  dialogTitle: {
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginTop: 4,
  },
  dialogContent: {
    paddingTop: 8,
    minWidth: 360,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  actions: {
    padding: theme.spacing(2, 3),
  },
  btnCancel: {
    textTransform: "none",
  },
  btnSend: {
    textTransform: "none",
    backgroundColor: "#25d366",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#20bd5a",
    },
  },
}));

const COUNTRY_CODES = [
  { code: "57", label: "+57 Colombia" },
  { code: "506", label: "+506 Costa Rica" },
  { code: "52", label: "+52 México" },
  { code: "55", label: "+55 Brasil" },
  { code: "54", label: "+54 Argentina" },
  { code: "58", label: "+58 Venezuela" },
  { code: "51", label: "+51 Perú" },
  { code: "56", label: "+56 Chile" },
  { code: "593", label: "+593 Ecuador" },
  { code: "1", label: "+1 USA/Canadá" },
  { code: "34", label: "+34 España" },
  { code: "961", label: "+961 Líbano" },
  { code: "44", label: "+44 Reino Unido" },
  { code: "39", label: "+39 Italia" },
  { code: "33", label: "+33 Francia" },
];

const SendWhatsAppMessageModal = ({ open, onClose }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [countryCode, setCountryCode] = useState("506");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setPhoneNumber(v);
  };

  const handleClose = () => {
    setCountryCode("506");
    setPhoneNumber("");
    setMessage("");
    setSending(false);
    onClose();
  };

  const handleSend = async () => {
    const numberOnly = phoneNumber.replace(/\D/g, "");
    if (!numberOnly || numberOnly.length < 8) {
      toast.error(i18n.t("sendWhatsAppMessage.invalidNumber") || "Ingrese un número de teléfono válido.");
      return;
    }
    if (!message.trim()) {
      toast.error(i18n.t("sendWhatsAppMessage.invalidMessage") || "Escriba el mensaje.");
      return;
    }

    const fullNumber = countryCode.replace(/\D/g, "") + numberOnly;
    setSending(true);

    try {
      let contactId = null;

      const { data: contactsData } = await api.get("/contacts", {
        params: { searchParam: fullNumber },
      });
      const contacts = contactsData?.contacts || [];
      const existing = contacts.find((c) => String(c.number).replace(/\D/g, "") === String(fullNumber).replace(/\D/g, ""));
      if (existing) {
        contactId = existing.id;
      } else {
        const { data: newContact } = await api.post("/contacts", {
          name: fullNumber,
          number: fullNumber,
        });
        contactId = newContact.id;
      }

      const queueId = user.queues?.length ? user.queues[0].id : null;
      const whatsappId = user.whatsappId || (await api.get("/whatsapp").then((r) => r.data[0]?.id)) || null;
      if (!whatsappId) {
        toast.error(i18n.t("sendWhatsAppMessage.noConnection") || "No hay conexión de WhatsApp configurada.");
        setSending(false);
        return;
      }

      const { data: ticket } = await api.post("/tickets", {
        contactId,
        queueId,
        whatsappId,
        userId: user.id,
        status: "open",
      });

      await api.post(`/messages/${ticket.id}`, {
        body: message.trim(),
        read: 1,
        fromMe: true,
      });

      toast.success(i18n.t("sendWhatsAppMessage.sent") || "Mensaje enviado.");
      handleClose();
      history.push(`/atendimentos/${ticket.uuid || ticket.id}`);
    } catch (err) {
      if (err.response?.data?.message?.includes("Já existe") || err.response?.data?.error === "ERR_DUPLICATED_CONTACT") {
        try {
          const { data: list } = await api.get("/contacts", { params: { searchParam: fullNumber } });
          const contact = (list?.contacts || []).find((c) => String(c.number).replace(/\D/g, "") === String(fullNumber).replace(/\D/g, ""));
          if (contact) {
            const queueId = user.queues?.length ? user.queues[0].id : null;
            const whatsappId = user.whatsappId || (await api.get("/whatsapp").then((r) => r.data[0]?.id)) || null;
            const { data: ticket } = await api.post("/tickets", {
              contactId: contact.id,
              queueId,
              whatsappId,
              userId: user.id,
              status: "open",
            });
            await api.post(`/messages/${ticket.id}`, { body: message.trim(), read: 1, fromMe: true });
            toast.success(i18n.t("sendWhatsAppMessage.sent") || "Mensaje enviado.");
            handleClose();
            history.push(`/atendimentos/${ticket.uuid || ticket.id}`);
            return;
          }
        } catch (e) {
          toastError(e);
        }
      } else {
        toastError(err);
      }
      setSending(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={handleClose} className={classes.dialog} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        {i18n.t("sendWhatsAppMessage.title") || "Enviar Mensaje de WhatsApp"}
        <Typography className={classes.subtitle} component="p">
          {i18n.t("sendWhatsAppMessage.subtitle") || "Envía un mensaje a un número que no te ha escrito"}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <FormControl fullWidth variant="outlined" size="small" className={classes.field}>
          <InputLabel>{i18n.t("sendWhatsAppMessage.countryCode") || "Código"}</InputLabel>
          <Select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            label={i18n.t("sendWhatsAppMessage.countryCode") || "Código"}
          >
            {COUNTRY_CODES.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label={i18n.t("sendWhatsAppMessage.phoneLabel") || "Número de teléfono"}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="87021234"
          helperText={i18n.t("sendWhatsAppMessage.phoneHint") || "Solo números, sin espacios ni guiones"}
          className={classes.field}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label={i18n.t("sendWhatsAppMessage.messageLabel") || "Mensaje"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          className={classes.field}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={handleClose} className={classes.btnCancel} disabled={sending}>
          {i18n.t("sendWhatsAppMessage.cancel") || "Cancelar"}
        </Button>
        <Button variant="contained" onClick={handleSend} className={classes.btnSend} disabled={sending}>
          {sending ? (i18n.t("sendWhatsAppMessage.sending") || "Enviando…") : (i18n.t("sendWhatsAppMessage.send") || "Enviar Mensaje")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendWhatsAppMessageModal;
