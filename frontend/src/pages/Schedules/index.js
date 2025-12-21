import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Collapse,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip
} from "@material-ui/core";
import { 
  Schedule,
  Assessment,
  TrendingUp,
  CalendarToday,
  Event,
  FilterList,
  ExpandLess,
  ExpandMore,
  Clear
} from "@material-ui/icons";
import clsx from "clsx";
import "./Schedules.css";

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

moment.locale('es');
const localizer = momentLocalizer(moment);
const defaultMessages = {
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  allDay: "Todo el día",
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Anterior",
  next: "Siguiente",
  yesterday: "Ayer",
  tomorrow: "Mañana",
  today: "Hoy",
  agenda: "Agenda",
  noEventsInRange: "No hay agendamientos en el período.",
  showMore: (total) => `+${total} más`,
};

const DragAndDropCalendar = withDragAndDrop(Calendar);

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_SCHEDULES":
      const schedules = action.payload;
      const newSchedules = [];

      schedules.forEach((schedule) => {
        const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
        if (scheduleIndex !== -1) {
          state[scheduleIndex] = schedule;
        } else {
          newSchedules.push(schedule);
        }
      });

      return [...state, ...newSchedules];

    case "UPDATE_SCHEDULES":
      const schedule = action.payload;
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
        return [...state];
      } else {
        return [schedule, ...state];
      }

    case "DELETE_SCHEDULE":
      const scheduleId = action.payload;

      const deleteIndex = state.findIndex((s) => s.id === scheduleId);
      if (deleteIndex !== -1) {
        state.splice(deleteIndex, 1);
      }
      return [...state];

    case "RESET":
      return [];

    default:
      return state;
  }
};

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

  headerActions: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    flexWrap: "wrap",
  },

  // ===== SEÇÃO DE FILTROS =====
  filterSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    cursor: "pointer",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid #e2e8f0",
  },

  filterTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  // ===== CARDS DE ESTATÍSTICAS =====
  cardSection: {
    marginBottom: theme.spacing(4),
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

  mainCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    cursor: "pointer",
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
      transform: "translateY(-4px)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      
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

  cardYellow: {
    "&::before": {
      backgroundColor: "#f59e0b",
    },
  },

  cardRed: {
    "&::before": {
      backgroundColor: "#ef4444",
    },
  },

  // ===== CONTEÚDO DOS CARDS =====
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },

  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    
    "& svg": {
      fontSize: "28px",
    }
  },

  cardIconBlue: {
    backgroundColor: "#3b82f6",
  },

  cardIconGreen: {
    backgroundColor: "#10b981",
  },

  cardIconYellow: {
    backgroundColor: "#f59e0b",
  },

  cardIconRed: {
    backgroundColor: "#ef4444",
  },

  cardLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: theme.spacing(1),
  },

  cardValue: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#1a202c",
    lineHeight: 1,
    marginBottom: theme.spacing(1),
  },

  // ===== CAMPOS DE FILTRO =====
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
  modernButton: {
    borderRadius: "12px",
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
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

  secondaryButton: {
    backgroundColor: "#10b981",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#059669",
    },
  },

  clearButton: {
    backgroundColor: "#64748b",
    color: "white",
    
    "&:hover": {
      backgroundColor: "#475569",
    },
  },

  // ===== SEÇÃO DO CALENDÁRIO =====
  calendarSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
    minHeight: "600px",
  },

  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  calendarTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== CALENDÁRIO CUSTOMIZADO =====
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    
    "& .rbc-calendar": {
      backgroundColor: "transparent",
    },
    
    "& .rbc-toolbar": {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      padding: theme.spacing(2),
      marginBottom: 0,
      
      "& .rbc-toolbar-label": {
        color: "#1a202c",
        fontWeight: 700,
        fontSize: "18px",
      },
      
      "& .rbc-btn-group": {
        "& button": {
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          color: "#64748b",
          fontWeight: 600,
          borderRadius: "8px",
          margin: "0 2px",
          transition: "all 0.2s ease",
          
          "&:hover": {
            backgroundColor: "#3b82f6",
            color: "white",
            border: "1px solid #3b82f6",
            transform: "translateY(-1px)",
          },
          
          "&:active, &:focus, &.rbc-active": {
            backgroundColor: "#3b82f6",
            color: "white",
            border: "1px solid #3b82f6",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
          }
        }
      }
    },
    
    "& .rbc-month-view, & .rbc-time-view": {
      border: "none",
      backgroundColor: "#fff",
    },
    
    "& .rbc-header": {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      color: "#1a202c",
      fontWeight: 600,
      padding: theme.spacing(1),
      fontSize: "14px",
    },
    
    "& .rbc-date-cell": {
      color: "#64748b",
      fontWeight: 500,
      
      "&.rbc-off-range": {
        color: "#cbd5e1",
      }
    },
    
    "& .rbc-today": {
      backgroundColor: "#eff6ff",
      color: "#1e40af",
      fontWeight: 700,
    },
    
    "& .rbc-event": {
      backgroundColor: "#3b82f6",
      border: "none",
      borderRadius: "6px",
      color: "white",
      fontSize: "12px",
      fontWeight: 600,
      padding: "2px 6px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease",
      
      "&:hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
      }
    },
    
    "& .rbc-day-bg": {
      "&:hover": {
        backgroundColor: "#f8fafc",
      }
    },
    
    "& .rbc-time-slot": {
      borderTop: "1px solid #f1f5f9",
      
      "&:hover": {
        backgroundColor: "#f8fafc",
      }
    },
    
    "& .rbc-timeslot-group": {
      borderBottom: "1px solid #e2e8f0",
    },
    
    "& .rbc-time-header": {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
    },
    
    "& .rbc-time-content": {
      borderTop: "1px solid #e2e8f0",
    }
  },

  // ===== EVENTOS MOBILE =====
  mobileEventContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "4px",
    backgroundColor: "#3b82f6",
    borderRadius: "6px",
    color: "white",
  },

  mobileEventActions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "4px",
    gap: "4px",
  },

  mobileActionButton: {
    minWidth: "auto",
    padding: "4px",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    
    "& svg": {
      fontSize: "16px",
    }
  },

  // ===== ESTADOS =====
  loadingContainer: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },

  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },

  // ===== TOGGLE BUTTON =====
  toggleButton: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    padding: theme.spacing(1),
    borderRadius: "8px",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "#f1f5f9",
      color: "#3b82f6",
    },
  },
}));

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const { getPlanCompany } = usePlans();

  // Estatísticas calculadas
  const totalSchedules = schedules.length;
  const todaySchedules = schedules.filter(s => 
    moment(s.sendAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
  ).length;
  const thisWeekSchedules = schedules.filter(s => 
    moment(s.sendAt).isSame(moment(), 'week')
  ).length;
  const pendingSchedules = schedules.filter(s => 
    moment(s.sendAt).isAfter(moment())
  ).length;

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useSchedules) {
        toast.error("¡Esta empresa no tiene permiso para acceder a esta página! Te estamos redirigiendo.");
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, contactId, fetchSchedules, handleOpenScheduleModalFromContactId]);

  useEffect(() => {
    const onCompanySchedule = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };

    socket.on(`company${user.companyId}-schedule`, onCompanySchedule);

    return () => {
      socket.off(`company${user.companyId}-schedule`, onCompanySchedule);
    };
  }, [socket, user.companyId]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleClearFilters = () => {
    setSearchParam("");
    setPageNumber(1);
    dispatch({ type: "RESET" });
    fetchSchedules();
    toast.success("¡Filtros limpiados con éxito!");
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const updatedSchedule = { ...event, sendAt: start };
      await api.put(`/schedules/${event.id}`, updatedSchedule);
      dispatch({ type: "UPDATE_SCHEDULES", payload: updatedSchedule });
      toast.success("Agendamiento actualizado con éxito");
    } catch (err) {
      toastError(err);
    }
  };

  const renderEvent = (schedule) => {
    if (isMobile) {
      return (
        <div className={classes.mobileEventContainer}>
          <div style={eventTitleStyle}>{schedule?.contact?.name}</div>
          <div className={classes.mobileEventActions}>
            <Button
              size="small"
              className={classes.mobileActionButton}
              onClick={(e) => {
                e.stopPropagation();
                setDeletingSchedule(schedule);
                setConfirmModalOpen(true);
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </Button>
            <Button
              size="small"
              className={classes.mobileActionButton}
              onClick={(e) => {
                e.stopPropagation();
                handleEditSchedule(schedule);
                setScheduleModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div key={schedule.id} className="event-container" title={`Contacto: ${schedule.contact.name}\nMensaje: ${schedule.body}`}>
          <div style={eventTitleStyle}>{schedule?.contact?.name}</div>
          <DeleteOutlineIcon
            onClick={(e) => {
              e.stopPropagation();
              setDeletingSchedule(schedule);
              setConfirmModalOpen(true);
            }}
            className="delete-icon"
          />
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditSchedule(schedule);
              setScheduleModalOpen(true);
            }}
            className="edit-icon"
          />
        </div>
      );
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <ConfirmationModal
          title={
            deletingSchedule &&
            `${i18n.t("schedules.confirmationModal.deleteTitle")}`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
        >
          {i18n.t("schedules.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        {scheduleModalOpen && (
          <ScheduleModal
            open={scheduleModalOpen}
            onClose={handleCloseScheduleModal}
            reload={fetchSchedules}
            scheduleId={selectedSchedule ? selectedSchedule.id : null}
            contactId={contactId}
            cleanContact={cleanContact}
          />
        )}

        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <Schedule />
                Agendamientos
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Administra tus agendamientos y envíos programados
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                className={clsx(classes.modernButton, classes.primaryButton)}
                onClick={handleOpenScheduleModal}
              >
                {isMobile ? "Añadir" : "Nuevo agendamiento"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* SEÇÃO DE FILTROS */}
        <Box className={classes.filterSection}>
          <Box 
            className={classes.filterHeader}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Typography className={classes.filterTitle}>
              <FilterList />
              Filtros y búsqueda
            </Typography>
            <IconButton className={classes.toggleButton}>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={filtersExpanded}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={8}>
                <TextField
                  placeholder="Buscar agendamientos..."
                  type="search"
                  value={searchParam}
                  onChange={handleSearch}
                  variant="outlined"
                  fullWidth
                  size="small"
                  className={classes.modernTextField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: "#3b82f6" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  className={clsx(classes.modernButton, classes.clearButton)}
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                  fullWidth
                >
                  Limpiar filtros
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LOS AGENDAMIENTOS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <Assessment />
            Estadísticas de agendamientos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de agendamientos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalSchedules}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <Schedule />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Hoy
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {todaySchedules}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <CalendarToday />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Esta semana
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {thisWeekSchedules}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <TrendingUp />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Pendientes
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {pendingSchedules}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <Event />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DO CALENDÁRIO */}
        <Box className={classes.calendarSection}>
          <Box className={classes.calendarHeader}>
            <Typography className={classes.calendarTitle}>
              Calendario de agendamientos
            </Typography>
            {loading && (
              <CircularProgress size={24} style={{ color: "#3b82f6" }} />
            )}
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                Cargando agendamientos...
              </Typography>
              <Typography variant="body2" style={{ color: "#64748b" }}>
                Espera mientras buscamos tus agendamientos
              </Typography>
            </div>
          ) : (
            <Box className={classes.calendarContainer}>
              <DragAndDropCalendar
                messages={defaultMessages}
                formats={{
                  agendaDateFormat: "DD/MM ddd",
                  weekdayFormat: "dddd",
                }}
                localizer={localizer}
                events={schedules.map((schedule) => ({
                  ...schedule,
                  title: renderEvent(schedule),
                  start: new Date(schedule.sendAt),
                  end: new Date(schedule.sendAt),
                }))}
                startAccessor="start"
                endAccessor="end"
                style={{ height: isMobile ? 450 : 550 }}
                onEventDrop={handleEventDrop}
                resizable
                selectable
              />
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Schedules;