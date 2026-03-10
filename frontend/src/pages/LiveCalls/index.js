import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Chip,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import {
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Backspace as BackspaceIcon,
  PhoneInTalk as PhoneInTalkIcon,
} from "@material-ui/icons";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

import { Device } from "@twilio/voice-sdk";

const DIALPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 440,
    margin: "0 auto",
    backgroundColor: theme.palette.background?.default || "transparent",
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: theme.palette.type === "dark" ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
    backgroundColor: theme.palette.background?.paper || (theme.palette.type === "dark" ? "#1e1e1e" : "#ffffff"),
  },
  title: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary?.main || "#1976d2",
    fontWeight: 500,
  },
  statusChip: {
    marginBottom: theme.spacing(2),
  },
  timer: {
    fontSize: 28,
    fontWeight: 700,
    color: "#22c55e",
    textAlign: "center",
    marginBottom: theme.spacing(2),
    fontFamily: "monospace",
  },
  input: {
    marginBottom: theme.spacing(1),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    },
  },
  dialpad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  dialpadBtn: {
    width: "100%",
    height: 56,
    fontSize: 20,
    fontWeight: 600,
    borderRadius: 12,
  },
  callBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#16a34a",
    },
    "&:disabled": {
      backgroundColor: "#ccc",
    },
  },
  hangupBtn: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: "#e11d48",
    color: "#fff",
    marginBottom: theme.spacing(1),
    "&:hover": {
      backgroundColor: "#be123c",
    },
  },
  muteBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#64748b",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#475569",
    },
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: theme.spacing(2),
    backgroundColor: "#64748b",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#475569",
    },
  },
  hint: {
    fontSize: 12,
    color: theme.palette.text?.secondary || (theme.palette.type === "dark" ? "#9ca3af" : "#64748b"),
    marginTop: -theme.spacing(0.5),
    marginBottom: theme.spacing(2),
  },
}));

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatPhoneDisplay = (value) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits ? `+${digits}` : "";
  if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

const LiveCalls = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [device, setDevice] = useState(null);
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const deviceRef = useRef(null);
  const timerRef = useRef(null);

  const initDevice = useCallback(async () => {
    setError("");
    setInitializing(true);
    try {
      const { data } = await api.post("/twilio/token");
      const { token } = data;

      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }

      const newDevice = new Device(token, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"],
      });

      newDevice.on("error", (err) => {
        console.error("[Twilio Device] Error:", err);
        setError(err?.message || "Error del dispositivo Twilio");
        setStatus("disconnected");
      });
      newDevice.on("tokenWillExpire", async () => {
        try {
          const { data: tokenData } = await api.post("/twilio/token");
          newDevice.updateToken(tokenData.token);
        } catch (e) {
          console.error("[Twilio] Error renovando token:", e);
        }
      });
      deviceRef.current = newDevice;
      setDevice(newDevice);
      setStatus("ready");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Error al inicializar el dispositivo. Por favor, recarga la página o verifica tu configuración de Twilio.";
      setError(msg);
      setStatus("disconnected");
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    initDevice();
    return () => {
      if (deviceRef.current) deviceRef.current.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initDevice]);

  useEffect(() => {
    if (status === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleDialpad = (digit) => {
    setPhoneNumber((prev) => prev.replace(/\D/g, "") + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.replace(/\D/g, "").slice(0, -1));
  };

  const handleCall = async () => {
    if (!device || status !== "ready" || !phoneNumber.trim()) return;

    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 8) {
      setError(i18n.t("liveCalls.invalidNumber") || "Número inválido. Use formato internacional.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const to = `+${digits}`;
      const params = {
        To: to,
        CompanyId: String(user?.companyId || ""),
        UserId: String(user?.id || ""),
      };

      const conn = await device.connect({ params });

      setConnection(conn);
      setStatus("ringing");

      conn.on("accept", () => {
        setStatus("connected");
        toast.success(i18n.t("liveCalls.connected") || "Llamada conectada");
      });
      conn.on("disconnect", () => {
        setStatus("ready");
        setConnection(null);
      });
      conn.on("error", (err) => {
        setError(err?.message || "Error en la llamada");
        setStatus("ready");
        setConnection(null);
        toast.error(err?.message || "Error en la llamada");
      });
    } catch (err) {
      const msg = err?.message || err?.response?.data?.error || "Error al realizar la llamada";
      setError(msg);
      setStatus("ready");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleHangup = () => {
    if (connection) {
      connection.disconnect();
      setConnection(null);
      setStatus("ready");
    }
  };

  const handleMute = () => {
    if (connection) {
      setMuted((prev) => {
        connection.mute(!prev);
        return !prev;
      });
    }
  };

  const isInCall = status === "connected" || status === "ringing";

  const getStatusLabel = () => {
    switch (status) {
      case "ready":
        return i18n.t("liveCalls.statusReady") || "Listo para llamar";
      case "ringing":
        return i18n.t("liveCalls.statusRinging") || "Llamando...";
      case "connected":
        return i18n.t("liveCalls.statusConnected") || "En llamada";
      case "disconnected":
        return i18n.t("liveCalls.statusDisconnected") || "Desconectado";
      default:
        return status;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "ready":
        return "default";
      case "ringing":
        return "primary";
      case "connected":
        return "primary";
      case "disconnected":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className={classes.root}>
      <Title>{i18n.t("liveCalls.title")}</Title>

      <Paper className={classes.paper}>
        <Typography className={classes.title} variant="h6">
          {i18n.t("liveCalls.title")}
        </Typography>

        {!initializing && status !== "disconnected" && (
          <Chip
            icon={status === "connected" ? <PhoneInTalkIcon /> : undefined}
            label={getStatusLabel()}
            color={getStatusColor()}
            className={classes.statusChip}
            size="small"
          />
        )}

        {status === "connected" && (
          <Typography className={classes.timer}>{formatDuration(callDuration)}</Typography>
        )}

        {error && (
          <Typography className={classes.error} variant="body2">
            {error}
          </Typography>
        )}

        {initializing ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error && status === "disconnected" ? (
          <Box textAlign="center" py={2}>
            <Button variant="contained" className={classes.retryBtn} onClick={initDevice}>
              {i18n.t("liveCalls.retry")}
            </Button>
          </Box>
        ) : (
          <>
            <TextField
              label={i18n.t("liveCalls.phoneNumber")}
              value={formatPhoneDisplay(phoneNumber)}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              variant="outlined"
              fullWidth
              className={classes.input}
              disabled={isInCall}
              placeholder="+506 1234 5678"
              InputProps={{
                endAdornment: phoneNumber.length > 0 && !isInCall && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleBackspace} edge="end">
                      <BackspaceIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography className={classes.hint}>{i18n.t("liveCalls.formatHint")}</Typography>

            <div className={classes.dialpad}>
              {DIALPAD.flat().map((digit) => (
                <Button
                  key={digit}
                  variant="outlined"
                  className={classes.dialpadBtn}
                  onClick={() => handleDialpad(digit)}
                  disabled={isInCall}
                >
                  {digit}
                </Button>
              ))}
            </div>

            {isInCall ? (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.hangupBtn}
                  startIcon={<CallEndIcon />}
                  onClick={handleHangup}
                >
                  {i18n.t("liveCalls.hangup")}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.muteBtn}
                  startIcon={muted ? <MicOffIcon /> : <MicIcon />}
                  onClick={handleMute}
                >
                  {muted ? i18n.t("liveCalls.unmute") : i18n.t("liveCalls.mute")}
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="contained"
                className={classes.callBtn}
                startIcon={<PhoneIcon />}
                onClick={handleCall}
                disabled={loading || status !== "ready" || phoneNumber.replace(/\D/g, "").length < 8}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  i18n.t("liveCalls.call")
                )}
              </Button>
            )}
          </>
        )}
      </Paper>
    </div>
  );
};

export default LiveCalls;
