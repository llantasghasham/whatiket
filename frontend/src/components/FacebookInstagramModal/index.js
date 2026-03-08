import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@material-ui/core";
import { FileCopy, OpenInNew, Facebook, Instagram } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: "#1877f2",
    color: "white",
    padding: theme.spacing(2),
  },
  dialogContent: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(3),
  },
  dialogActions: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
  instructionBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: "1px solid #e0e0e0",
  },
  instructionTitle: {
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  instructionText: {
    color: "#666",
    fontSize: 13,
    marginBottom: theme.spacing(1),
  },
  copyField: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: "8px 12px",
    marginTop: theme.spacing(1),
    border: "1px solid #e0e0e0",
  },
  copyText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
    wordBreak: "break-all",
  },
  linkButton: {
    marginTop: theme.spacing(2),
    backgroundColor: "#1877f2",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#166fe5",
    },
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#1877f2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
  },
  tabsContainer: {
    borderBottom: "1px solid #e0e0e0",
    marginBottom: theme.spacing(2),
  },
  tab: {
    textTransform: "none",
    fontWeight: 500,
  },
  facebookTab: {
    color: "#3b5998",
  },
  instagramTab: {
    color: "#e1306c",
  },
}));

const FacebookInstagramModal = ({ open, onClose, whatsAppId, channel, companyId }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState(channel === "instagram" ? 1 : 0); // 0 = Facebook, 1 = Instagram

  // URL del backend - debe coincidir con BACKEND_URL del servidor
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
  const webhookUrl = `${backendUrl.replace(/\/$/, "")}/webhook`;
  const verifyToken = "whaticket";

  // companyId para OAuth state - desde props o localStorage
  const oauthState = companyId || localStorage.getItem("companyId") || "";

  const handleInstagramLogin = () => {
    if (!oauthState) {
      toast.error("No se pudo obtener el ID de la empresa. Cierre sesión y vuelva a entrar.");
      return;
    }
    const redirectUri = `${backendUrl.replace(/\/$/, "")}/instagram-callback`;
    const instagramOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management&response_type=code&state=${oauthState}`;
    window.location.href = instagramOAuthUrl;
  };

  const handleFacebookLogin = () => {
    if (!oauthState) {
      toast.error("No se pudo obtener el ID de la empresa. Cierre sesión y vuelva a entrar.");
      return;
    }
    const redirectUri = `${backendUrl.replace(/\/$/, "")}/facebook-callback`;
    const facebookOAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management&response_type=code&state=${oauthState}`;
    window.location.href = facebookOAuthUrl;
  };

  useEffect(() => {
    if (channel === "instagram") setActiveTab(1);
    else if (channel === "facebook") setActiveTab(0);
  }, [channel]);

  useEffect(() => {
    const fetchData = async () => {
      if (!whatsAppId || !open) return;

      setLoading(true);
      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}?session=0`);
        setName(data.name || "");
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [whatsAppId, open]);

  const handleClose = () => {
    onClose();
    setName("");
  };

  const handleSave = async () => {
    try {
      await api.put(`/whatsapp/${whatsAppId}`, {
        name,
      });

      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(i18n.t("common.toasts.linkCopiedClipboard"));
  };

  const openFacebookDeveloper = () => {
    window.open("https://developers.facebook.com/apps/", "_blank");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        {i18n.t("facebookInstagram.title")}
      </DialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        className={classes.tabsContainer}
        centered
      >
        <Tab 
          label="Facebook" 
          icon={<Facebook style={{ marginRight: 8 }} />}
          className={`${classes.tab} ${classes.facebookTab}`}
        />
        <Tab 
          label="Instagram" 
          icon={<Instagram style={{ marginRight: 8 }} />}
          className={`${classes.tab} ${classes.instagramTab}`}
        />
      </Tabs>

      <DialogContent className={classes.dialogContent}>
        {activeTab === 0 && (
          // Conteúdo do Facebook
          <>
            <TextField
              label={i18n.t("facebookInstagram.nameFacebook")}
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classes.textField}
              disabled={loading}
              placeholder={i18n.t("facebookInstagram.placeholderName")}
            />

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>1</span>
                {i18n.t("facebookInstagram.step1Connect")}
              </Typography>
              <Typography className={classes.instructionText}>
                {i18n.t("facebookInstagram.step1Desc")}
              </Typography>
              <Button
                variant="contained"
                className={classes.linkButton}
                startIcon={<Facebook />}
                onClick={handleFacebookLogin}
                fullWidth
                style={{ backgroundColor: "#3b5998" }}
              >
                {i18n.t("facebookInstagram.connectFacebook")}
              </Button>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>2</span>
                {i18n.t("facebookInstagram.step2Webhook")}
              </Typography>
              <Typography className={classes.instructionText}>
                {i18n.t("facebookInstagram.step2Desc")}
              </Typography>
              
              <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                {i18n.t("facebookInstagram.callbackUrl")}
              </Typography>
              <Box className={classes.copyField}>
                <Typography className={classes.copyText}>
                  {webhookUrl}
                </Typography>
                <Tooltip title={i18n.t("facebookInstagram.copyUrl")}>
                  <IconButton size="small" onClick={() => copyToClipboard(webhookUrl)}>
                    <FileCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box mt={2}>
                <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                  {i18n.t("facebookInstagram.verifyToken")}:
                </Typography>
                <Box className={classes.copyField}>
                  <Typography className={classes.copyText}>
                    {verifyToken}
                  </Typography>
                  <Tooltip title={i18n.t("facebookInstagram.copyToken")}>
                    <IconButton size="small" onClick={() => copyToClipboard(verifyToken)}>
                      <FileCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          // Conteúdo do Instagram
          <>
            <TextField
              label={i18n.t("facebookInstagram.nameInstagram")}
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classes.textField}
              disabled={loading}
              placeholder={i18n.t("facebookInstagram.placeholderInstagram")}
            />

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>1</span>
                {i18n.t("facebookInstagram.step1ConnectInstagram")}
              </Typography>
              <Typography className={classes.instructionText}>
                {i18n.t("facebookInstagram.step1DescInstagram")}
              </Typography>
              <Button
                variant="contained"
                className={classes.linkButton}
                startIcon={<Instagram />}
                onClick={handleInstagramLogin}
                fullWidth
                style={{ backgroundColor: "#e1306c" }}
              >
                {i18n.t("facebookInstagram.connectInstagram")}
              </Button>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>2</span>
                {i18n.t("facebookInstagram.step2Requirements")}
              </Typography>
              <Typography className={classes.instructionText}>
                {i18n.t("facebookInstagram.step2RequirementsDesc")}
              </Typography>
              <Typography className={classes.instructionText} style={{ fontFamily: "monospace", backgroundColor: "#f0f0f0", padding: 8, borderRadius: 4 }}>
                • Conta Instagram Business<br />
                • Conta Facebook vinculada<br />
                • Permissões de mensagens
              </Typography>
            </Box>

            <Box className={classes.instructionBox}>
              <Typography className={classes.instructionTitle}>
                <span className={classes.stepNumber}>3</span>
                Configurar Webhook (Opcional)
              </Typography>
              <Typography className={classes.instructionText}>
                Se precisar configurar manualmente, use as informações abaixo:
              </Typography>
              
              <Typography variant="caption" style={{ color: "#666", fontWeight: 500 }}>
                URL de Callback:
              </Typography>
              <Box className={classes.copyField}>
                <Typography className={classes.copyText}>
                  {webhookUrl}
                </Typography>
                <Tooltip title={i18n.t("facebookInstagram.copyUrl")}>
                  <IconButton size="small" onClick={() => copyToClipboard(webhookUrl)}>
                    <FileCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose} color="default" variant="outlined">
          {i18n.t("whatsappModal.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {i18n.t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacebookInstagramModal;
