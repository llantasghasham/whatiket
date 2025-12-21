import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal, IconButton } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Fade,
  CircularProgress
} from '@material-ui/core';
import HelpIcon from '@mui/icons-material/Help';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
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

  // ===== SEÇÃO DE VÍDEOS =====
  videosSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: theme.spacing(3),
    border: "1px solid #e2e8f0",
  },

  videosHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "1px solid #e2e8f0",
  },

  videosTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },

  // ===== GRID DE VÍDEOS =====
  mainPaperContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 400px)',
    
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f5f9",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "3px",
      "&:hover": {
        background: "#94a3b8",
      }
    },
  },

  // ===== CARDS DE VÍDEO =====
  videoCard: {
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    backgroundColor: "white",
    
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      
      "& $playOverlay": {
        opacity: 1,
      },
      
      "& $videoThumbnail": {
        transform: "scale(1.05)",
      }
    },
  },

  videoThumbnail: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },

  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "200px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
    
    "& svg": {
      fontSize: "4rem",
      color: "white",
    }
  },

  videoContent: {
    padding: theme.spacing(2, 2, 2.5),
  },

  videoTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a202c",
    marginBottom: theme.spacing(1),
    lineHeight: 1.4,
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },

  videoDescription: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
    marginBottom: theme.spacing(1.5),
  },

  videoMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: "auto",
  },

  videoChip: {
    backgroundColor: "#f1f5f9",
    color: "#3b82f6",
    fontSize: "11px",
    height: "24px",
    fontWeight: 600,
    
    "& .MuiChip-icon": {
      fontSize: "14px",
    }
  },

  // ===== MODAL DE VÍDEO =====
  videoModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },

  videoModalContent: {
    outline: "none",
    width: "95%",
    maxWidth: 1200,
    aspectRatio: "16/9",
    position: "relative",
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  },

  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    zIndex: 1000,
    
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    }
  },

  videoFrame: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  // ===== ESTADO VAZIO =====
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#64748b",
  },

  loadingState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#64748b",
  },

  // ===== RESPONSIVIDADE =====
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing(2),
    },
    
    headerTitle: {
      fontSize: "24px",
    },
    
    videoModalContent: {
      width: "98%",
      aspectRatio: "16/10",
    },
    
    videoThumbnail: {
      height: "160px",
    },
    
    playOverlay: {
      height: "160px",
      
      "& svg": {
        fontSize: "3rem",
      }
    }
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const helps = await list();
        setRecords(helps);
      } catch (error) {
        console.error("Error al cargar videos de ayuda:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  // Calcular estatísticas
  const totalVideos = records.length;
  const videosWithDescription = records.filter(record => record.description && record.description.trim().length > 0).length;
  const recentVideos = records.filter(record => {
    // Assumindo que vídeos mais recentes têm IDs maiores
    return record.id > Math.max(...records.map(r => r.id)) - 5;
  }).length;

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <Fade in={Boolean(selectedVideo)}>
          <div className={classes.videoModalContent}>
            <IconButton
              className={classes.closeButton}
              onClick={closeVideoModal}
              size="small"
            >
              <CloseIcon />
            </IconButton>
            {selectedVideo && (
              <iframe
                className={classes.videoFrame}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Fade>
      </Modal>
    );
  };

  const renderHelps = () => {
    if (loading) {
      return (
        <div className={classes.loadingState}>
          <CircularProgress size={50} style={{ color: "#3b82f6", marginBottom: "16px" }} />
          <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
            Cargando videos de ayuda...
          </Typography>
          <Typography variant="body2">
            Espera mientras buscamos el contenido
          </Typography>
        </div>
      );
    }

    if (!records.length) {
      return (
        <div className={classes.emptyState}>
          <VideoLibraryIcon style={{ fontSize: '4rem', marginBottom: '16px', color: '#cbd5e1' }} />
          <Typography variant="h6" style={{ fontWeight: '700', marginBottom: '8px', color: '#1a202c' }}>
            No hay videos de ayuda disponibles
          </Typography>
          <Typography variant="body2">
            Los videos de ayuda aún no han sido configurados
          </Typography>
        </div>
      );
    }

    return (
      <div className={classes.mainPaperContainer}>
        <Grid container spacing={3}>
          {records.map((record, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                className={classes.videoCard}
                onClick={() => openVideoModal(record.video)}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                    alt={record.title}
                    className={classes.videoThumbnail}
                  />
                  <div className={classes.playOverlay}>
                    <PlayCircleOutlineIcon />
                  </div>
                </div>
                
                <CardContent className={classes.videoContent}>
                  <Typography className={classes.videoTitle}>
                    {record.title}
                  </Typography>
                  
                  {record.description && (
                    <Typography className={classes.videoDescription}>
                      {record.description}
                    </Typography>
                  )}
                  
                  <div className={classes.videoMeta}>
                    <Chip
                      icon={<VideoLibraryIcon />}
                      label="Video tutorial"
                      size="small"
                      className={classes.videoChip}
                    />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* CABEÇALHO */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography className={classes.headerTitle}>
                <HelpIcon />
                Centro de ayuda
              </Typography>
              <Typography className={classes.headerSubtitle}>
                Tutoriales y guías para utilizar todas las funcionalidades
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECCIÓN: ESTADÍSTICAS DE LOS VIDEOS */}
        <Box className={classes.cardSection}>
          <Typography className={classes.sectionTitle}>
            <VideoLibraryIcon />
            Estadísticas de los videos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={4}>
              <Box className={clsx(classes.mainCard, classes.cardBlue)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Total de videos
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {totalVideos}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                    <VideoLibraryIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Box className={clsx(classes.mainCard, classes.cardGreen)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Con descripción
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {videosWithDescription}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                    <VisibilityIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Box className={clsx(classes.mainCard, classes.cardYellow)}>
                <Box className={classes.cardHeader}>
                  <Box>
                    <Typography className={classes.cardLabel}>
                      Tutoriales recientes
                    </Typography>
                    <Typography className={classes.cardValue}>
                      {Math.min(recentVideos, 5)}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                    <AccessTimeIcon />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* SEÇÃO DE VÍDEOS */}
        <Box className={classes.videosSection}>
          <Box className={classes.videosHeader}>
            <Typography className={classes.videosTitle}>
              Videos de ayuda ({totalVideos})
            </Typography>
          </Box>

          {renderHelps()}
        </Box>

        {renderVideoModal()}
      </div>
    </div>
  );
};

export default Helps;