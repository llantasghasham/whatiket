import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";



const useStyles = makeStyles(theme => ({
    chatContainer: {
        flex: 1,
        // menos padding para que todo se vea más compacto
        padding: theme.spacing(1),
        height: `calc(100% - 48px)`,
        overflow: "hidden",
    },

    chatPapper: {
        display: "flex",
        height: "100%",
    },

    // LISTA DE TICKETS (izquierda)
    contactsWrapper: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
        // permite scroll en la lista de chats
        overflowY: "auto",
    },

    // CAJA DE CHAT (derecha)
    messagessWrapper: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
        // permite scroll en los mensajes
        overflowY: "auto",
    },

	welcomeMsg: {
		// backgroundColor: "#eee",
		background: theme.palette.tabHeaderBackground,
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	logo: {
		logo: theme.logo,
		content: "url(" + ((theme.appLogoLight || theme.appLogoDark) ? getBackendUrl() + "/public/" + (theme.mode === "light" ? theme.appLogoLight || theme.appLogoDark : theme.appLogoDark || theme.appLogoLight) : (theme.mode === "light" ? logo : logoDark)) + ")"
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={5} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={7} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<Ticket />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>
									<center>
										<img className={classes.logo} width="50%" alt="" />
									</center>
									Selecciona un ticket para comenzar la conversación
								</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
