import React, { useEffect } from "react"; // { useContext }
// import { AuthContext } from "../../context/Auth/AuthContext";
import FilterListIcon from '@mui/icons-material/FilterList';

import {
    Button,
    // FormControl,
    Grid,
    // InputLabel,
    // MenuItem,
    Paper,
    // Select,
    TextField,
} from "@material-ui/core";

import Title from "./Title";
import { i18n } from "../../translate/i18n";

const Filters = ({
    classes,
    setDateStartTicket,
    setDateEndTicket,
    dateStartTicket,
    dateEndTicket,
    setQueueTicket,
    queueTicket,
    fetchData
}) => {
    // const { user } = useContext(AuthContext);

    const [
        queues,
        // setQueues
    ] = React.useState(queueTicket);
    const [dateStart, setDateStart] = React.useState(dateStartTicket);
    const [dateEnd, setDateEnd] = React.useState(dateEndTicket);
    const [fetchDataFilter, setFetchDataFilter] = React.useState(false)

    // Estilos compactos e otimizados
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

          :root {
            --primary: #2563eb;
            --primary-light: #3b82f6;
            --primary-subtle: rgba(37, 99, 235, 0.08);
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --border: #e2e8f0;
            --surface: #ffffff;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            --transition: all 0.15s ease;
            --font-family: 'Inter', sans-serif;
            --radius: 6px;
          }

          /* Container Compacto */
          .compact-filters-container {
            background: var(--surface) !important;
            padding: 0.75rem !important;
            font-family: var(--font-family);
          }

          .compact-filters-paper {
            background: var(--surface) !important;
            border: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
            padding: 1rem !important;
            box-shadow: var(--shadow-sm) !important;
            font-family: var(--font-family) !important;
            max-width: 600px;
            margin: 0 auto;
          }

          /* Header Compacto */
          .compact-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
          }

          .compact-icon-container {
            width: 32px;
            height: 32px;
            background: var(--primary-subtle);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .compact-filters-icon {
            color: var(--primary) !important;
            font-size: 1.125rem !important;
          }

          .compact-title {
            font-family: var(--font-family) !important;
            font-weight: 600 !important;
            font-size: 1.125rem !important;
            color: var(--text-primary) !important;
            margin: 0 !important;
            line-height: 1.2;
          }

          /* Form Grid Compacto */
          .compact-form-grid {
            gap: 0.75rem !important;
            margin-top: 0 !important;
          }

          /* TextField Compacto */
          .MuiTextField-root {
            margin-bottom: 0 !important;
          }

          .MuiTextField-root .MuiInputBase-root {
            background: var(--surface) !important;
            border: 1px solid var(--border) !important;
            border-radius: var(--radius) !important;
            transition: var(--transition) !important;
            font-family: var(--font-family) !important;
            min-height: 40px !important;
            height: 40px !important;
          }

          .MuiTextField-root .MuiInputBase-root::before,
          .MuiTextField-root .MuiInputBase-root::after {
            display: none !important;
          }

          .MuiTextField-root .MuiInputBase-root:hover {
            border-color: var(--primary-light) !important;
          }

          .MuiTextField-root .MuiInputBase-root.Mui-focused {
            border-color: var(--primary) !important;
            box-shadow: 0 0 0 2px var(--primary-subtle) !important;
          }

          .MuiTextField-root .MuiInputBase-input {
            color: var(--text-primary) !important;
            font-family: var(--font-family) !important;
            font-weight: 400 !important;
            padding: 0.625rem 0.75rem !important;
            font-size: 0.875rem !important;
            height: auto !important;
          }

          /* Labels Compactos */
          .MuiTextField-root .MuiInputLabel-root {
            color: var(--text-secondary) !important;
            font-family: var(--font-family) !important;
            font-weight: 500 !important;
            font-size: 0.8rem !important;
            transform: translate(12px, -6px) scale(0.85) !important;
            background: var(--surface) !important;
            padding: 0 0.25rem !important;
            border-radius: 2px !important;
          }

          .MuiTextField-root .MuiInputLabel-root.Mui-focused {
            color: var(--primary) !important;
          }

          .MuiTextField-root .MuiInputLabel-shrink {
            transform: translate(12px, -6px) scale(0.85) !important;
          }

          /* Botão Compacto */
          .compact-filter-button {
            background: var(--primary) !important;
            color: white !important;
            border: none !important;
            border-radius: var(--radius) !important;
            padding: 0.625rem 1rem !important;
            font-family: var(--font-family) !important;
            font-weight: 500 !important;
            font-size: 0.875rem !important;
            text-transform: none !important;
            box-shadow: var(--shadow-sm) !important;
            transition: var(--transition) !important;
            height: 40px !important;
            min-width: 80px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.375rem !important;
          }

          .compact-filter-button:hover {
            background: var(--primary-light) !important;
            box-shadow: var(--shadow) !important;
          }

          .compact-filter-button .MuiButton-startIcon {
            margin-right: 0.125rem !important;
            margin-left: 0 !important;
          }

          .compact-filter-button .MuiSvgIcon-root {
            font-size: 1rem !important;
          }

          /* Field Labels Compactos */
          .compact-field-label {
            font-family: var(--font-family) !important;
            font-weight: 500 !important;
            font-size: 0.8rem !important;
            color: var(--text-primary) !important;
            margin-bottom: 0.375rem !important;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }

          .compact-field-icon {
            width: 14px;
            height: 14px;
            opacity: 0.6;
          }

          /* Grid Items */
          .compact-grid-item {
            padding: 0 !important;
          }

          /* Date Input Styling */
          .MuiTextField-root input[type="date"] {
            cursor: pointer;
            color-scheme: light;
            font-size: 0.875rem !important;
          }

          .MuiTextField-root input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 0.6;
            cursor: pointer;
            margin-left: 0.5rem;
          }

          /* Responsive Compacto */
          @media (max-width: 768px) {
            .compact-filters-container {
              padding: 0.5rem !important;
            }
            
            .compact-filters-paper {
              padding: 0.75rem !important;
            }

            .compact-header {
              margin-bottom: 0.75rem !important;
              padding-bottom: 0.5rem !important;
            }

            .compact-title {
              font-size: 1rem !important;
            }

            .compact-form-grid {
              gap: 0.5rem !important;
            }
          }

          @media (max-width: 480px) {
            .compact-filters-paper {
              padding: 0.5rem !important;
            }

            .compact-icon-container {
              width: 28px;
              height: 28px;
            }

            .compact-filters-icon {
              font-size: 1rem !important;
            }
          }
        `;
        
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    return (
        <div className="compact-filters-container">
            <Grid item xs={12}>
                <Paper className="compact-filters-paper" elevation={0}>
                    {/* Header Compacto */}
                    <div className="compact-header">
                        <div className="compact-icon-container">
                            <FilterListIcon className="compact-filters-icon" />
                        </div>
                        <h2 className="compact-title">Filtros</h2>
                    </div>

                    {/* Form Grid Compacto */}
                    <Grid container spacing={1} className="compact-form-grid">
                        <Grid item xs={12} sm={5} className="compact-grid-item">
                            <div className="compact-field-label">
                                <svg className="compact-field-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Data Inicial
                            </div>
                            <TextField
                                fullWidth
                                name="dateStart"
                                variant="outlined"
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                size="small"
                                InputProps={{
                                    disableUnderline: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={5} className="compact-grid-item">
                            <div className="compact-field-label">
                                <svg className="compact-field-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Data Final
                            </div>
                            <TextField
                                fullWidth
                                name="dateEnd"
                                variant="outlined"
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                size="small"
                                InputProps={{
                                    disableUnderline: true
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2} className="compact-grid-item">
                            <div className="compact-field-label" style={{ opacity: 0 }}>
                                Ação
                            </div>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<FilterListIcon />}
                                className="compact-filter-button"
                                onClick={() => {
                                    setQueueTicket(queues);
                                    setDateStartTicket(dateStart);
                                    setDateEndTicket(dateEnd);
                                    setFetchDataFilter(!fetchDataFilter)
                                    fetchData(!fetchDataFilter);
                                }}
                            >
                                Aplicar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </div>
    );
};

export default Filters;