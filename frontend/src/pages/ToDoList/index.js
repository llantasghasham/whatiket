import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@mui/icons-material/Add';
import ReactQuill from 'react-quill';
import EmojiPicker from 'emoji-picker-react';
import 'react-quill/dist/quill.snow.css';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Collapse,
  Fade
} from '@material-ui/core';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TodayIcon from '@mui/icons-material/Today';
import clsx from 'clsx';

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

  // ===== SEÇÃO DO EDITOR =====
  editorSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    border: "1px solid #e2e8f0",
  },

  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  editorTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  editorContainer: {
    marginBottom: theme.spacing(3),
    width: '100%',
    
    '& .ql-container': {
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      border: '2px solid #e2e8f0',
      borderTop: 'none',
      minHeight: '120px',
      fontFamily: theme.typography.fontFamily,
    },
    
    '& .ql-toolbar': {
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      border: '2px solid #e2e8f0',
      borderBottom: 'none',
      backgroundColor: '#f8fafc',
    },
    
    '& .ql-editor': {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#1a202c',
      
      '&.ql-blank::before': {
        color: '#64748b',
        fontStyle: 'normal',
        fontSize: '16px',
      }
    }
  },

  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    position: 'relative',
    alignItems: 'center',
  },

  addButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },

  emojiButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    padding: theme.spacing(1, 3),
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    border: "none",
    transition: "all 0.2s ease",
    height: "40px",
    
    "&:hover": {
      backgroundColor: "#d97706",
      transform: "translateY(-1px)",
    },
  },

  emojiPicker: {
    position: 'absolute',
    top: '50px',
    left: '120px',
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },

  // ===== SEÇÃO DE TAREFAS =====
  tasksSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
  },

  tasksHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  tasksTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  tasksList: {
    marginBottom: '0',
    
    '& .MuiListItem-root': {
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      marginBottom: theme.spacing(1),
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      
      '&:hover': {
        backgroundColor: '#f1f5f9',
        transform: 'translateX(4px)',
      }
    }
  },

  taskContent: {
    '& .task-text': {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#1a202c',
      marginBottom: theme.spacing(1),
      
      '& h1, & h2, & h3': {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: 600,
      },
      
      '& p': {
        margin: '0 0 8px 0',
      },
      
      '& strong': {
        color: '#3b82f6',
      },
      
      '& em': {
        color: '#64748b',
      }
    },
    
    '& .task-date': {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(0.5),
    }
  },

  taskActions: {
    display: 'flex',
    gap: theme.spacing(1),
  },

  editButton: {
    backgroundColor: '#10b981',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#059669',
      transform: 'scale(1.05)',
    }
  },

  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#dc2626',
      transform: 'scale(1.05)',
    }
  },

  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: '#64748b',
  },

  // ===== RESPONSIVIDADE =====
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing(2),
    },
    
    headerTitle: {
      fontSize: "24px",
    },
    
    buttonContainer: {
      justifyContent: 'center',
    },
    
    emojiPicker: {
      left: '50%',
      transform: 'translateX(-50%)',
    }
  },
}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!task.trim()) {
      return;
    }

    const now = new Date();
    if (editIndex >= 0) {
      const newTasks = [...tasks];
      newTasks[editIndex] = {
        text: task,
        updatedAt: now,
        createdAt: newTasks[editIndex].createdAt,
      };
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
    } else {
      setTasks([...tasks, { text: task, createdAt: now, updatedAt: now }]);
      setTask('');
    }
    setShowEmojiPicker(false);
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setEditIndex(index);
    setShowEmojiPicker(false);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
    setEditIndex(-1);
    setTask('');
  };

  const handleEmojiClick = (emojiData) => {
    setTask((prevTask) => prevTask + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Calcular estatísticas
  const totalTasks = tasks.length;
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    const taskDate = new Date(task.createdAt);
    return today.toDateString() === taskDate.toDateString();
  }).length;
  const recentTasks = tasks.filter(task => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(task.updatedAt) > threeDaysAgo;
  }).length;
  const editedTasks = tasks.filter(task => 
    new Date(task.updatedAt).getTime() !== new Date(task.createdAt).getTime()
  ).length;

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <AssignmentIcon />
                Lista de Tareas
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Organiza tus tareas de forma inteligente y productiva
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LAS TAREAS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <TodayIcon />
            Estadísticas de las tareas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <Box className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de tareas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalTasks}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <AssignmentIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Box className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Creadas hoy
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {todayTasks}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <TodayIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Box className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Actualizadas (3 días)
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {recentTasks}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <PendingIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Box className={clsx(classes.mainCard, classes.cardRed)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tareas editadas
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {editedTasks}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                    <EditIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DO EDITOR */}
        <Box className={classes.editorSection}>
          <Box className={classes.editorHeader}>
            <Typography className={classes.editorTitle}>
              {editIndex >= 0 ? 'Editando tarea' : 'Nueva tarea'}
            </Typography>
            {editIndex >= 0 && (
              <Chip 
                label="Modo edición" 
                style={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 600
                }} 
                size="small" 
              />
            )}
          </Box>

          {/* Contêiner do Editor */}
          <div className={classes.editorContainer}>
            <ReactQuill
              value={task}
              onChange={setTask}
              theme="snow"
              placeholder="Escribe tu tarea aquí... ¡Usa el formato para resaltar información importante!"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </div>

          {/* Contêiner dos Botões */}
          <div className={classes.buttonContainer}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              className={classes.addButton}
              onClick={handleAddTask}
              disabled={!task.trim()}
            >
              {editIndex >= 0 ? 'Guardar cambios' : 'Añadir tarea'}
            </Button>
            
            <Button
              startIcon={<InsertEmoticonIcon />}
              variant="contained"
              className={classes.emojiButton}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              {showEmojiPicker ? 'Cerrar Emojis' : 'Insertar emoji'}
            </Button>

            {editIndex >= 0 && (
              <Button
                variant="outlined"
                style={{
                  borderColor: '#64748b',
                  color: '#64748b',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  height: '40px'
                }}
                onClick={() => {
                  setEditIndex(-1);
                  setTask('');
                  setShowEmojiPicker(false);
                }}
              >
                Cancelar edición
              </Button>
            )}

            {/* Picker de Emojis Flutuante */}
            {showEmojiPicker && (
              <Fade in={showEmojiPicker}>
                <div className={classes.emojiPicker}>
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    width={350}
                    height={400}
                  />
                </div>
              </Fade>
            )}
          </div>
        </Box>

        {/* SEÇÃO DE TAREFAS */}
        <Box className={classes.tasksSection}>
          <Box className={classes.tasksHeader}>
            <Typography className={classes.tasksTitle}>
              Mis tareas ({totalTasks})
            </Typography>
          </Box>

          {tasks.length === 0 ? (
            <div className={classes.emptyState}>
              <AssignmentIcon style={{ fontSize: '3rem', marginBottom: '12px', color: '#cbd5e1' }} />
              <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '8px', color: '#1a202c' }}>
                Aún no hay tareas creadas
              </Typography>
              <Typography variant="body2">
                Comienza creando tu primera tarea usando el editor de arriba
              </Typography>
            </div>
          ) : (
            <List className={classes.tasksList}>
              {tasks.map((taskItem, index) => (
                <ListItem key={index} className={classes.list}>
                  <ListItemText
                    className={classes.taskContent}
                    primary={
                      <div 
                        className="task-text"
                        dangerouslySetInnerHTML={{ __html: taskItem.text }}
                      />
                    }
                    secondary={
                      <div className="task-date">
                        <TodayIcon style={{ fontSize: '14px' }} />
                        Creada: {taskItem.createdAt.toLocaleString('es-ES')}
                        {taskItem.createdAt.getTime() !== taskItem.updatedAt.getTime() && (
                          <span style={{ marginLeft: '12px', color: '#3b82f6' }}>
                            • Editada: {taskItem.updatedAt.toLocaleString('es-ES')}
                          </span>
                        )}
                      </div>
                    }
                  />
                  <ListItemSecondaryAction className={classes.taskActions}>
                    <IconButton 
                      className={classes.editButton}
                      onClick={() => handleEditTask(index)}
                      size="small"
                    >
                      <EditIcon style={{ fontSize: '18px' }} />
                    </IconButton>
                    <IconButton 
                      className={classes.deleteButton}
                      onClick={() => handleDeleteTask(index)}
                      size="small"
                    >
                      <DeleteIcon style={{ fontSize: '18px' }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </div>
    </div>
  );
};

export default ToDoList;