import React from "react";

import { grey } from "@material-ui/core/colors";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";
import TelegramIcon from "@mui/icons-material/Telegram";

const CONNECTION_COLORS = {
	whatsapp: "#25D366",
	whatsapp_official: "#128C7E",
	instagram: "#E4405F",
	facebook: "#1877F2",
	telegram: "#229ED9",
};

const ConnectionIcon = ({ connectionType, size = 18 }) => {
	const color = CONNECTION_COLORS[connectionType] || grey[500];
	const iconStyle = { color, fontSize: size, verticalAlign: "middle", display: "inline-flex", alignItems: "center" };

	return (
		<React.Fragment>
			{(connectionType === "whatsapp" || connectionType === "whatsapp_business_account") && <WhatsAppIcon style={iconStyle} />}
			{connectionType === "whatsapp_official" && <WhatsAppIcon style={iconStyle} />}
			{connectionType === "instagram" && <InstagramIcon style={iconStyle} />}
			{connectionType === "facebook" && <FacebookIcon style={iconStyle} />}
			{connectionType === "telegram" && <TelegramIcon style={iconStyle} />}
		</React.Fragment>
	);
};

export default ConnectionIcon;
