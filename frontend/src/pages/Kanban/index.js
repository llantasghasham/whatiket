import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp, Assessment, HourglassEmpty, Done, TrendingUp, Warning, Search as SearchIcon } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box, Card, CardContent, Grid } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from '@material-ui/core/Chip';
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
    height: "100vh",
    backgroundColor: theme.palette.background.default,
  },
  kanbanContainer: {
    width: "100%",
    height: "calc(100vh - 120px)", // Reducir altura del header para más espacio al kanban
    overflow: "auto",
    padding: theme.spacing(0.5),
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    maxWidth: "1200px",
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
  },
  dateInput: {
    margin: theme.spacing(1),
    flex: 1,
  },
  button: {
    marginBottom: theme.spacing(1), // Adicionar margem inferior para telas menores
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    borderRadius: 3,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto"
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  // ===== CARDS PRINCIPAIS =====
  mainCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: theme.spacing(1.5),
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    height: "80px", // Altura fija más pequeña
    minHeight: "80px",
    
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "3px",
      height: "100%",
      transition: "all 0.2s ease",
    },
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      
      "&::before": {
        width: "4px",
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
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "16px",
    
    "& svg": {
      fontSize: "18px",
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

  cardPurple: {
    "&::before": {
      backgroundColor: "#8b5cf6",
    },
  },

  cardIconPurple: {
    backgroundColor: "#8b5cf6",
  },

  cardIconRed: {
    backgroundColor: "#ef4444",
  },

  cardLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    marginBottom: theme.spacing(0.5),
    lineHeight: 1.2,
  },

  cardValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
    lineHeight: 1,
    marginBottom: theme.spacing(0.5),
  },

  // Sección de estadísticas
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
    
    "& svg": {
      fontSize: "16px",
      color: "#3b82f6",
    }
  },

  cardSection: {
    marginBottom: theme.spacing(2),
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [totalTickets, setTotalTickets] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div style={{ textAlign: 'left', wordBreak: 'break-word' }}>{ticket.lastMessage || " "}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  startIcon={<VisibilityIcon />}
                  style={{
                    color: "white",
                    backgroundColor: "#437db5",
                    boxShadow: "none",
                    borderRadius: "5px",
                    flex: 1
                  }}
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  Ver Ticket
                </Button>
                {ticket?.user && (<Badge style={{ backgroundColor: "#000000", padding: '4px 8px', borderRadius: '4px' }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
              </div>
            </div>
          ),
          title: <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> {ticket.contact.name}</>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>{ticket.contact.number}</span>
                  <span>{ticket.lastMessage || " "}</span>
                </div>
                <Button
                  startIcon={<VisibilityIcon />}
                  style={{
                    color: "white",
                    backgroundColor: "#437db5",
                    boxShadow: "none",
                    borderRadius: "5px",
                  }}
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => handleCardClick(ticket.uuid)}
                >
                  Ver Ticket
                </Button>
                <span style={{ marginRight: '8px' }} />
                <p>
                  {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                </p>
              </div>
            ),
            title: <>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> {ticket.contact.name}
            </>,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: '#9c27b0', color: "white" } // Ajuste para header morado como en la imagen
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
    setTotalTickets(tickets.length);
    setOpenTickets(tickets.filter(t => t.status === 'open').length);
    setPendingTickets(tickets.filter(t => t.status === 'pending').length);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('¡Etiqueta de ticket removida!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('¡Etiqueta de ticket agregada con éxito!');
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  return (
    <div className={classes.root}>
      <div className={classes.filterContainer}>
        <Card className={classes.mainCard} style={{ marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '100%', margin: '0 auto 16px auto', width: '100%', height: '140px' }}>
          <CardContent style={{ padding: '16px 24px' }}>
            <Typography className={classes.sectionTitle} style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              <SearchIcon style={{ fontSize: '18px', marginRight: '8px' }} />
              Filtros de Búsqueda
            </Typography>
            
            <Grid container spacing={2} alignItems="center" style={{ marginTop: '8px' }}>
              <Grid item xs={12} sm={6} md={4}>
                 <TextField
                   label="Fecha de inicio"
                   type="date"
                   value={startDate}
                   onChange={handleStartDateChange}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   fullWidth
                   variant="outlined"
                   size="small"
                 />
               </Grid>
               
               <Grid item xs={12} sm={6} md={4}>
                 <TextField
                   label="Fecha de fin"
                   type="date"
                   value={endDate}
                   onChange={handleEndDateChange}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   fullWidth
                   variant="outlined"
                   size="small"
                 />
               </Grid>
               
               <Grid item xs={12} sm={12} md={4}>
                <Button
                   variant="contained"
                   color="primary"
                   onClick={handleSearchClick}
                   startIcon={<SearchIcon />}
                   fullWidth
                   size="small"
                   style={{
                     borderRadius: '8px',
                     padding: '8px 16px',
                     fontSize: '12px',
                     fontWeight: '600',
                     textTransform: 'none',
                     backgroundColor: '#3b82f6',
                     color: 'white',
                     boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                   }}
                 >
                   Buscar
                 </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
      <div className={classes.cardSection}>
        <Typography className={classes.sectionTitle}>
          <Assessment />
          Estadísticas de Tickets
        </Typography>
        <Grid container spacing={1} style={{ justifyContent: 'center' }}>
          <Grid item xs={2.4} sm={2.4} md={2.4} lg={2.4}>
            <Card className={clsx(classes.mainCard, classes.cardBlue)}>
              <CardContent style={{ padding: '12px' }}>
                <div className={classes.cardHeader}>
                  <div>
                    <Typography className={classes.cardLabel} style={{ fontSize: '12px' }}>
                      Total de Tickets
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: '20px' }}>
                      {totalTickets}
                    </Typography>
                  </div>
                  <div className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <Assessment style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2.4} sm={2.4} md={2.4} lg={2.4}>
            <Card className={clsx(classes.mainCard, classes.cardGreen)}>
              <CardContent style={{ padding: '12px' }}>
                <div className={classes.cardHeader}>
                  <div>
                    <Typography className={classes.cardLabel} style={{ fontSize: '12px' }}>
                      Tickets Abiertos
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: '20px' }}>
                      {openTickets}
                    </Typography>
                  </div>
                  <div className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <Done style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2.4} sm={2.4} md={2.4} lg={2.4}>
            <Card className={clsx(classes.mainCard, classes.cardYellow)}>
              <CardContent style={{ padding: '12px' }}>
                <div className={classes.cardHeader}>
                  <div>
                    <Typography className={classes.cardLabel} style={{ fontSize: '12px' }}>
                      Tickets Pendientes
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: '20px' }}>
                      {pendingTickets}
                    </Typography>
                  </div>
                  <div className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <HourglassEmpty style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2.4} sm={2.4} md={2.4} lg={2.4}>
            <Card className={clsx(classes.mainCard, classes.cardPurple)}>
              <CardContent style={{ padding: '12px' }}>
                <div className={classes.cardHeader}>
                  <div>
                    <Typography className={classes.cardLabel} style={{ fontSize: '12px' }}>
                      Progreso
                    </Typography>
                    <Typography className={classes.cardValue} style={{ fontSize: '20px' }}>
                      {Math.round((openTickets / totalTickets) * 100) || 0}%
                    </Typography>
                  </div>
                  <div className={clsx(classes.cardIcon, classes.cardIconPurple)}>
                    <TrendingUp style={{ fontSize: '20px' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Can role={user.profile} perform="dashboard:view" yes={() => (
            <Grid item xs={2.4} sm={2.4} md={2.4} lg={2.4}>
              <Card className={clsx(classes.mainCard)}>
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '12px' }}>
                  <Typography className={classes.sectionTitle} style={{ marginBottom: '8px', justifyContent: 'center', fontSize: '12px' }}>
                    <AddIcon style={{ fontSize: '16px' }} />
                    Nuevo Tablero
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon style={{ fontSize: '14px' }} />}
                    onClick={handleAddConnectionClick}
                    size="small"
                    style={{
                      borderRadius: '8px',
                      padding: '8px 16px',
                      width: '100%',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'none',
                      backgroundColor: '#10b981',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Agregar Tablero
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )} />
        </Grid>
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
};

export default Kanban;