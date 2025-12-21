import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";
import { 
  Button, 
  CircularProgress, 
  Grid, 
  TextField, 
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import SendIcon from '@mui/icons-material/Send';
import ApiIcon from '@mui/icons-material/Api';
import MessageIcon from '@mui/icons-material/Message';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import TextsmsIcon from '@mui/icons-material/Textsms';
import PhotoIcon from '@mui/icons-material/Photo';

import axios from "axios";
import usePlans from "../../hooks/usePlans";
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
    padding: theme.spacing(3),
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

  // ===== CARDS =====
  mainCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
      
      "&::before": {
        width: "6px",
      }
    },
  },

  // Cores dos cards
  cardBlue: {
    "&::before": {
      backgroundColor: "#3b82f6",
    },
  },

  cardGreen: {
    "&::before": {
      backgroundColor: "#10b981",
    },
  },

  cardPurple: {
    "&::before": {
      backgroundColor: "#8b5cf6",
    },
  },

  // ===== CAMPOS DE FORMULÁRIO =====
  modernTextField: {
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
  sendButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: theme.spacing(1.5, 4),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "48px",
    minWidth: "140px",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    
    "&:disabled": {
      backgroundColor: "#94a3b8",
      transform: "none",
    }
  },

  mediaButton: {
    backgroundColor: "#10b981",
    color: "white",
    padding: theme.spacing(1.5, 4),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "48px",
    minWidth: "140px",
    
    "&:hover": {
      backgroundColor: "#059669",
      transform: "translateY(-1px)",
    },
    
    "&:disabled": {
      backgroundColor: "#94a3b8",
      transform: "none",
    }
  },

  // ===== INPUT DE ARQUIVO =====
  fileInput: {
    display: "none",
  },

  fileInputLabel: {
    backgroundColor: "#f8fafc",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "block",
    width: "100%",
    
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#f1f5f9",
    },
    
    "& .MuiTypography-root": {
      color: "#64748b",
      fontWeight: 600,
      marginTop: theme.spacing(1),
    },
    
    "& .MuiSvgIcon-root": {
      fontSize: "2rem",
      color: "#3b82f6",
    }
  },

  fileSelected: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
    
    "& .MuiTypography-root": {
      color: "#166534",
    },
    
    "& .MuiSvgIcon-root": {
      color: "#10b981",
    }
  },

  // ===== DOCUMENTAÇÃO =====
  docSection: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(3),
  },

  docTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  codeBlock: {
    backgroundColor: "#1a202c",
    color: "#e2e8f0",
    padding: theme.spacing(2),
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    overflow: "auto",
  },

  methodChip: {
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: 700,
    fontSize: "12px",
    marginRight: theme.spacing(1),
  },

  endpointText: {
    backgroundColor: "#f1f5f9",
    padding: theme.spacing(1),
    borderRadius: "6px",
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#1a202c",
    border: "1px solid #e2e8f0",
  },

  // ===== INFORMAÇÕES =====
  infoList: {
    "& ul": {
      paddingLeft: theme.spacing(2),
      "& li": {
        marginBottom: theme.spacing(0.5),
        color: "#4a5568",
        
        "& b": {
          color: "#1a202c",
        }
      }
    },
    
    "& ol": {
      paddingLeft: theme.spacing(2),
      "& li": {
        marginBottom: theme.spacing(0.5),
        color: "#4a5568",
      }
    }
  },

  // ===== FORM CONTAINER =====
  formContainer: {
    width: "100%",
  },

  formHeader: {
    backgroundColor: "#f8fafc",
    padding: theme.spacing(2),
    borderRadius: "8px",
    marginBottom: theme.spacing(3),
    border: "1px solid #e2e8f0",
  },

  formTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();

  const [formMessageTextData,] = useState({ token: '', number: '', body: '', userId: '', queueId: '' })
  const [formMessageMediaData,] = useState({ token: '', number: '', medias: '', body:'', userId: '', queueId: '' })
  const [file, setFile] = useState({})
  const [fileName, setFileName] = useState('')
  const { user, socket } = useContext(AuthContext);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send'
  }

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    const data = { number, body, userId, queueId };
    try {
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${values.token}` 
        }
      })
      toast.success('Mensaje enviado con éxito');
    } catch (err) {
      toastError(err);
    }
  }

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', values.body ? values.body: firstFile.name);
      data.append('userId', values.userId);
      data.append('queueId', values.queueId);
      data.append('medias', firstFile);
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'multipart/form-data',
          'Authorization': `Bearer ${values.token}`
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files;
    setFile(selectedFile);
    setFileName(selectedFile[0]?.name || '');
  }

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <div className={classes.formHeader}>
              <Typography className={classes.formTitle}>
                <TextsmsIcon />
                Prueba de envío - Mensaje de texto
              </Typography>
            </div>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.token")}
                  name="token"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.number")}
                  name="number"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  className={classes.modernTextField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={classes.buttonContainer}>
                  <Button
                    type="submit"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    className={classes.sendButton}
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
            document.getElementById('medias').files = null
            document.getElementById('medias').value = null
            setFileName('')
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <div className={classes.formHeader}>
              <Typography className={classes.formTitle}>
                <PhotoIcon />
                Prueba de envío - Mensaje con multimedia
              </Typography>
            </div>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.token")}
                  name="token"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.number")}
                  name="number"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  className={classes.modernTextField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  variant="outlined"
                  fullWidth
                  className={classes.modernTextField}
                />
              </Grid>
              <Grid item xs={12}>
                <input 
                  type="file" 
                  name="medias" 
                  id="medias" 
                  className={classes.fileInput}
                  required 
                  onChange={handleFileChange} 
                />
                <label 
                  htmlFor="medias" 
                  className={clsx(classes.fileInputLabel, fileName && classes.fileSelected)}
                >
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <AttachmentIcon />
                    <Typography variant="body2">
                      {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz clic para seleccionar un archivo'}
                    </Typography>
                  </Box>
                </label>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.buttonContainer}>
                  <Button
                    type="submit"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    className={classes.mediaButton}
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar con multimedia'}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* ENCABEZADO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <ApiIcon />
                {i18n.t("messagesAPI.API.title")}
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Interfaz para envío de mensajes vía API externa
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: MÉTODOS DISPONIBLES */}
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <CodeIcon />
            {i18n.t("messagesAPI.API.methods.title")}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <CardContent>
                  <Box display="flex" alignItems="center" marginBottom={2}>
                    <MessageIcon style={{ color: "#3b82f6", marginRight: "8px" }} />
                    <Typography variant="h6" style={{ fontWeight: 700, color: "#1a202c" }}>
                      Mensajes de texto
                  </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {i18n.t("messagesAPI.API.methods.messagesText")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <CardContent>
                  <Box display="flex" alignItems="center" marginBottom={2}>
                    <AttachmentIcon style={{ color: "#10b981", marginRight: "8px" }} />
                    <Typography variant="h6" style={{ fontWeight: 700, color: "#1a202c" }}>
                      Mensajes con multimedia
                  </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {i18n.t("messagesAPI.API.methods.messagesMidia")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN: INSTRUCCIONES */}
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <InfoIcon />
            {i18n.t("messagesAPI.API.instructions.title")}
          </Typography>
          
          <div className={classes.docSection}>
            <Typography className={classes.docTitle}>
              <InfoIcon />
              {i18n.t("messagesAPI.API.instructions.comments")}
            </Typography>
            <div className={classes.infoList}>
              <ul>
                <li>{i18n.t("messagesAPI.API.instructions.comments1")}</li>
                <li>
                  {i18n.t("messagesAPI.API.instructions.comments2")}
                  <ul>
                    <li>{i18n.t("messagesAPI.API.instructions.codeCountry")}</li>
                    <li>{i18n.t("messagesAPI.API.instructions.code")}</li>
                    <li>{i18n.t("messagesAPI.API.instructions.number")}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </Box>

        {/* SECCIÓN: MENSAJES DE TEXTO */}
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <TextsmsIcon />
            {i18n.t("messagesAPI.API.text.title")}
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <div className={classes.docSection}>
                <Typography className={classes.docTitle}>
                  <CodeIcon />
                  Documentación de la API
                </Typography>
                
                <Typography variant="body2" style={{ marginBottom: "16px", color: "#4a5568" }}>
                  {i18n.t("messagesAPI.API.text.instructions")}
                </Typography>
                
                <Box marginBottom={2}>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    <Chip label="POST" className={classes.methodChip} size="small" />
                    Punto de acceso:
                  </Typography>
                  <div className={classes.endpointText}>
                    {getEndpoint()}
                  </div>
                </Box>
                
                <Box marginBottom={2}>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    Encabezados:
                  </Typography>
                  <Typography variant="body2" style={{ color: "#4a5568", marginBottom: "4px" }}>
                    • Authorization: Bearer (token registrado)
                  </Typography>
                  <Typography variant="body2" style={{ color: "#4a5568" }}>
                    • Content-Type: application/json
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    Body (JSON):
                  </Typography>
                  <div className={classes.codeBlock}>
{`{
  "number": "558599999999",
  "body": "Mensaje",
  "userId": "ID de usuario o ''",
  "queueId": "ID de la fila o ''",
  "sendSignature": "true/false",
  "closeTicket": "true/false"
}`}
                  </div>
                </Box>
              </div>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <CardContent>
                  {renderFormMessageText()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SECCIÓN: MENSAJES CON MULTIMEDIA */}
        <Box className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <PhotoIcon />
            {i18n.t("messagesAPI.API.media.title")}
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <div className={classes.docSection}>
                <Typography className={classes.docTitle}>
                  <CodeIcon />
                  Documentação da API
                </Typography>
                
                <Typography variant="body2" style={{ marginBottom: "16px", color: "#4a5568" }}>
                  {i18n.t("messagesAPI.API.media.instructions")}
                </Typography>
                
                <Box marginBottom={2}>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    <Chip label="POST" className={classes.methodChip} size="small" />
                    Endpoint:
                  </Typography>
                  <div className={classes.endpointText}>
                    {getEndpoint()}
                  </div>
                </Box>
                
                <Box marginBottom={2}>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    Encabezados:
                  </Typography>
                  <Typography variant="body2" style={{ color: "#4a5568", marginBottom: "4px" }}>
                    • Authorization: Bearer (token registrado)
                  </Typography>
                  <Typography variant="body2" style={{ color: "#4a5568" }}>
                    • Content-Type: multipart/form-data
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 700, marginBottom: "8px" }}>
                    FormData:
                  </Typography>
                  <div className={classes.infoList}>
                    <ul>
                      <li><b>number:</b> 558599999999</li>
                      <li><b>body:</b> Mensaje</li>
                      <li><b>userId:</b> ID de usuario o ""</li>
                      <li><b>queueId:</b> ID de la fila o ""</li>
                      <li><b>medias:</b> archivo</li>
                      <li><b>sendSignature:</b> true/false</li>
                      <li><b>closeTicket:</b> true/false</li>
                    </ul>
                  </div>
                </Box>
              </div>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <CardContent>
                  {renderFormMessageMedia()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
};

export default MessagesAPI;