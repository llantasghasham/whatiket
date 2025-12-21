import React, { useState, useEffect, useReducer, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import Dialog from "@mui/material/Dialog";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BlockIcon from "@material-ui/icons/Block";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import formatSerializedId from '../../utils/formatSerializedId';
import { v4 as uuidv4 } from "uuid";
import { ArrowDropDown, Backup, ContactPhone, People, TrendingUp, Assessment, FilterList, ExpandLess, ExpandMore, Clear } from "@material-ui/icons";
import { Menu, MenuItem, Collapse, Chip, Tooltip } from "@material-ui/core";
import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import clsx from "clsx";

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const markers = [
    { markerOffset: -30, name: "Aracaju", coordinates: [-37.0717, -10.9472] },
    { markerOffset: 15, name: "Belém", coordinates: [-48.4878, -1.4558] },
    { markerOffset: 15, name: "Belo Horizonte", coordinates: [-43.9378, -19.8157] },
    { markerOffset: 15, name: "Boa Vista", coordinates: [-60.6739, 2.8195] },
    { markerOffset: 15, name: "Brasília", coordinates: [-47.8825, -15.7942] },
    { markerOffset: 15, name: "Campo Grande", coordinates: [-54.6464, -20.4428] },
    { markerOffset: 15, name: "Cuiabá", coordinates: [-56.0969, -15.6011] },
    { markerOffset: 15, name: "Curitiba", coordinates: [-49.2736, -25.4296] },
    { markerOffset: 15, name: "Florianópolis", coordinates: [-48.5492, -27.5969] },
    { markerOffset: 15, name: "Fortaleza", coordinates: [-38.5267, -3.71839] },
    { markerOffset: 15, name: "Goiânia", coordinates: [-49.2736, -16.6869] },
    { markerOffset: 15, name: "João Pessoa", coordinates: [-34.8631, -7.1195] },
    { markerOffset: 15, name: "Macapá", coordinates: [-51.0667, 0.0333] },
    { markerOffset: 15, name: "Maceió", coordinates: [-35.7353, -9.6658] },
    { markerOffset: 15, name: "Manaus", coordinates: [-60.025, -3.10194] },
    { markerOffset: 15, name: "Natal", coordinates: [-35.2094, -5.795] },
    { markerOffset: 15, name: "Palmas", coordinates: [-48.3347, -10.1844] },
    { markerOffset: 15, name: "Porto Alegre", coordinates: [-51.23, -30.0331] },
    { markerOffset: 15, name: "Porto Velho", coordinates: [-63.9039, -8.7619] },
    { markerOffset: 15, name: "Recife", coordinates: [-34.8811, -8.05389] },
    { markerOffset: 15, name: "Rio Branco", coordinates: [-67.8099, -9.9747] },
    { markerOffset: 15, name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068] },
    { markerOffset: 15, name: "Salvador", coordinates: [-38.4813, -12.9716] },
    { markerOffset: 15, name: "São Luís", coordinates: [-44.3028, -2.5283] },
    { markerOffset: 15, name: "São Paulo", coordinates: [-46.6333, -23.5505] },
    { markerOffset: 15, name: "Teresina", coordinates: [-42.8039, -5.0892] },
    { markerOffset: 15, name: "Vitória", coordinates: [-40.3378, -20.3194] },
];

// Lista de DDDs e seus estados correspondentes
const dddList = {
    "11": "São Paulo",
    "12": "São Paulo",
    "13": "São Paulo",
    "14": "São Paulo",
    "15": "São Paulo",
    "16": "São Paulo",
    "17": "São Paulo",
    "18": "São Paulo",
    "19": "São Paulo",
    "21": "Rio de Janeiro",
    "22": "Rio de Janeiro",
    "24": "Rio de Janeiro",
    "27": "Espírito Santo",
    "28": "Espírito Santo",
    "31": "Minas Gerais",
    "32": "Minas Gerais",
    "33": "Minas Gerais",
    "34": "Minas Gerais",
    "35": "Minas Gerais",
    "37": "Minas Gerais",
    "38": "Minas Gerais",
    "41": "Paraná",
    "42": "Paraná",
    "43": "Paraná",
    "44": "Paraná",
    "45": "Paraná",
    "46": "Paraná",
    "47": "Santa Catarina",
    "48": "Santa Catarina",
    "49": "Santa Catarina",
    "51": "Rio Grande do Sul",
    "53": "Rio Grande do Sul",
    "54": "Rio Grande do Sul",
    "55": "Rio Grande do Sul",
    "61": "Distrito Federal/Goiás",
    "62": "Goiás",
    "63": "Tocantins",
    "64": "Goiás",
    "65": "Mato Grosso",
    "66": "Mato Grosso",
    "67": "Mato Grosso do Sul",
    "68": "Acre",
    "69": "Rondônia",
    "71": "Bahia",
    "73": "Bahia",
    "74": "Bahia",
    "75": "Bahia",
    "77": "Bahia",
    "79": "Sergipe",
    "81": "Pernambuco",
    "82": "Alagoas",
    "83": "Paraíba",
    "84": "Rio Grande do Norte",
    "85": "Ceará",
    "86": "Piauí",
    "87": "Pernambuco",
    "88": "Ceará",
    "89": "Piauí",
    "91": "Pará",
    "92": "Amazonas",
    "93": "Pará",
    "94": "Pará",
    "95": "Roraima",
    "96": "Amapá",
    "97": "Amazonas",
    "98": "Maranhão",
    "99": "Maranhão",
};

const ExpandableAvatar = ({ contact }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Avatar
                src={`${contact?.urlPicture}`}
                style={{
                    width: "50px",
                    height: "50px",
                    border: "3px solid #3b82f6",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                }}
                onClick={handleOpen}
            />
            <Dialog open={open} onClose={handleClose}>
                <img
                    src={`${contact?.urlPicture}`}
                    alt="Contact"
                    style={{
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                    }}
                />
            </Dialog>
        </>
    );
};

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
        const contacts = action.payload;
        const newContacts = [];

        contacts.forEach((contact) => {
            const contactIndex = state.findIndex((c) => c.id === contact.id);
            if (contactIndex !== -1) {
                state[contactIndex] = contact;
            } else {
                newContacts.push(contact);
            }
        });

        return [...state, ...newContacts];
    }

    if (action.type === "UPDATE_CONTACTS") {
        const contact = action.payload;
        const contactIndex = state.findIndex((c) => c.id === contact.id);

        if (contactIndex !== -1) {
            state[contactIndex] = contact;
            return [...state];
        } else {
            return [contact, ...state];
        }
    }

    if (action.type === "DELETE_CONTACT") {
        const contactId = action.payload;

        const contactIndex = state.findIndex((c) => c.id === contactId);
        if (contactIndex !== -1) {
            state.splice(contactIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
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

    warningButton: {
        backgroundColor: "#f59e0b",
        color: "white",
        
        "&:hover": {
            backgroundColor: "#d97706",
        },
    },

    // ===== SEÇÃO DE CONTATOS =====
    contactsSection: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: theme.spacing(3),
        marginBottom: theme.spacing(4),
        border: "1px solid #e2e8f0",
        minHeight: "400px",
    },

    contactsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(3),
        paddingBottom: theme.spacing(2),
        borderBottom: "1px solid #e2e8f0",
    },

    contactsTitle: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#1a202c",
    },

    // ===== CARDS DE CONTATOS =====
    contactCard: {
        backgroundColor: "#fff",
        borderRadius: "16px",
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
            backgroundColor: "#3b82f6",
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

    contactCardContent: {
        padding: theme.spacing(2),
    },

    contactInfo: {
        fontSize: "14px",
        color: "#4a5568",
        marginBottom: theme.spacing(1),
        display: "flex",
        alignItems: "center",
        fontWeight: 500,
        
        "& strong": {
            color: "#1a202c",
            fontWeight: 700,
            marginLeft: theme.spacing(0.5),
            wordBreak: "break-word",
        },
    },

    contactActions: {
        padding: theme.spacing(1, 2),
        justifyContent: "center",
        gap: theme.spacing(1),
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        flexWrap: "wrap",
    },

    actionButton: {
        borderRadius: "8px",
        padding: theme.spacing(1),
        minWidth: "40px",
        minHeight: "40px",
        transition: "all 0.2s ease",
        
        "&:hover": {
            transform: "translateY(-2px)",
        },
    },

    mobileActionButton: {
        width: "100%",
        justifyContent: "flex-start",
        borderRadius: "8px",
        padding: theme.spacing(1, 2),
        marginBottom: theme.spacing(1),
        fontWeight: 600,
        textTransform: "none",
    },

    // ===== TABS =====
    tabsContainer: {
        backgroundColor: "white",
        borderRadius: "16px",
        marginBottom: theme.spacing(3),
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        
        "& .MuiTabs-root": {
            minHeight: "48px",
        },
        
        "& .MuiTab-root": {
            fontSize: "16px",
            fontWeight: 600,
            textTransform: "none",
            color: "#64748b",
            minHeight: "48px",
            
            "&.Mui-selected": {
                color: "#3b82f6",
            }
        },
        
        "& .MuiTabs-indicator": {
            backgroundColor: "#3b82f6",
            height: "3px",
        }
    },

    // ===== MAPA =====
    mapSection: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: theme.spacing(3),
        border: "1px solid #e2e8f0",
    },

    legendCard: {
        marginBottom: theme.spacing(3),
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
    },

    legendContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: theme.spacing(2),
    },

    legendItem: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(1),
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },

    legendColor: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        marginRight: theme.spacing(1),
        backgroundColor: "#FFA500",
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

    // ===== SCROLL CUSTOMIZADO =====
    customScrollContainer: {
        maxHeight: "calc(100vh - 400px)",
        overflowY: "auto",
        
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

    statusChip: {
        fontWeight: 700,
        fontSize: "12px",
        height: "24px",
        borderRadius: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        
        "&.active": {
            backgroundColor: "#dcfce7",
            color: "#166534",
        },
        
        "&.inactive": {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
        },
    },
}));

const Contacts = () => {
    const classes = useStyles();
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { user, socket } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contacts, dispatch] = useReducer(reducer, []);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const [importContactModalOpen, setImportContactModalOpen] = useState(false);
    const [deletingContact, setDeletingContact] = useState(null);
    const [ImportContacts, setImportContacts] = useState(null);
    const [blockingContact, setBlockingContact] = useState(null);
    const [unBlockingContact, setUnBlockingContact] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [exportContact, setExportContact] = useState(false);
    const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});
    const fileUploadRef = useRef(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const { setCurrentTicket } = useContext(TicketsContext);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    const [importWhatsappId, setImportWhatsappId] = useState()

    const { getAll: getAllSettings } = useCompanySettings();
    const [hideNum, setHideNum] = useState(false);
    const [enableLGPD, setEnableLGPD] = useState(false);

    // Estatísticas calculadas
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => c.active).length;
    const inactiveContacts = contacts.filter(c => !c.active).length;
    const whatsappContacts = contacts.filter(c => c.whatsapp).length;

    useEffect(() => {
        async function fetchData() {
            const settingList = await getAllSettings(user.companyId);

            for (const [key, value] of Object.entries(settingList)) {
                if (key === "enableLGPD") setEnableLGPD(value === "enabled");
                if (key === "lgpdHideNumber") setHideNum(value === "enabled");
            }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleImportExcel = async () => {
        try {
            const formData = new FormData();
            formData.append("file", fileUploadRef.current.files[0]);
            await api.request({
                url: `/contacts/upload`,
                method: "POST",
                data: formData,
            });
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam, selectedTags]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const { data } = await api.get("/contacts/", {
                        params: { searchParam, pageNumber, contactTag: JSON.stringify(selectedTags) },
                    });
                    dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, selectedTags]);

    useEffect(() => {
        const companyId = user.companyId;

        const onContactEvent = (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
            }
        };
        socket.on(`company-${companyId}-contact`, onContactEvent);

        return () => {
            socket.off(`company-${companyId}-contact`, onContactEvent);
        };
    }, [socket]);

    const handleSelectTicket = (ticket) => {
        const code = uuidv4();
        const { id, uuid } = ticket;
        setCurrentTicket({ id, uuid, code });
    }

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            handleSelectTicket(ticket);
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    const handleSelectedTags = (selecteds) => {
        const tags = selecteds.map((t) => t.id);
        setSelectedTags(tags);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleOpenContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const hadleEditContact = (contactId) => {
        setSelectedContactId(contactId);
        setContactModalOpen(true);
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await api.delete(`/contacts/${contactId}`);
            toast.success(i18n.t("contacts.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: false });
            toast.success("Contacto bloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setBlockingContact(null);
    };

    const handleUnBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: true });
            toast.success("Contacto desbloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setUnBlockingContact(null);
    };

    const onSave = (whatsappId) => {
        setImportWhatsappId(whatsappId)
    }

    const handleimportContact = async () => {
        setImportContactModalOpen(false)

        try {
            await api.post("/contacts/import", { whatsappId: importWhatsappId });
            history.go(0);
            setImportContactModalOpen(false);
        } catch (err) {
            toastError(err);
            setImportContactModalOpen(false);
        }
    };

    const handleimportChats = async () => {
        console.log("handleimportChats")
        try {
            await api.post("/contacts/import/chats");
            history.go(0);
        } catch (err) {
            toastError(err);
        }
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

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Função para contar contatos por estado
    const countContactsByState = () => {
        const stateCounts = {};

        contacts.forEach(contact => {
            const number = contact.number;
            if (number && number.length > 2) {
                const ddd = number.substring(2, 4); // Extrai os dígitos 3 e 4 (DDD após o código do país)
                if (dddList[ddd]) {
                    const state = dddList[ddd];
                    if (!stateCounts[state]) {
                        stateCounts[state] = 0;
                    }
                    stateCounts[state]++;
                } else {
                    // Se o DDD não estiver na lista de DDDs do Brasil, adiciona à categoria "Outros"
                    if (!stateCounts["Outros"]) {
                        stateCounts["Outros"] = 0;
                    }
                    stateCounts["Outros"]++;
                }
            }
        });

        return stateCounts;
    };

    const stateCounts = countContactsByState();

    const renderContactActions = (contact) => {
        if (isMobile) {
            return (
                <CardActions className={classes.contactActions}>
                    <Button
                        variant="contained"
                        size="small"
                        disabled={!contact.active}
                        onClick={() => {
                            setContactTicket(contact);
                            setNewTicketModalOpen(true);
                        }}
                        startIcon={<WhatsApp />}
                        className={clsx(classes.mobileActionButton, classes.secondaryButton)}
                    >
                        WhatsApp
                    </Button>
                    
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => hadleEditContact(contact.id)}
                        startIcon={<EditIcon />}
                        className={clsx(classes.mobileActionButton, classes.primaryButton)}
                    >
                        Editar
                    </Button>
                    
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                            contact.active
                                ? (setConfirmOpen(true), setBlockingContact(contact))
                                : (setConfirmOpen(true), setUnBlockingContact(contact))
                        }
                        startIcon={contact.active ? <BlockIcon /> : <CheckCircleIcon />}
                        className={clsx(classes.mobileActionButton, classes.warningButton)}
                    >
                        {contact.active ? "Bloquear" : "Desbloquear"}
                    </Button>
                    
                    <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    setConfirmOpen(true);
                                    setDeletingContact(contact);
                                }}
                                startIcon={<DeleteOutlineIcon />}
                                style={{
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                }}
                                className={classes.mobileActionButton}
                            >
                                Eliminar
                            </Button>
                        )}
                    />
                </CardActions>
            );
        } else {
            return (
                <CardActions className={classes.contactActions}>
                    <Tooltip title="Abrir WhatsApp" placement="top">
                      <IconButton
                        size="small"
                        disabled={!contact.active}
                        onClick={() => {
                          setContactTicket(contact);
                          setNewTicketModalOpen(true);
                        }}
                        className={classes.actionButton}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                        }}
                      >
                        <WhatsApp />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar contacto" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => hadleEditContact(contact.id)}
                        className={classes.actionButton}
                        style={{
                          backgroundColor: "#3b82f6",
                          color: "white",
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={contact.active ? "Bloquear" : "Desbloquear"} placement="top">
                        <IconButton
                            size="small"
                            onClick={() =>
                                contact.active
                                    ? (setConfirmOpen(true), setBlockingContact(contact))
                                    : (setConfirmOpen(true), setUnBlockingContact(contact))
                            }
                            className={classes.actionButton}
                            style={{
                                backgroundColor: contact.active ? "#f59e0b" : "#10b981",
                                color: "white",
                            }}
                        >
                            {contact.active ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                    </Tooltip>

                    <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                            <Tooltip title="Eliminar contacto" placement="top">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setConfirmOpen(true);
                                        setDeletingContact(contact);
                                    }}
                                    className={classes.actionButton}
                                    style={{
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    />
                </CardActions>
            );
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.container}>
                <NewTicketModal
                    modalOpen={newTicketModalOpen}
                    initialContact={contactTicket}
                    onClose={(ticket) => {
                        handleCloseOrOpenTicket(ticket);
                    }}
                />
                <ContactModal
                    open={contactModalOpen}
                    onClose={handleCloseContactModal}
                    aria-labelledby="form-dialog-title"
                    contactId={selectedContactId}
                />
                <ConfirmationModal
                    title={
                        deletingContact
                            ? `${i18n.t(
                                "contacts.confirmationModal.deleteTitle"
                            )} ${deletingContact.name}?`
                            : blockingContact
                                ? `¿Bloquear contacto ${blockingContact.name}?`
                                : unBlockingContact
                                    ? `¿Desbloquear contacto ${unBlockingContact.name}?`
                                    : ImportContacts
                                        ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
                                        : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
                    }
                    onSave={onSave}
                    isCellPhone={ImportContacts}
                    open={confirmOpen}
                    onClose={setConfirmOpen}
                    onConfirm={(e) =>
                        deletingContact
                            ? handleDeleteContact(deletingContact.id)
                            : blockingContact
                                ? handleBlockContact(blockingContact.id)
                                : unBlockingContact
                                    ? handleUnBlockContact(unBlockingContact.id)
                                    : ImportContacts
                                        ? handleimportContact()
                                        : handleImportExcel()
                    }
                >
                    {exportContact
                        ?
                        `${i18n.t("contacts.confirmationModal.exportContact")}`
                        : deletingContact
                            ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
                            : blockingContact
                                ? `El contacto será bloqueado y no podrá interactuar.`
                                : unBlockingContact
                                    ? `El contacto será desbloqueado y podrá interactuar.`
                                    : ImportContacts
                                        ? `Elige desde qué conexión deseas importar`
                                        : `${i18n.t(
                                            "contactListItems.confirmationModal.importMessage"
                                        )}`}
                </ConfirmationModal>
                <ConfirmationModal
                    title={i18n.t("contacts.confirmationModal.importChat")}
                    open={confirmChatsOpen}
                    onClose={setConfirmChatsOpen}
                    onConfirm={(e) => handleimportChats()}
                >
                    {i18n.t("contacts.confirmationModal.wantImport")}
                </ConfirmationModal>

                {importContactModalOpen && (
                    <ContactImportWpModal
                        isOpen={importContactModalOpen}
                        handleClose={() => setImportContactModalOpen(false)}
                        selectedTags={selectedTags}
                        hideNum={hideNum}
                        userProfile={user.profile}
                    />
                )}

                <input
                    style={{ display: "none" }}
                    id="upload"
                    name="file"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={() => {
                        setConfirmOpen(true);
                    }}
                    ref={fileUploadRef}
                />

                {/* CABEÇALHO */}
                <Box className={classes.header}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography className={classes.headerTitle}>
                                <People />
                                Gestión de contactos
                            </Typography>
                            <Typography className={classes.headerSubtitle}>
                                Organiza y gestiona todos tus contactos
                            </Typography>
                        </Box>
                        <Box className={classes.headerActions}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                className={clsx(classes.modernButton, classes.primaryButton)}
                                onClick={handleOpenContactModal}
                            >
                                {isMobile ? "Añadir" : "Añadir contacto"}
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
                        <IconButton>
                            {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>
                    
                    <Collapse in={filtersExpanded}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    placeholder="Buscar contactos..."
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
                                <TagsFilter onFiltered={handleSelectedTags} />
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
                                <PopupState variant="popover" popupId="import-menu">
                                    {(popupState) => (
                                        <React.Fragment>
                                            <Button
                                                variant="contained"
                                                startIcon={<FileUploadIcon />}
                                                className={clsx(classes.modernButton, classes.secondaryButton)}
                                                fullWidth
                                                {...bindTrigger(popupState)}
                                            >
                                                Importar/Exportar
                                                <ArrowDropDown />
                                            </Button>
                                            <Menu {...bindMenu(popupState)}>
                                                <MenuItem
                                                    onClick={() => {
                                                        setConfirmOpen(true);
                                                        setImportContacts(true);
                                                        popupState.close();
                                                    }}
                                                >
                                                    <ContactPhone
                                                        fontSize="small"
                                                        color="primary"
                                                        style={{ marginRight: 10 }}
                                                    />
                                                    {i18n.t("contacts.menu.importYourPhone")}
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => { setImportContactModalOpen(true) }}
                                                >
                                                    <Backup
                                                        fontSize="small"
                                                        color="primary"
                                                        style={{ marginRight: 10 }}
                                                    />
                                                    {i18n.t("contacts.menu.importToExcel")}
                                                </MenuItem>
                                            </Menu>
                                        </React.Fragment>
                                    )}
                                </PopupState>
                            </Grid>
                        </Grid>
                    </Collapse>
                </Box>

                {/* SECCIÓN: ESTADÍSTICAS DE LOS CONTACTOS */}
                <Box className={classes.cardSection}>
                    <Typography className={classes.sectionTitle}>
                        <Assessment />
                        Estadísticas de los contactos
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.mainCard, classes.cardBlue)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Total de contactos
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {totalContacts}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconBlue)}>
                                        <People />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.mainCard, classes.cardGreen)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Contactos activos
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {activeContacts}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconGreen)}>
                                        <CheckCircleIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.mainCard, classes.cardRed)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Contactos inactivos
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {inactiveContacts}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconRed)}>
                                        <BlockIcon />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>
                            <Card className={clsx(classes.mainCard, classes.cardYellow)}>
                                <Box className={classes.cardHeader}>
                                    <Box>
                                        <Typography className={classes.cardLabel}>
                                            Con WhatsApp
                                        </Typography>
                                        <Typography className={classes.cardValue}>
                                            {whatsappContacts}
                                        </Typography>
                                    </Box>
                                    <Box className={clsx(classes.cardIcon, classes.cardIconYellow)}>
                                        <WhatsApp />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* TABS */}
                <Box className={classes.tabsContainer}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="contact-tabs">
                        <Tab label="Lista de contactos" />
                        <Tab label="Mapa por estado" />
                    </Tabs>
                </Box>

                {/* CONTEÚDO DAS TABS */}
                {tabValue === 0 && (
                    <Box className={classes.contactsSection}>
                        <Box className={classes.contactsHeader}>
                            <Typography className={classes.contactsTitle}>
                                Lista de contactos
                            </Typography>
                        </Box>

                        {loading ? (
                            <div className={classes.loadingContainer}>
                                <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                    Cargando contactos...
                                </Typography>
                                <Typography variant="body2" style={{ color: "#64748b" }}>
                                    Espera mientras buscamos tus contactos
                                </Typography>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className={classes.emptyState}>
                                <People style={{ fontSize: "3rem", marginBottom: "12px", color: "#cbd5e1" }} />
                                <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "8px", color: "#1a202c" }}>
                                    No se encontraron contactos
                                </Typography>
                                <Typography variant="body2">
                                    Añade contactos o ajusta los filtros
                                </Typography>
                            </div>
                        ) : (
                            <div className={classes.customScrollContainer} onScroll={handleScroll}>
                                <Grid container spacing={3}>
                                    {contacts.map((contact) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={contact.id}>
                                            <Card className={classes.contactCard}>
                                                <CardContent className={classes.contactCardContent}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                                        <ExpandableAvatar contact={contact} />
                                                        <Typography 
                                                            variant="h6" 
                                                            style={{ 
                                                                fontWeight: "700", 
                                                                color: "#1a202c", 
                                                                marginTop: "8px",
                                                                textAlign: "center",
                                                                wordBreak: "break-word"
                                                            }}
                                                        >
                                                            {contact.name}
                                                        </Typography>
                                                    </Box>

                                                    <div className={classes.contactInfo}>
                                                        Email: <strong>{contact.email || "N/A"}</strong>
                                                    </div>

                                                    <div className={classes.contactInfo}>
                                                        Número: 
                                                        <strong>
                                                            {enableLGPD && hideNum && user.profile === "user"
                                                                ? contact.isGroup
                                                                    ? contact.number
                                                                    : formatSerializedId(contact?.number) === null
                                                                        ? contact.number.slice(0, -6) + "**-**" + contact?.number.slice(-2)
                                                                        : formatSerializedId(contact?.number)?.slice(0, -6) + "**-**" + contact?.number?.slice(-2)
                                                                : contact.isGroup
                                                                    ? contact.number
                                                                    : formatSerializedId(contact?.number) || contact.number}
                                                        </strong>
                                                    </div>

                                                    <div className={classes.contactInfo}>
                                                        WhatsApp: <strong>{contact?.whatsapp?.name || "N/A"}</strong>
                                                    </div>

                                                    <Box display="flex" justifyContent="center" mt={1} mb={1}>
                                                        <Chip 
                                                            label={contact.active ? "Activo" : "Inactivo"}
                                                            className={`${classes.statusChip} ${contact.active ? 'active' : 'inactive'}`}
                                                            size="small"
                                                            icon={contact.active ? <CheckCircleIcon /> : <BlockIcon />}
                                                        />
                                                    </Box>
                                                </CardContent>

                                                {renderContactActions(contact)}
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </div>
                        )}
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box className={classes.mapSection}>
                        <Typography className={classes.sectionTitle}>
                            Distribución por estado
                        </Typography>
                        
                        <Card className={classes.legendCard}>
                            <CardContent>
                                <Box className={classes.legendContainer}>
                                    {Object.entries(stateCounts).map(([state, count]) => (
                                        <Box key={state} className={classes.legendItem}>
                                            <div className={classes.legendColor} />
                                            <Typography variant="body2" style={{ fontWeight: "600" }}>
                                                {state}: {count} contacto(s)
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 600,
                                center: [-53, -15],
                            }}
                            style={{ width: "100%", height: "auto" }}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const state = geo.properties.name;
                                        const count = stateCounts[state] || 0;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={count > 0 ? "#3b82f6" : "#e2e8f0"}
                                                stroke="#cbd5e1"
                                                style={{
                                                    hover: {
                                                        fill: "#2563eb",
                                                        stroke: "#94a3b8",
                                                    },
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                            {markers.map(({ name, coordinates, markerOffset }) => (
                                <Marker key={name} coordinates={coordinates}>
                                    <circle r={4} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                                    <text
                                        textAnchor="middle"
                                        y={markerOffset}
                                        style={{ 
                                            fontFamily: "system-ui", 
                                            fill: "#1a202c", 
                                            fontSize: "11px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {name}
                                    </text>
                                    {stateCounts[name] && (
                                        <text
                                            textAnchor="middle"
                                            y={markerOffset + 12}
                                            style={{ 
                                                fontFamily: "system-ui", 
                                                fill: "#64748b", 
                                                fontSize: "9px",
                                                fontWeight: "500"
                                            }}
                                        >
                                            {stateCounts[name]} contactos
                                        </text>
                                    )}
                                </Marker>
                            ))}
                        </ComposableMap>
                    </Box>
                )}
            </div>
        </div>
    );
};

export default Contacts;