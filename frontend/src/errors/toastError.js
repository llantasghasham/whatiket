import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { isString } from 'lodash';

const toastError = err => {
	const errorMsg = err.response?.data?.error;
	if (errorMsg) {
		if (i18n.exists(`backendErrors.${errorMsg}`)) {
			toast.error(i18n.t(`backendErrors.${errorMsg}`), {
				toastId: errorMsg,
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			return
		} else {
			toast.error(errorMsg, {
				toastId: errorMsg,
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			return
		}
	}
	if (err.response?.status === 500 && !errorMsg) {
		toast.error(err.response?.data?.message || "Error interno del servidor. Revise los logs del backend.", {
			toastId: "internal-error",
			autoClose: 4000,
		});
		return;
	}
	if (isString(err)) {
		toast.error(err);
		return;
	}
	toast.error(errorMsg || "Ha ocurrido un error.");
};

export default toastError;
