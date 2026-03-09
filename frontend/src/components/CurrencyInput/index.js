import React from 'react'
import PropTypes from 'prop-types'
import { TextField, InputAdornment } from '@material-ui/core'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'

const CurrencyInput = ({ value, onChange, label, required, error, helperText, ...props }) => {
    const formatCurrency = (value) => {
        if (!value) return '0,00'
        
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '')
        
        // Converte para centavos
        const cents = parseInt(numbers) || 0
        
        // Formato numérico USD (en-US: coma miles, punto decimal)
        return (cents / 100).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const handleChange = (e) => {
        const newValue = e.target.value.replace(/\D/g, '')
        onChange(newValue)
    }

    const displayValue = formatCurrency(value)

    return (
        <TextField
            {...props}
            label={label}
            value={displayValue}
            onChange={handleChange}
            required={required}
            error={error}
            helperText={helperText}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AttachMoneyIcon />
                    </InputAdornment>
                ),
            }}
            inputProps={{
                style: { textAlign: 'right' }
            }}
        />
    )
}

CurrencyInput.defaultProps = {
    required: false,
    error: false,
    helperText: ''
}

CurrencyInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.string
}

export default CurrencyInput
