import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
} from "react";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import fileNode from "./nodes/fileNode"; // Importar el nuevo nodo de archivo

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { Box, CircularProgress } from "@material-ui/core";
import BallotIcon from "@mui/icons-material/Ballot";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  onElementsRemove,
  useReactFlow,
} from "react-flow-renderer";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam,
} from "@mui/icons-material";
import RemoveEdge from "./nodes/removeEdge";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderAddFileModal from "../../components/FlowBuilderAddFileModal"; // Importar el modal de archivo

import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import { colorPrimary } from "../../styles/styles";
import ticketNode from "./nodes/ticketNode";
import { ConfirmationNumber } from "@material-ui/icons";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";
import SaveIcon from "@mui/icons-material/Save";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    position: "relative",
    backgroundColor: "#f5f7fa",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  sidebar: {
    width: "220px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderRadius: "12px 0 0 12px",
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
  },
  sidebarTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    textAlign: "center",
    width: "100%",
    letterSpacing: "0.5px",
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    marginBottom: "12px",
    width: "100%",
    height: "48px",
    minWidth: "auto",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "500",
    textTransform: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.25)",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    "&:active": {
      transform: "translateY(0px)",
    },
  },
  buttonIcon: {
    marginRight: "12px",
    fontSize: "20px",
  },
  saveButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 24px",
    fontWeight: "600",
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    border: "none",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
    },
  },
  flowContainer: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  animatedEdge: {
    animation: "$dash 1s linear infinite",
  },
  "@keyframes dash": {
    from: {
      strokeDashoffset: 24,
    },
    to: {
      strokeDashoffset: 0,
    },
  },
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
  file: fileNode, // Agregar el nuevo tipo de nodo
};

const edgeTypes = {
  buttonedge: RemoveEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio del flujo" },
    type: "start",
  },
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);
  const [modalAddFile, setModalAddFile] = useState(null); // Estado para o modal de arquivo

  const connectionLineStyle = { stroke: "#2b2b2b", strokeWidth: "6px" };

  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    if (type === "file") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              label: data.label || "Enviar archivo",
              url: data.url,
            },
            type: "file",
          },
        ];
      });
    }

    if (type === "start") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: "Inicio del flujo" },
            type: "start",
          },
        ];
      });
    }
    if (type === "text") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message",
          },
        ];
      });
    }
    if (type === "interval") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval",
          },
        ];
      });
    }
    if (type === "condition") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value,
            },
            type: "condition",
          },
        ];
      });
    }
    if (type === "menu") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption,
            },
            type: "menu",
          },
        ];
      });
    }
    if (type === "img") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img",
          },
        ];
      });
    }
    if (type === "audio") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio",
          },
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer",
          },
        ];
      });
    }
    if (type === "video") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video",
          },
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock",
          },
        ];
      });
    }
    if (type === "ticket") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket",
          },
        ];
      });
    }
    if (type === "typebot") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "typebot",
          },
        ];
      });
    }
    if (type === "openai") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "openai",
          },
        ];
      });
    }
    if (type === "question") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "question",
          },
        ];
      });
    }
  };

  const textAdd = (data) => {
    addNode("text", data);
  };

  const intervalAdd = (data) => {
    addNode("interval", data);
  };

  const conditionAdd = (data) => {
    addNode("condition", data);
  };

  const menuAdd = (data) => {
    addNode("menu", data);
  };

  const imgAdd = (data) => {
    addNode("img", data);
  };

  const audioAdd = (data) => {
    addNode("audio", data);
  };

  const randomizerAdd = (data) => {
    addNode("randomizer", data);
  };

  const videoAdd = (data) => {
    addNode("video", data);
  };

  const singleBlockAdd = (data) => {
    addNode("singleBlock", data);
  };

  const ticketAdd = (data) => {
    addNode("ticket", data);
  };

  const typebotAdd = (data) => {
    addNode("typebot", data);
  };

  const openaiAdd = (data) => {
    addNode("openai", data);
  };

  const questionAdd = (data) => {
    addNode("question", data);
  };

  const fileAdd = (data) => {
    addNode("file", data);
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);

          if (data.flow.flow !== null) {
            const flowNodes = data.flow.flow.nodes;
            setNodes(flowNodes);
            setEdges(data.flow.flow.connections);
            const filterVariables = flowNodes.filter(
              (nd) => nd.type === "question"
            );
            const variables = filterVariables.map(
              (variable) => variable.data.typebotIntegration.answerKey
            );
            localStorage.setItem("variables", JSON.stringify(variables));
          }
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map((node) => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY,
        },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 },
      };
      setNodes((old) => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const saveFlow = async () => {
    console.log("🔥 BOTÓN DE GUARDAR PRESIONADO - Función saveFlow ejecutada");
    console.log("ID del flujo:", id);
    console.log("Número de nodos:", nodes.length);
    console.log("Número de conexiones:", edges.length);
    
    try {
      console.log("Guardando flujo con datos:", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      });
      
      // Verificar si la URL del backend está configurada
      console.log("URL del backend:", process.env.REACT_APP_BACKEND_URL);
      
      const response = await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      });
      
      console.log("Respuesta del servidor:", response);
      toast.success("Flujo guardado con éxito");
    } catch (error) {
      console.error("Error al guardar el flujo:", error);
      toast.error("Error al guardar el flujo: " + (error.response?.data?.message || error.message));
    }
  };

  const doubleClick = (event, node) => {
    console.log("NODE", node);
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }
    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit");
    }
    if (node.type === "typebot") {
      setModalAddTypebot("edit");
    }
    if (node.type === "openai") {
      setModalAddOpenAI("edit");
    }
    if (node.type === "question") {
      setModalAddQuestion("edit");
    }
    if (node.type === "file") {
      setModalAddFile("edit");
    }
  };

  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { backgroundColor: "#0000FF", padding: 1, borderRadius: 8 },
          };
        }
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const clickEdge = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
    setModalAddFile(null);
  };

  const actions = [
    {
      icon: (
        <RocketLaunch
          sx={{
            color: "#3ABA38",
          }}
        />
      ),
      name: "Inicio",
      type: "start",
    },
    {
      icon: (
        <LibraryBooks
          sx={{
            color: "#EC5858",
          }}
        />
      ),
      name: "Contenido",
      type: "content",
    },
    {
      icon: (
        <DynamicFeed
          sx={{
            color: "#683AC8",
          }}
        />
      ),
      name: "Menú",
      type: "menu",
    },
    {
      icon: (
        <CallSplit
          sx={{
            color: "#1FBADC",
          }}
        />
      ),
      name: "Randomizador",
      type: "random",
    },
    {
      icon: (
        <AccessTime
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Intervalo",
      type: "interval",
    },
    {
      icon: (
        <ConfirmationNumber
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Ticket",
      type: "ticket",
    },
    {
      icon: (
        <Box
          component="img"
          sx={{
            width: 24,
            height: 24,
            color: "#3aba38",
          }}
          src={typebotIcon}
          alt="icon"
        />
      ),
      name: "TypeBot",
      type: "typebot",
    },
    {
      icon: (
        <SiOpenai
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "OpenAI",
      type: "openai",
    },
    {
      icon: (
        <BallotIcon
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Pregunta",
      type: "question",
    },

  ];

  const clickActions = (type) => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break;
      case "question":
        setModalAddQuestion("create");
        break;
      case "file":
        setModalAddFile("create");
        break;
      default:
        break;
    }
  };

  return (
    <Stack sx={{ height: "100vh" }}>
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddText(null)}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddInterval(null)}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddMenu(null)}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddImg(null)}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddAudio(null)}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddRandomizer(null)}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddVideo(null)}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddSingleBlock(null)}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTicket(null)}
      />
      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddOpenAI(null)}
      />
      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddTypebot(null)}
      />
      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddQuestion(null)}
      />
      <FlowBuilderAddFileModal
        open={modalAddFile}
        onSave={fileAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={() => setModalAddFile(null)}
      />

      <MainHeader>
        <Title>Diseña tu flujo</Title>
        <MainHeaderButtonsWrapper>
          <Button
            className={classes.saveButton}
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={() => {
              console.log("🔥 CLICK DETECTADO EN EL BOTÓN!");
              saveFlow();
            }}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 1001,
              position: 'relative'
            }}
          >
            💾 Guardar Flujo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      {!loading && (
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <Stack className={classes.sidebar}>
            <Typography className={classes.sidebarTitle}>
              🎨 Herramientas
            </Typography>
            {actions.map((action) => (
              <Button
                key={action.name}
                className={classes.button}
                onClick={() => clickActions(action.type)}
              >
                <Box className={classes.buttonIcon}>{action.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{action.name}</Typography>
              </Button>
            ))}
          </Stack>
          <Stack
            sx={{
              position: "absolute",
              justifyContent: "center",
              flexDirection: "row",
              width: "100%",
              top: "10px",
              zIndex: 1000,
            }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "8px 16px",
                borderRadius: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Typography 
                sx={{ 
                  color: "#667eea", 
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                💡 ¡No olvides guardar tu flujo!
              </Typography>
            </Box>
          </Stack>


          <Stack
            direction={"row"}
            style={{
              width: "100%",
              height: "90%",
              position: "relative",
              display: "flex",
            }}
          >
            <Box 
              className={classes.flowContainer}
              style={{
                width: "calc(100% - 220px)",
                height: "100%",
                marginLeft: "220px",
              }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                deleteKeyCode={["Backspace", "Delete"]}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={doubleClick}
                onNodeClick={clickNode}
                onEdgeClick={clickEdge}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                connectionLineStyle={connectionLineStyle}
                style={{
                  backgroundColor: "#F8F9FA",
                  width: "100%",
                  height: "100%",
                }}
                edgeTypes={edgeTypes}
                variant={"cross"}
                defaultEdgeOptions={{
                  style: { color: "#ff0000", strokeWidth: "6px" },
                  animated: true, // Animação ativada
                  className: classes.animatedEdge, // Aplicar animação personalizada
                }}
              >
                <Controls 
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <MiniMap 
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Background 
                  variant="dots" 
                  gap={20} 
                  size={1.5} 
                  color="rgba(102, 126, 234, 0.3)"
                />
              </ReactFlow>
            </Box>

            <Stack
              style={{
                backgroundColor: "#FAFAFA",
                height: "20px",
                width: "58px",
                position: "absolute",
                bottom: 0,
                right: 0,
                zIndex: 1111,
              }}
            />
          </Stack>
        </Paper>
      )}
      {loading && (
        <Stack justifyContent={"center"} alignItems={"center"} height={"70vh"}>
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};
