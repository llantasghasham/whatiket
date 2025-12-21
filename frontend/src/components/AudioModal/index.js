import React, { useRef, useEffect, useState } from "react";
import { IconButton, Slider } from "@material-ui/core";
import { PlayArrow, Pause, Speed, VolumeUp, VolumeOff } from "@material-ui/icons";
import styled, { keyframes } from "styled-components";

const LS_NAME = 'audioMessageRate';

// Animação de pulsação para o botão de play/pause
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Container principal do player
const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  color: #495057;
  width: 280px;
  height: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Header do player
const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
`;

// Ícone de áudio
const AudioIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #007bff, #0056b3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

// Controles do player
const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  width: 100%;
`;

// Botão de play/pause estilizado
const PlayPauseButton = styled(IconButton)`
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  width: 40px;
  height: 40px;
  padding: 0;
  animation: ${({ isPlaying }) => (isPlaying ? pulse : "none")} 1.5s infinite;

  &:hover {
    background: linear-gradient(45deg, #0056b3, #004085);
    transform: scale(1.05);
  }

  .MuiSvgIcon-root {
    font-size: 20px;
  }
`;

// Container da barra de progresso com visualização de ondas
const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Visualização de ondas de áudio
const AudioWaves = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 30px;
  margin-bottom: 4px;
`;

const WaveBar = styled.div`
  width: 3px;
  background: ${({ active }) => active ? '#007bff' : '#dee2e6'};
  border-radius: 2px;
  height: ${({ height }) => height}px;
  transition: all 0.3s ease;
`;

// Barra de progresso estilizada
const ProgressBar = styled(Slider)`
  color: #007bff;
  height: 4px;

  .MuiSlider-thumb {
    width: 12px;
    height: 12px;
    background-color: #007bff;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .MuiSlider-track {
    background-color: #007bff;
    height: 4px;
  }

  .MuiSlider-rail {
    background-color: #dee2e6;
    height: 4px;
  }
`;

// Controles de volume e velocidade
const SecondaryControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
  margin-top: 8px;
`;

// Botão de volume estilizado
const VolumeButton = styled(IconButton)`
  color: #6c757d;
  padding: 4px;

  &:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }

  .MuiSvgIcon-root {
    font-size: 16px;
  }
`;

// Botão de velocidade estilizado
const SpeedButton = styled(IconButton)`
  color: #6c757d;
  padding: 4px;
  font-size: 12px;
  min-width: auto;

  &:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }

  .MuiSvgIcon-root {
    font-size: 14px;
  }
`;

// Exibição do tempo
const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

// Função para formatar o tempo em mm:ss
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const AudioModal = ({ url }) => {
    const audioRef = useRef(null);
    const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Atualiza a taxa de reprodução no localStorage
    useEffect(() => {
        audioRef.current.playbackRate = audioRate;
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    // Actualiza el tiempo actual y la duración del audio
    useEffect(() => {
        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Alternar entre play e pause
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    // Alternar a velocidade de reprodução
    const toggleRate = () => {
        const rates = [0.5, 1, 1.5, 2];
        const currentIndex = rates.indexOf(audioRate);
        const newRate = rates[(currentIndex + 1) % rates.length];
        setAudioRate(newRate);
    };

    // Atualizar o volume
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        audioRef.current.volume = newValue;
        setIsMuted(newValue === 0);
    };

    // Alternar entre mudo e desmudo
    const toggleMute = () => {
        if (isMuted) {
            audioRef.current.volume = volume;
        } else {
            audioRef.current.volume = 0;
        }
        setIsMuted(!isMuted);
    };

    // Actualizar el tiempo del audio al arrastrar la barra de progreso
    const handleSeek = (event, newValue) => {
        audioRef.current.currentTime = newValue;
        setCurrentTime(newValue);
    };

    // Obtener la fuente del audio (compatible con iOS)
    const getAudioSource = () => {
        let sourceUrl = url;

        if (isIOS) {
            sourceUrl = sourceUrl.replace(".ogg", ".mp3");
        }

        return (
            <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />
        );
    };

    // Generar barras de ondas de audio
    const generateWaves = () => {
        const waves = [];
        const waveCount = 40;
        for (let i = 0; i < waveCount; i++) {
            const progress = duration > 0 ? currentTime / duration : 0;
            const isActive = i < progress * waveCount;
            const height = Math.random() * 20 + 8; // Altura aleatoria entre 8 y 28px
            waves.push(
                <WaveBar key={i} active={isActive} height={height} />
            );
        }
        return waves;
    };

    return (
        <PlayerContainer>
            <PlayerHeader>
                <AudioIcon>🎵</AudioIcon>
                <span>Player de Audio</span>
            </PlayerHeader>
            
            <AudioWaves>
                {generateWaves()}
            </AudioWaves>
            
            <TimeDisplay>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </TimeDisplay>
            
            <Controls>
                <PlayPauseButton isPlaying={isPlaying} onClick={togglePlayPause}>
                    {isPlaying ? <Pause /> : <PlayArrow />}
                </PlayPauseButton>
                <ProgressContainer>
                    <ProgressBar
                        value={currentTime}
                        max={duration}
                        onChange={handleSeek}
                        aria-labelledby="audio-seek-slider"
                    />
                </ProgressContainer>
            </Controls>
            
            <SecondaryControls>
                <VolumeButton onClick={toggleMute}>
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                </VolumeButton>
                <Slider
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    aria-labelledby="volume-slider"
                    style={{ width: "60px", color: "#6c757d" }}
                />
                <SpeedButton onClick={toggleRate}>
                    {audioRate}x
                </SpeedButton>
            </SecondaryControls>
            
            <audio ref={audioRef} style={{ display: "none" }}>
                {getAudioSource()}
            </audio>
        </PlayerContainer>
    );
};

export default AudioModal;