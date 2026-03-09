import React, { useContext, useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LanguageIcon from "@material-ui/icons/Language";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

// Orden: Español (por defecto), Libanés, Português, English. Siempre visibles en /atendimentos y resto.
const defaultLanguages = [
    { code: "es", name: "Español" },
    { code: "ar", name: "العربية (لبنان) / Libanés" },
    { code: "pt-BR", name: "Português" },
    { code: "en", name: "English" },
];

const useStyles = makeStyles((theme) => ({
    langButton: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            transform: "scale(1.05)",
        },
        "& .MuiSvgIcon-root": {
            fontSize: 20,
            color: "#ffffff",
        },
    },
    menuItem: {
        fontSize: 14,
        minWidth: 140,
        "&.active": {
            fontWeight: 700,
            backgroundColor: "rgba(59, 130, 246, 0.08)",
        },
    },
}));

const UserLanguageSelector = () => {
    const classes = useStyles();
    const [langueMenuAnchorEl, setLangueMenuAnchorEl] = useState(null);
    const [languages, setLanguages] = useState(defaultLanguages);

    const { user, socket } = useContext(AuthContext);

    useEffect(() => {
        async function fetchLanguages() {
            try {
                const { data } = await api.get("/translations/languages");
                if (data && Array.isArray(data) && data.length > 1) {
                    const activeLanguages = data.filter(l => l && (l.active !== false));
                    // Solo usar lista del backend si hay 2+ idiomas; si no, mantener los 4 por defecto (es, ar, pt-BR, en)
                    if (activeLanguages.length > 1) {
                        setLanguages(activeLanguages.map(l => ({ code: l.code || l.id, name: l.name || l.code || "" })));
                    }
                }
            } catch (err) {
                // Sin API o error: se usan defaultLanguages (Español, Libanés, Português, English)
            }
        }
        fetchLanguages();
    }, []);

    const handleOpenLanguageMenu = e => {
        setLangueMenuAnchorEl(e.currentTarget);
    };

    const handleCloseLanguageMenu = () => {
        setLangueMenuAnchorEl(null);
    };

    const loadTranslationsForLanguage = async (langCode) => {
        try {
            const { data } = await api.get(`/translations/${langCode}`);
            if (data && Object.keys(data).length > 0) {
                const nested = {};
                Object.keys(data).forEach((key) => {
                    const parts = key.split(".");
                    let current = nested;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!current[parts[i]]) current[parts[i]] = {};
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = data[key];
                });
                i18n.addResourceBundle(langCode, "translations", nested, true, true);
            }
        } catch (err) {
            console.log("Error loading translations for", langCode);
        }
    };

    const handleChangeLanguage = async language => {
        try {
            await loadTranslationsForLanguage(language);
            await i18n.changeLanguage(language);
            if (user && user.id) {
                await api.put(`/users/${user.id}`, { language });
            }
        } catch (err) {
            toastError(err);
        }
        handleCloseLanguageMenu();
    };

    const currentLang = i18n.language || "es";
    const isActiveLang = (code) => currentLang === code || (currentLang && currentLang.startsWith(code + "-")) || (code && code.startsWith(currentLang.split("-")[0]));
    const displayLanguages = languages.length > 1 ? languages : defaultLanguages;

    return (
        <>
            <Tooltip title={i18n.t("layout.language.tooltip") || "Idioma"} placement="bottom">
                <IconButton
                    className={classes.langButton}
                    onClick={handleOpenLanguageMenu}
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={langueMenuAnchorEl}
                keepMounted
                open={Boolean(langueMenuAnchorEl)}
                onClose={handleCloseLanguageMenu}
            >
                {displayLanguages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className={`${classes.menuItem} ${isActiveLang(lang.code) ? "active" : ""}`}
                    >
                        {lang.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default UserLanguageSelector;