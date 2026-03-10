import React from "react";
import { makeStyles, Paper, Typography, Box, List, ListItem, ListItemText } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { i18n } from "../../translate/i18n";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 640,
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
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.primary?.main || "#1976d2",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: theme.palette.type === "dark" ? "#2d2d2d" : "#f5f5f5",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 13,
    color: theme.palette.text?.primary || "inherit",
  },
  listItem: {
    paddingLeft: 0,
  },
}));

const TwilioConfig = () => {
  const classes = useStyles();

  const envVars = [
    { key: "TWILIO_ACCOUNT_SID", desc: "Account SID de tu cuenta Twilio" },
    { key: "TWILIO_API_KEY_SID", desc: "API Key SID (crear en Twilio Console > Account > API Keys)" },
    { key: "TWILIO_API_KEY_SECRET", desc: "API Key Secret (se muestra solo al crear la API Key)" },
    { key: "TWILIO_TWIML_APP_SID", desc: "TwiML App SID (crear en Twilio Console > Voice > TwiML Apps)" },
    { key: "TWILIO_CALLER_ID", desc: "Número Twilio que aparecerá como origen (ej: +1234567890)" },
  ];

  return (
    <div className={classes.root}>
      <Title>{i18n.t("twilioConfig.title")}</Title>

      <Paper className={classes.paper}>
        <Typography className={classes.title} variant="h6">
          <SettingsIcon /> {i18n.t("twilioConfig.title")}
        </Typography>

        <Typography variant="body1" paragraph>
          {i18n.t("twilioConfig.intro")}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          {i18n.t("twilioConfig.envVars")}
        </Typography>
        <List>
          {envVars.map(({ key, desc }) => (
            <ListItem key={key} className={classes.listItem}>
              <ListItemText
                primary={<code className={classes.code}>{key}</code>}
                secondary={desc}
              />
            </ListItem>
          ))}
        </List>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            {i18n.t("twilioConfig.voiceUrl")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {i18n.t("twilioConfig.voiceUrlDesc")}
          </Typography>
          <Box mt={1}>
            <code className={classes.code}>
              {typeof window !== "undefined" && process.env.REACT_APP_BACKEND_URL
                ? `${process.env.REACT_APP_BACKEND_URL}/twilio/voice`
                : "https://tu-dominio.com/twilio/voice"}
            </code>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default TwilioConfig;
