import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory, Link as RouterLink } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { getBackendUrl } from "../../config";
import { toast } from "react-toastify";
import { useSystemAlert } from "../../components/SystemAlert";
import { Formik, Form, Field } from "formik";
import {
    IconButton,
    InputAdornment,
    TextField,
    Button,
    Box,
    Typography,
    CssBaseline,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Fade,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    MenuItem,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import SaveIcon from '@mui/icons-material/Save';
import LoginIcon from '@mui/icons-material/Login';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { makeStyles } from "@material-ui/core/styles";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import wallfundo from "../../assets/f002.png";
import api from "../../services/api";

import { COUNTRIES, getDocConfig, validateDocument } from "../../config/countryDocuments";

// Segmentos disponíveis
const segments = [
  { value: "varejo", label: "Varejo", icon: "🛍️" },
  { value: "servicos", label: "Serviços", icon: "🔧" },
  { value: "tecnologia", label: "Tecnologia", icon: "💻" },
  { value: "saude", label: "Saúde", icon: "🏥" },
  { value: "educacao", label: "Educação", icon: "📚" },
  { value: "alimentos", label: "Alimentos", icon: "🍔" },
  { value: "moda", label: "Moda", icon: "👗" },
  { value: "automotivo", label: "Automotivo", icon: "🚗" },
  { value: "imobiliario", label: "Imobiliário", icon: "🏠" },
  { value: "entretenimento", label: "Entretenimento", icon: "🎮" },
  { value: "financeiro", label: "Financeiro", icon: "💰" },
  { value: "outros", label: "Outros", icon: "📦" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  
  leftPanel: (props) => ({
    flex: 1,
    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${props.backgroundImage || wallfundo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      opacity: 0.6,
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  }),

  leftPanelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: theme.spacing(5),
    maxWidth: 520,
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },

  leftPanelTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    lineHeight: 1.2,
  },

  leftPanelSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    marginBottom: theme.spacing(3),
  },

  leftPanelList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  leftPanelListItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    fontSize: "1rem",
    "& svg": {
      marginRight: theme.spacing(1),
      fontSize: "1.2rem",
    },
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },

  signupCard: {
    maxWidth: 500,
    width: "100%",
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
  },

  stepper: {
    padding: theme.spacing(2, 0),
    backgroundColor: "transparent",
    marginBottom: theme.spacing(2),
  },

  stepContent: {
    padding: theme.spacing(3),
  },

  inputField: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f1f5f9",
    },
    "&:focus-within": {
      borderColor: "#3b82f6",
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: "none",
      },
    },
  },

  submitButton: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    marginTop: theme.spacing(2),
    boxShadow: `0 4px 12px ${theme.palette.primary.main}66`,
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark || theme.palette.primary.main,
      boxShadow: `0 6px 16px ${theme.palette.primary.main}80`,
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      backgroundColor: "#9ca3af",
      boxShadow: "none",
      transform: "none",
    },
  },

  backButton: {
    marginRight: theme.spacing(1),
  },

  phoneInputContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f1f5f9",
    },
    "&:focus-within": {
      borderColor: "#3b82f6",
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },

  phoneInput: {
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    color: "#1f2937",
    fontSize: "0.95rem",
  },

  termsCheckbox: {
    marginTop: theme.spacing(2),
    "& .MuiFormControlLabel-label": {
      fontSize: "0.85rem",
      color: "#6b7280",
      fontWeight: 500,
    },
  },

  progressContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    textAlign: "center",
  },

  progressText: {
    marginTop: theme.spacing(2),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },

  planCard: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },

  segmentCard: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },

  carouselContainer: {
    position: "relative",
    overflow: "hidden",
    padding: theme.spacing(2, 0),
  },

  carouselWrapper: {
    display: "flex",
    transition: "transform 0.3s ease",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
    cursor: "grab",
    userSelect: "none",
    "&:active": {
      cursor: "grabbing",
    },
    "&::-webkit-scrollbar": {
      height: 6,
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#3b82f6",
      borderRadius: 3,
    },
  },

  carouselItem: {
    flex: "0 0 auto",
    scrollSnapAlign: "start",
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0,
    },
  },

  planCarouselItem: {
    width: "280px",
  },

  segmentCarouselItem: {
    width: "140px",
  },

  carouselNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "1px solid #e5e7eb",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },

  carouselNavLeft: {
    left: -20,
  },

  carouselNavRight: {
    right: -20,
  },
}));

const createSignUpSchema = (country) => Yup.object().shape({
  name: Yup.string()
    .min(2, "Nombre muy corto")
    .required("El nombre es obligatorio"),
  email: Yup.string()
    .email("Correo inválido")
    .required("El correo es obligatorio"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
    .required("La confirmación de contraseña es obligatoria"),
  phone: Yup.string()
    .min(10, "Teléfono muy corto")
    .required("El teléfono es obligatorio"),
  companyName: Yup.string()
    .min(2, "Nombre de empresa muy corto")
    .required("El nombre de la empresa es obligatorio"),
  country: Yup.string()
    .required("El país es obligatorio"),
  type: Yup.string()
    .oneOf(["pf", "pj"], "Tipo inválido")
    .required("El tipo es obligatorio"),
  document: Yup.string()
    .required("El documento es obligatorio")
    .test("valid-document", "Documento inválido", (value, ctx) => {
      const c = ctx.parent?.country || "BR";
      const t = ctx.parent?.type || "pf";
      return !value || validateDocument(value, c, t);
    }),
  segment: Yup.string(),
  planId: Yup.number()
    .required("El plan es obligatorio")
});

const QuizForm = ({ values, errors, touched, setFieldValue, setFieldTouched, nextStep, prevStep, step, totalSteps, handleSubmit, isSubmitting, plans, trialDays, loading }) => {
  const classes = useStyles();
  const [showPassword, setShowPassword] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { showAlert } = useSystemAlert();

  // Campos obrigatórios por etapa
  const stepFields = {
    0: ["name"],
    1: ["email"],
    2: ["password", "confirmPassword"],
    3: ["country"],
    4: ["phone"],
    5: ["type"],
    6: ["document"],
    7: ["companyName"],
    8: ["planId"],
  };

  // Carousel scroll functions
  const scrollCarousel = (direction, carouselClass) => {
    const carousel = document.querySelector(carouselClass);
    if (!carousel) return;
    
    const scrollAmount = 300; // pixels to scroll
    if (direction === 'left') {
      carousel.scrollLeft -= scrollAmount;
    } else {
      carousel.scrollLeft += scrollAmount;
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validação por etapa antes de avançar
  const validateCurrentStep = async () => {
    const fields = stepFields[step] || [];
    
    // Marcar campos como touched para exibir erros
    fields.forEach(field => {
      if (setFieldTouched) setFieldTouched(field, true, true);
    });

    // Aguardar um tick para Formik processar
    await new Promise(r => setTimeout(r, 50));

    // Verificar campos vazios
    for (const field of fields) {
      const val = values[field];
      if (val === undefined || val === null || val === "") {
        const labels = {
          name: "nombre",
          email: "correo",
          password: "contraseña",
          confirmPassword: "confirmación de contraseña",
          phone: "teléfono",
          country: "país",
          type: "tipo (PF/PJ)",
          document: "documento",
          companyName: "nombre de empresa",
          planId: "plan",
        };
        showAlert({
          type: "warning",
          title: "Campo obligatorio",
          message: `Complete el campo "${labels[field] || field}" antes de continuar.`,
        });
        return false;
      }
    }

    // Validar com Yup apenas os campos da etapa atual
    try {
      const fieldSubset = {};
      fields.forEach(f => { fieldSubset[f] = values[f]; });
      const schema = createSignUpSchema(values.country || "BR");
      await schema.validateAt(fields[0], values);
      for (const f of fields) {
        await schema.validateAt(f, values);
      }
    } catch (yupErr) {
      showAlert({
        type: "error",
        title: "Dados inválidos",
        message: yupErr.message,
      });
      return false;
    }

    // Verificação especial: etapa do e-mail — checar se já existe
    if (step === 1) {
      try {
        setCheckingEmail(true);
        const { data } = await openApi.get(`/auth/check-email?email=${encodeURIComponent(values.email)}`);
        if (data && data.exists) {
          showAlert({
            type: "warning",
            title: "E-mail já cadastrado",
            message: "Ya existe una cuenta con este correo. Intente iniciar sesión o use otro correo.",
          });
          setCheckingEmail(false);
          return false;
        }
      } catch (err) {
        // Se o endpoint não existir (404), apenas avisar mas deixar prosseguir
        if (err?.response?.status !== 404) {
          showAlert({
            type: "info",
            title: "Aviso",
            message: "No se pudo verificar el correo. Si ya tiene cuenta, el registro podría fallar.",
          });
        }
      } finally {
        setCheckingEmail(false);
      }
    }

    // Verificação especial: etapa da senha — confirmar senhas iguais
    if (step === 2) {
      if (values.password !== values.confirmPassword) {
        showAlert({
          type: "error",
          title: "Contraseñas diferentes",
          message: "La contraseña y la confirmación no coinciden. Verifique e intente de nuevo.",
        });
        return false;
      }
    }

    return true;
  };

  const handleNextStep = async (e) => {
    if (e) e.preventDefault();
    
    if (step === totalSteps - 1) {
      return;
    }
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    nextStep(values);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                👋 ¡Empecemos! ¿Cuál es su nombre?
              </Typography>
              <Field
                as={TextField}
                name="name"
                variant="outlined"
                fullWidth
                placeholder="Su nombre completo"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📧 ¿Cuál es su mejor correo electrónico?
              </Typography>
              <Field
                as={TextField}
                name="email"
                variant="outlined"
                fullWidth
                placeholder="seu@email.com"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🔐 Cree una contraseña (mínimo 6 caracteres)
              </Typography>
              <Field
                as={TextField}
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                placeholder="Mínimo 6 caracteres"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
              {/* Indicador de contraseña: solo mínimo 6 caracteres */}
              <Box mt={1} px={1}>
                <Typography variant="caption" style={{ color: values.password?.length >= 6 ? "#10b981" : "#ef4444" }}>
                  {values.password?.length >= 6 ? "✓" : "✗"} Mínimo 6 caracteres
                </Typography>
              </Box>
              <Field
                as={TextField}
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                placeholder="Confirme su contraseña"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
                style={{ marginTop: 16 }}
              />
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🌍 Seleccione su país
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                El documento solicitado será conforme a las leyes de su país
              </Typography>
              <Field
                as={TextField}
                name="country"
                variant="outlined"
                fullWidth
                select
                error={touched.country && Boolean(errors.country)}
                helperText={touched.country && errors.country}
                className={classes.inputField}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </MenuItem>
                ))}
              </Field>
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📱 Su teléfono de contacto
              </Typography>
              <div className={classes.phoneInputContainer}>
                <Field name="phone">
                  {({ field }) => (
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry={(values.country && ["BR","US","MX","AR","CO","CL","PE","EC","UY","PY","VE","BO","ES","PT","CR"].includes(values.country)) ? values.country : "BR"}
                      onChange={(value) => setFieldValue('phone', value)}
                      className={classes.phoneInput}
                      placeholder="(00) 00000-0000"
                      inputStyle={{
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        width: "100%",
                        color: "#1f2937",
                        fontSize: "0.95rem",
                      }}
                    />
                  )}
                </Field>
              </div>
              {touched.phone && errors.phone && (
                <Typography color="error" variant="caption" style={{ marginTop: 8 }}>
                  {errors.phone}
                </Typography>
              )}
            </Box>
          </Fade>
        );

      case 5:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🏢 ¿Es persona física o jurídica?
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Box
                  className={classes.inputField}
                  style={{ 
                    flex: 1, 
                    padding: 16, 
                    textAlign: "center",
                    cursor: "pointer",
                    border: values.type === 'pf' ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    backgroundColor: values.type === 'pf' ? "#dbeafe" : "#f8fafc"
                  }}
                  onClick={() => setFieldValue('type', 'pf')}
                >
                  <PersonIcon style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }} />
                  <Typography style={{ fontWeight: 500 }}>
                    Persona Física
                  </Typography>
                </Box>
                <Box
                  className={classes.inputField}
                  style={{ 
                    flex: 1, 
                    padding: 16, 
                    textAlign: "center",
                    cursor: "pointer",
                    border: values.type === 'pj' ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    backgroundColor: values.type === 'pj' ? "#dbeafe" : "#f8fafc"
                  }}
                  onClick={() => setFieldValue('type', 'pj')}
                >
                  <BusinessIcon style={{ fontSize: 32, color: "#3b82f6", marginBottom: 8 }} />
                  <Typography style={{ fontWeight: 500 }}>
                    Persona Jurídica
                  </Typography>
                </Box>
              </Box>
              {touched.type && errors.type && (
                <Typography color="error" variant="caption" style={{ marginTop: 8 }}>
                  {errors.type}
                </Typography>
              )}
            </Box>
          </Fade>
        );

      case 6:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                📋 {getDocConfig(values.country || "BR", values.type).label}
              </Typography>
              <Field
                as={TextField}
                name="document"
                variant="outlined"
                fullWidth
                placeholder={getDocConfig(values.country || "BR", values.type).placeholder}
                error={touched.document && Boolean(errors.document)}
                helperText={touched.document && errors.document}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 7:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                🏭 Nombre de su empresa
              </Typography>
              <Field
                as={TextField}
                name="companyName"
                variant="outlined"
                fullWidth
                placeholder="Nombre de la empresa"
                error={touched.companyName && Boolean(errors.companyName)}
                helperText={touched.companyName && errors.companyName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              />
            </Box>
          </Fade>
        );

      case 8:
        return (
          <Fade in={true}>
            <Box className={classes.stepContent}>
              <Typography variant="h5" gutterBottom>
                💳 Elija su plan
              </Typography>
              <Field
                as={TextField}
                name="planId"
                variant="outlined"
                fullWidth
                select
                error={touched.planId && Boolean(errors.planId)}
                helperText={touched.planId && errors.planId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CardMembershipIcon style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                className={classes.inputField}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="#1f2937">
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="#6b7280">
                          {plan.users || 3} usuarios • Conexiones ilimitadas
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="#3b82f6" fontWeight={700}>
                        {"$ " + (plan.value || plan.amount || plan.price || '0')}
                        <Typography component="span" variant="caption" color="#6b7280">
                          /{plan.recurrence === 'MENSAL' ? 'mes' : 'año'}
                        </Typography>
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Field>
              
              <Box mt={2} p={2} bgcolor="#f0f9ff" borderRadius={8} border="1px solid #3b82f6">
                <Typography variant="body2" color="#1e40af" style={{ lineHeight: 1.4 }}>
                  <CheckCircleIcon style={{ fontSize: 16, marginRight: 4, verticalAlign: "middle" }} />
                  <strong>Aviso importante:</strong> No se le cobrará ahora. La facturación comenzará solo después de los {trialDays} días de prueba gratuita.
                </Typography>
              </Box>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Form>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="#6b7280">
            Paso {step + 1} de {totalSteps}
          </Typography>
          <Typography variant="body2" color="#3b82f6" fontWeight={600}>
            {Math.round(((step + 1) / totalSteps) * 100)}%
          </Typography>
        </Box>
        <Box
          height={8}
          bgcolor="#e5e7eb"
          borderRadius={4}
          overflow="hidden"
        >
          <Box
            height="100%"
            bgcolor="#3b82f6"
            borderRadius={4}
            transition="width 0.3s ease"
            width={`${((step + 1) / totalSteps) * 100}%`}
          />
        </Box>
      </Box>
      
      {renderStepContent()}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          disabled={step === 0}
          onClick={prevStep}
          className={classes.backButton}
        >
          Volver
        </Button>
        <Button
          type={step === totalSteps - 1 ? "submit" : "button"}
          variant="contained"
          onClick={step < totalSteps - 1 ? handleNextStep : undefined}
          color="primary"
          className={classes.submitButton}
          disabled={isSubmitting || checkingEmail}
        >
          {checkingEmail ? "Verificando..." : step === totalSteps - 1 ? (isSubmitting ? "Registrando..." : "Finalizar") : "Siguiente"}
        </Button>
      </Box>
    </Form>
  );
};

const SignUp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const { showAlert } = useSystemAlert();
  const [backgroundImage, setBackgroundImage] = useState(wallfundo);
  const [trialDays, setTrialDays] = useState(7);
  const classes = useStyles({ backgroundImage });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [processingText, setProcessingText] = useState("Realizando registro...");
  const { getPlanList } = usePlans();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  
  const params = qs.parse(window.location.search);
  const companyId = params.companyId ?? null;
  const affiliateCode = params.aff || null;
  const initialState = { 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    phone: "", 
    companyId, 
    companyName: "", 
    planId: 1, 
    document: "",
    type: "pf",
    country: "BR",
    segment: ""
  };

  const [plans, setPlans] = useState([]);
  const steps = [
    "Nombre",
    "Email",
    "Contraseña",
    "País",
    "Teléfono",
    "Tipo",
    "Documento",
    "Empresa",
    "Plan"
  ];

  // Registrar clique no link de afiliado
  useEffect(() => {
    if (affiliateCode) {
      const backendUrl = getBackendUrl();
      fetch(`${backendUrl}/affiliate/check-affiliate/${affiliateCode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.valid) {
            console.log("Affiliate link valid:", data.affiliateCode);
          }
        })
        .catch((err) => console.log("Erro ao verificar afiliado:", err));
    }
  }, [affiliateCode]);

  // Busca imagem de fundo do backend
  useEffect(() => {
    const backendUrl = getBackendUrl();
    
    fetch(`${backendUrl}/public-settings/termsImage?token=wtV`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBackgroundImage(`${backendUrl}/public/${data}`);
        }
      })
      .catch((err) => console.log("Erro ao buscar termsImage:", err));

    fetch(`${backendUrl}/public-settings/trialDays?token=wtV`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setTrialDays(parseInt(data) || 7);
        }
      })
      .catch((err) => console.log("Erro ao buscar trialDays:", err));
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const planList = await getPlanList();
        
        if (isMounted) {
          const publicPlans = planList.filter(plan => plan.isPublic === true);
          console.log("Planos encontrados:", publicPlans);
          setPlans(publicPlans);

          if (params.planId) {
            const preselected = publicPlans.find(plan => String(plan.id) === String(params.planId));
            if (preselected) {
              setSelectedPlan(preselected);
            }
          } else if (publicPlans.length > 0) {
            setSelectedPlan(publicPlans[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        // Fallback: criar planos padrão
        if (isMounted) {
          const defaultPlans = [
            {
              id: 1,
              name: "Plano Básico",
              value: 97,
              recurrence: "MENSAL",
              users: 3,
              isPublic: true
            },
            {
              id: 2,
              name: "Plano Profissional",
              value: 197,
              recurrence: "MENSAL",
              users: 5,
              isPublic: true
            },
            {
              id: 3,
              name: "Plano Enterprise",
              value: 397,
              recurrence: "MENSAL",
              users: 10,
              isPublic: true
            }
          ];
          console.log("Usando planos fallback:", defaultPlans);
          setPlans(defaultPlans);
          setSelectedPlan(defaultPlans[0]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [params.planId, getPlanList]);

  const dueDate = moment().add(trialDays, "day").format();

  // Add drag scroll functionality to carousels
  useEffect(() => {
    const addDragScroll = (selector) => {
      const carousel = document.querySelector(selector);
      if (!carousel) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;
      
      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });
      
      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });
      
      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });
      
      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });
    };

    // Initialize drag scroll after component mounts
    setTimeout(() => {
      addDragScroll('.carouselWrapper');
    }, 100);
  }, []);

  const handleSignUp = async (values) => {
    console.log("handleSignUp called with values:", values);
    console.log("agreeToTerms:", agreeToTerms);
    
    // Ensure planId is set
    const finalPlanId = values.planId || selectedPlan?.id || plans[0]?.id || 1;
    console.log("finalPlanId:", finalPlanId);
    
    if (!agreeToTerms) {
      showAlert({
        type: "warning",
        title: "Términos obligatorios",
        message: "Debe aceptar los Términos y Condiciones para continuar.",
      });
      return;
    }

    setProcessingModalOpen(true);
    setProcessingText("Validando datos...");
    
    const stages = [
      "Creando cuenta...",
      "Configurando entorno...",
      "Finalizando registro..."
    ];
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setProcessingText(stages[i]);
    }
    
    const dataToSend = {
      ...values,
      planId: finalPlanId,
      phone: values.phone ? values.phone.replace(/\D/g, '') : '',
      country: values.country || "BR",
      document: values.document ? (values.country === "BR" ? values.document.replace(/\D/g, '') : values.document.replace(/\s/g, '')) : '',
      recurrence: "MENSAL",
      dueDate: dueDate,
      status: "t",
      campaignsEnabled: true,
      affiliateCode: affiliateCode || undefined
    };
    
    try {
        // 1. Criar conta
        await openApi.post("/auth/signup", dataToSend);
        
        // 2. Mostrar sucesso
        setProcessingText("Concluyendo...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingModalOpen(false);
        
        // 3. Mostrar popup de sucesso com botão para login
        toast.success(
          <div>
            <Typography variant="body1" style={{ fontWeight: 600 }}>
              🎉 ¡Registro realizado con éxito!
            </Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Su cuenta ha sido creada. Inicie sesión para acceder al sistema.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginTop: 12 }}
              onClick={() => history.push("/login")}
            >
              Iniciar sesión
            </Button>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          }
        );
        
      } catch (err) {
        setProcessingModalOpen(false);
        toastError(err);
      }
  };

  const nextStep = (values) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const leftPanelContent = {
    title: "Construya la atención perfecta",
    subtitle: "Automatice flujos, conecte canales y entregue experiencias únicas a sus clientes.",
    features: [
      "Jornadas inteligentes con IA",
      "Campañas y envíos multicanal",
      "Insights en tiempo real para su equipo"
    ]
  };

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        {!isMobile && (
          <div 
            className={classes.leftPanel}
            style={{ 
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${backgroundImage})` 
            }}
          >
            <div className={classes.leftPanelCard}>
              <Typography className={classes.leftPanelTitle}>
                {leftPanelContent.title}
              </Typography>
              <Typography className={classes.leftPanelSubtitle}>
                {leftPanelContent.subtitle}
              </Typography>
              <ul className={classes.leftPanelList}>
                {leftPanelContent.features.map((feature) => (
                  <li key={feature} className={classes.leftPanelListItem}>
                    <CheckCircleIcon style={{ color: "#10b981" }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className={classes.rightPanel}>
          <Card className={classes.signupCard}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 700, color: "#1f2937" }}>
                Crear su cuenta
              </Typography>
              
              <Formik
                initialValues={initialState}
                validate={async (values) => {
                  const schema = createSignUpSchema(values.country || "BR");
                  try {
                    await schema.validate(values, { abortEarly: false });
                    return {};
                  } catch (err) {
                    const errors = {};
                    if (err.inner) {
                      err.inner.forEach((e) => {
                        if (e.path) errors[e.path] = e.message;
                      });
                    }
                    return errors;
                  }
                }}
                onSubmit={handleSignUp}
              >
                {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit, isSubmitting }) => (
                  <Form>
                    <QuizForm
                      values={values}
                      errors={errors}
                      touched={touched}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      nextStep={() => nextStep(values)}
                      prevStep={prevStep}
                      step={currentStep}
                      totalSteps={steps.length}
                      handleSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      plans={plans}
                      trialDays={trialDays}
                      loading={loading}
                    />

                    {currentStep === steps.length - 1 && (
                      <FormControlLabel
                        className={classes.termsCheckbox}
                        control={
                          <Checkbox
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            name="agreeToTerms"
                            color="primary"
                          />
                        }
                        label={
                          <span>
                            Estoy de acuerdo con los{" "}
                            <span
                              onClick={() => setTermsModalOpen(true)}
                              style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
                            >
                              Términos y Condiciones
                            </span>
                          </span>
                        }
                      />
                    )}
                  </Form>
                )}
              </Formik>
              
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                style={{ marginTop: 16 }}
              >
                Ya tengo una cuenta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      <Dialog open={termsModalOpen} onClose={() => setTermsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Términos y Condiciones de Uso</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom><strong>1. ACEPTACIÓN DE LOS TÉRMINOS</strong></Typography>
          <Typography paragraph>
            1.1. Estos Términos de Uso ("Términos") rigen el uso del sistema web. Al acceder o utilizar el Sistema, el usuario acepta cumplir estos Términos. Si no está de acuerdo, debe dejar de usar el Sistema inmediatamente.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>2. LICENCIA DE USO</strong></Typography>
          <Typography paragraph>
            2.1. El Licenciante concede al Usuario una licencia limitada, no exclusiva, intransferible y revocable para usar el Sistema de acuerdo con estos Términos.
          </Typography>
          <Typography paragraph>
            2.2. El Usuario no podrá modificar, distribuir, vender, alquilar, sublicenciar o realizar ingeniería inversa sobre el Sistema, salvo cuando expresamente lo permita la ley.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>3. DERECHOS DE AUTOR Y PROPIEDAD INTELECTUAL</strong></Typography>
          <Typography paragraph>
            3.1. El Sistema, incluyendo código fuente, diseño, logotipos y demás contenidos, está protegido por leyes de derechos de autor y otras leyes de propiedad intelectual.
          </Typography>
          <Typography paragraph>
            3.2. Ninguna parte del Sistema podrá ser copiada, reproducida o utilizada sin la autorización expresa del Licenciante.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>4. RESPONSABILIDADES DEL USUARIO</strong></Typography>
          <Typography paragraph>
            4.1. El Usuario se compromete a utilizar el Sistema de forma lícita y en conformidad con estos Términos.
          </Typography>
          <Typography paragraph>
            4.2. El Usuario es responsable de mantener la seguridad de sus credenciales de acceso y de todas las actividades realizadas en su cuenta.
          </Typography>

          <Typography variant="h6" gutterBottom><strong>5. LIMITACIÓN DE RESPONSABILIDAD</strong></Typography>
          <Typography paragraph>
            5.1. El Sistema se proporciona "tal cual", sin garantías de ningún tipo.
          </Typography>
          <Typography paragraph>
            5.2. El Licenciante no será responsable por daños directos, indirectos, incidentales o consecuentes resultantes del uso o imposibilidad de uso del Sistema.
          </Typography>

          <Box mt={3}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              onClick={() => setTermsModalOpen(false)}
            >
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal de Processamento */}
      <Dialog open={processingModalOpen} maxWidth="sm" fullWidth>
        <DialogContent>
          <div className={classes.progressContainer}>
            <CircularProgress size={48} />
            <Typography variant="h6" className={classes.progressText}>
              {processingText}
            </Typography>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignUp;
