import React, { useState, useCallback, useContext, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";
import ChatIcon from "@material-ui/icons/Chat";
import AddIcon from "@material-ui/icons/Add";
import TicketsManager from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import NewTicketModal from "../../components/NewTicketModal";

import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import moment from "moment";

const defaultTicketsManagerWidth = 550;
const minTicketsManagerWidth = 404;
const maxTicketsManagerWidth = 700;

const useStyles = makeStyles((theme) => ({
	chatContainer: {
		flex: 1,
		padding: "2px",
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
		overflowX: "hidden",
		backgroundColor: theme.palette.background.default,
	},
	chatPapper: {
		display: "flex",
		height: "100%",
	},
	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
		overflowX: "hidden",
		position: "relative",
	},
	messagesWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		flexGrow: 1,
	},
	welcomeMsg: {
		background: theme.palette.background.default,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
		flexDirection: "column",
		gap: 16,
	},
	welcomeIcon: {
		fontSize: 80,
		color: theme.palette.primary.main,
		opacity: 0.5,
		marginBottom: 8,
	},
	welcomeText: {
		color: theme.palette.text.secondary,
		fontSize: 16,
	},
	floatingButton: {
		position: "fixed",
		right: 24,
		bottom: 24,
		width: 56,
		height: 56,
		borderRadius: "50%",
		border: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#00a884",
		color: "#ffffff",
		boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
		cursor: "pointer",
		zIndex: 2000,
		transition: "transform 0.2s ease, box-shadow 0.2s ease",
		"&:hover": {
			transform: "translateY(-2px)",
			boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
		},
	},
	dragger: {
		width: "5px",
		cursor: "ew-resize",
		padding: "4px 0 0",
		borderTop: "1px solid #ddd",
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 100,
		backgroundColor: theme.palette.background.default,
		userSelect: "none",
	},
}));

const TicketsCustom = () => {
	const { user } = useContext(AuthContext);

	const classes = useStyles({ ticketsManagerWidth: user.defaultTicketsManagerWidth || defaultTicketsManagerWidth });
	const { handleLogout } = useContext(AuthContext);
	const { ticketId } = useParams();
	const history = useHistory();

	const [ticketsManagerWidth, setTicketsManagerWidth] = useState(0);
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const ticketsManagerWidthRef = useRef(ticketsManagerWidth);

	var before = moment(moment().format()).isBefore(user.company.dueDate);

	// Se a empresa estiver ativa, permite acesso mesmo com fatura vencida
	if (before !== true && !user.company.status){
		handleLogout();
	}

	useEffect(() => {
		if (user && user.defaultTicketsManagerWidth) {
			setTicketsManagerWidth(user.defaultTicketsManagerWidth);
		}
	}, [user]);

	const handleMouseDown = (e) => {
		document.addEventListener("mouseup", handleMouseUp, true);
		document.addEventListener("mousemove", handleMouseMove, true);
	};

	const handleSaveContact = async value => {
		if (value < 404)
			value = 404
		await api.put(`/users/toggleChangeWidht/${user.id}`, { defaultTicketsManagerWidth: value });

	}

	const handleMouseMove = useCallback(
		(e) => {
			const newWidth = e.clientX - document.body.offsetLeft;
			if (
				newWidth > minTicketsManagerWidth &&
				newWidth < maxTicketsManagerWidth
			) {
				ticketsManagerWidthRef.current = newWidth;
				setTicketsManagerWidth(newWidth);
			}
		},
		[]
	);

	const handleMouseUp = async () => {
		document.removeEventListener("mouseup", handleMouseUp, true);
		document.removeEventListener("mousemove", handleMouseMove, true);

		const newWidth = ticketsManagerWidthRef.current;

		if (newWidth !== ticketsManagerWidth) {
			await handleSaveContact(newWidth);
		}
	};

	return (
		<QueueSelectedProvider>
			<div className={classes.chatContainer}>
				<div className={classes.chatPapper}>
					<div
						className={classes.contactsWrapper}
						style={{ width: ticketsManagerWidth }}
					>
						<TicketsManager />
						<div onMouseDown={e => handleMouseDown(e)} className={classes.dragger} />
					</div>
					<div className={classes.messagesWrapper}>
						{ticketId ? (
							<Ticket />
						) : (
							<Hidden only={["sm", "xs"]}>
								<div className={classes.welcomeMsg}>
									<ChatIcon className={classes.welcomeIcon} />
									<span className={classes.welcomeText}>
										{i18n.t("chat.noTicketMessage")}
									</span>
								</div>
							</Hidden>
						)}
					</div>
				</div>

				{/* Botón flotante para crear nuevo ticket (igual en /tickets, /conversas, /atendimentos) */}
				<button
					type="button"
					className={classes.floatingButton}
					onClick={() => setNewTicketModalOpen(true)}
				>
					<AddIcon />
				</button>

				<NewTicketModal
					modalOpen={newTicketModalOpen}
					onClose={(ticket) => {
						setNewTicketModalOpen(false);
						if (ticket?.id) {
							// Redirige a la pantalla de atendimentos para continuar la conversación
							history.push(`/atendimentos/${ticket.id}`);
						}
					}}
				/>
			</div>
		</QueueSelectedProvider>
	);
};

export default TicketsCustom;