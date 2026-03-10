import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  makeStyles,
} from "@material-ui/core";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  content: {
    minWidth: 360,
    paddingTop: 8,
  },
  formRow: {
    marginBottom: 20,
  },
  arrowBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "12px 0",
    "& svg": {
      fontSize: 28,
      color: theme.palette.primary.main,
    },
  },
}));

const TransferTicketsModal = ({ open, onClose, connections, onSuccess }) => {
  const classes = useStyles();
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setSourceId("");
    setDestinationId("");
    onClose();
  };

  const handleTransfer = async () => {
    if (!sourceId || !destinationId) {
      return;
    }
    if (sourceId === destinationId) {
      return;
    }
    setLoading(true);
    try {
      await api.post("/tickets/transfer-between-connections", {
        sourceWhatsappId: Number(sourceId),
        destinationWhatsappId: Number(destinationId),
      });
      toast.success(i18n.t("connections.transferTickets.success"));
      onSuccess?.();
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const canTransfer = sourceId && destinationId && sourceId !== destinationId;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("connections.transferTickets.title")}</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2" color="textSecondary" className={classes.formRow}>
          {i18n.t("connections.transferTickets.description")}
        </Typography>
        <FormControl fullWidth variant="outlined" className={classes.formRow}>
          <InputLabel>{i18n.t("connections.transferTickets.source")}</InputLabel>
          <Select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            label={i18n.t("connections.transferTickets.source")}
          >
            <MenuItem value="">
              <em>{i18n.t("connections.transferTickets.selectConnection")}</em>
            </MenuItem>
            {(connections || []).map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>
                {conn.name} {conn.channel ? `(${conn.channel})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box className={classes.arrowBox}>
          <SwapHorizIcon />
        </Box>
        <FormControl fullWidth variant="outlined" className={classes.formRow}>
          <InputLabel>{i18n.t("connections.transferTickets.destination")}</InputLabel>
          <Select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            label={i18n.t("connections.transferTickets.destination")}
          >
            <MenuItem value="">
              <em>{i18n.t("connections.transferTickets.selectConnection")}</em>
            </MenuItem>
            {(connections || []).map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>
                {conn.name} {conn.channel ? `(${conn.channel})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={handleClose} color="default">
          {i18n.t("connections.transferTickets.cancel")}
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          color="primary"
          disabled={!canTransfer || loading}
        >
          {loading ? "..." : i18n.t("connections.transferTickets.transfer")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferTicketsModal;
