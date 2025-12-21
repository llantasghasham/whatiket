import React, { useEffect, useState, useContext } from "react";
import { Field } from "formik";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Card,
  CardContent,
} from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";
import ForbiddenPage from "../../components/ForbiddenPage";
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@material-ui/icons/Settings';
import TimerIcon from '@material-ui/icons/Timer';
import { AuthContext } from "../../context/Auth/AuthContext";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  // ===== LAYOUT PRINCIPAL =====
  root: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  // ===== CABEÇALHO =====
  header: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3, 4),
    marginBottom: theme.spacing(4),
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },

  headerTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  headerSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: 500,
  },

  // ===== SEÇÕES =====
  section: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    
    "&::before": {
      content: '""',
      width: "4px",
      height: "20px",
      backgroundColor: "#3b82f6",
      borderRadius: "2px",
    }
  },

  // ===== CARDS DE CONFIGURAÇÃO =====
  configCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    },
  },

  cardContent: {
    padding: theme.spacing(3),
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  cardDescription: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: theme.spacing(2),
    lineHeight: 1.5,
  },

  // ===== FORMULÁRIOS =====
  formControl: {
    marginBottom: theme.spacing(2),
    
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      transition: "all 0.2s ease",
      
      "&:hover": {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      
      "&.Mui-focused": {
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
      }
    },
    
    "& .MuiInputLabel-outlined": {
      color: "#64748b",
      fontWeight: 600,
      
      "&.Mui-focused": {
        color: "#3b82f6",
      }
    },

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#e2e8f0",
      borderWidth: "2px",
    },

    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cbd5e1",
    },

    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3b82f6",
    },
  },

  // ===== BOTÕES =====
  modernButton: {
    borderRadius: "12px",
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "48px",
    
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#2563eb",
    },
  },

  saveButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  // ===== ÁREA DE BOTÕES =====
  buttonArea: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 0),
    borderTop: "1px solid #f1f5f9",
  },

  // ===== GRID RESPONSIVO =====
  configGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: theme.spacing(3),
  },

  // ===== MAIN PAPER (TRANSPARENTE) =====
  mainPaper: {
    backgroundColor: "transparent",
    boxShadow: "none",
    border: "none",
    padding: 0,
  },

  // ===== ÍCONES =====
  configIcon: {
    width: "24px",
    height: "24px",
    color: "#3b82f6",
  },

  // ===== DESTAQUE VISUAL =====
  highlight: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
  sabado: "false",
  domingo: "false",
  startHour: "09:00",
  endHour: "18:00"
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const history = useHistory();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const { user, socket } = useContext(AuthContext);

  const [sabado, setSabado] = React.useState(false);
  const [domingo, setDomingo] = React.useState(false);

  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("19:00");

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      console.log(data)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, item.value]);
          if (item.key === "sabado") setSabado(item?.value === "true");
          if (item.key === "domingo") setDomingo(item?.value === "true");
          if (item.key === "startHour") setStartHour(item?.value);
          if (item.key === "endHour") setEndHour(item?.value);

        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      if (!Array.isArray(prev.variables)) {
        // Lidar com o caso em que prev.variables não é um array
        return { ...prev, variables: [Object.assign({}, variable)] };
      }
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configuraciones guardadas");
  };

  const handleChange = (event) => {
    if (event.target.name === "sabado") {
      setSabado(event.target.checked);
    }
    if (event.target.name === "domingo") {
      setDomingo(event.target.checked);
    }
  };

  const handleSaveTimeMass = async () => {
    let settings = {
      sabado: sabado,
      domingo: domingo,
      startHour: startHour,
      endHour: endHour
    }

    try {
      await api.post(`/campaign-settings/`, { settings });

      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  if (user.profile === "user") {
    return <ForbiddenPage />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={i18n.t("campaigns.confirmationModal.deleteTitle")}
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={removeVariable}
        >
          {i18n.t("campaigns.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Typography className={classes.headerTitle}>
            <SettingsIcon />
            {i18n.t("campaignsConfig.title")}
          </Typography>
          <Typography className={classes.headerSubtitle}>
            Configura los intervalos y parámetros de tus campañas
          </Typography>
        </Box>

        {/* SEÇÃO DE CONFIGURAÇÕES DE INTERVALOS */}
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <TimerIcon />
            Configuraciones de intervalos
          </Typography>
          
          <div className={classes.configGrid}>
            {/* CARD: INTERVALO RANDÔMICO */}
            <Card className={classes.configCard}>
              <CardContent className={classes.cardContent}>
                <Typography className={classes.cardTitle}>
                  <TimerIcon className={classes.configIcon} />
                  Intervalo aleatorio
                </Typography>
                <Typography className={classes.cardDescription}>
                  Define el tiempo de espera entre el envío de mensajes para evitar bloqueos
                </Typography>
                
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="messageInterval-label">
                    {i18n.t("campaigns.settings.randomInterval")}
                  </InputLabel>
                  <Select
                    name="messageInterval"
                    id="messageInterval"
                    labelId="messageInterval-label"
                    label={i18n.t("campaigns.settings.randomInterval")}
                    value={settings.messageInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                    <MenuItem value={30}>30 segundos</MenuItem>
                    <MenuItem value={60}>60 segundos</MenuItem>
                    <MenuItem value={70}>70 segundos</MenuItem>
                    <MenuItem value={80}>80 segundos</MenuItem>
                    <MenuItem value={100}>100 segundos</MenuItem>
                    <MenuItem value={120}>120 segundos</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* CARD: INTERVALO APÓS X MENSAGENS */}
            <Card className={classes.configCard}>
              <CardContent className={classes.cardContent}>
                <Typography className={classes.cardTitle}>
                  <TimerIcon className={classes.configIcon} />
                  Intervalo después de mensajes
                </Typography>
                <Typography className={classes.cardDescription}>
                  Aumenta el intervalo después de enviar una cantidad específica de mensajes
                </Typography>
                
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="longerIntervalAfter-label">
                    {i18n.t("campaigns.settings.intervalGapAfter")}
                  </InputLabel>
                  <Select
                    name="longerIntervalAfter"
                    id="longerIntervalAfter"
                    labelId="longerIntervalAfter-label"
                    label={i18n.t("campaigns.settings.intervalGapAfter")}
                    value={settings.longerIntervalAfter}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.undefined")}</MenuItem>
                    <MenuItem value={5}>5 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={10}>10 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={15}>15 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={20}>20 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={30}>30 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={40}>40 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={50}>50 {i18n.t("campaigns.settings.messages")}</MenuItem>
                    <MenuItem value={60}>60 {i18n.t("campaigns.settings.messages")}</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* CARD: INTERVALO MAIOR */}
            <Card className={classes.configCard}>
              <CardContent className={classes.cardContent}>
                <Typography className={classes.cardTitle}>
                  <TimerIcon className={classes.configIcon} />
                  Intervalo mayor
                </Typography>
                <Typography className={classes.cardDescription}>
                  Define un intervalo más largo para usar después de alcanzar el límite de mensajes
                </Typography>
                
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="greaterInterval-label">
                    {i18n.t("campaigns.settings.laggerTriggerRange")}
                  </InputLabel>
                  <Select
                    name="greaterInterval"
                    id="greaterInterval"
                    labelId="greaterInterval-label"
                    label={i18n.t("campaigns.settings.laggerTriggerRange")}
                    value={settings.greaterInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                  >
                    <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                    <MenuItem value={30}>30 segundos</MenuItem>
                    <MenuItem value={40}>40 segundos</MenuItem>
                    <MenuItem value={50}>50 segundos</MenuItem>
                    <MenuItem value={60}>60 segundos</MenuItem>
                    <MenuItem value={70}>70 segundos</MenuItem>
                    <MenuItem value={80}>80 segundos</MenuItem>
                    <MenuItem value={90}>90 segundos</MenuItem>
                    <MenuItem value={100}>100 segundos</MenuItem>
                    <MenuItem value={110}>110 segundos</MenuItem>
                    <MenuItem value={120}>120 segundos</MenuItem>
                    <MenuItem value={130}>130 segundos</MenuItem>
                    <MenuItem value={140}>140 segundos</MenuItem>
                    <MenuItem value={150}>150 segundos</MenuItem>
                    <MenuItem value={160}>160 segundos</MenuItem>
                    <MenuItem value={170}>170 segundos</MenuItem>
                    <MenuItem value={180}>180 segundos</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </div>

          {/* ÁREA DE BOTÕES */}
          <Box className={classes.buttonArea}>
            <Button
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              className={clsx(classes.modernButton, classes.saveButton)}
              variant="contained"
            >
              {i18n.t("campaigns.settings.save")}
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default CampaignsConfig;