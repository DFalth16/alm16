/**
 * Utilidades de validación para formularios
 */

// Validar email (debe tener @ y terminar en .com)
export const validateEmail = (email) => {
    if (!email) return { valid: true, message: '' }; // Opcional

    // Debe contener @ y terminar en .com
    if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) {
        return { valid: false, message: 'El email debe contener @ y terminar en .com' };
    }

    // Verificar que hay texto antes y después del @
    const parts = email.split('@');
    if (parts[0].length === 0 || parts[1].length < 5) {
        return { valid: false, message: 'El email no tiene un formato válido' };
    }

    return { valid: true, message: '' };
};

// Validar teléfono (8 dígitos, empieza con 6, 7 u 8)
export const validatePhone = (phone) => {
    if (!phone) return { valid: true, message: '' }; // Opcional

    // Eliminar espacios, guiones y el prefijo +591 si existe
    let cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+591')) {
        cleaned = cleaned.slice(4);
    } else if (cleaned.startsWith('591')) {
        cleaned = cleaned.slice(3);
    }

    // Debe ser exactamente 8 dígitos
    if (!/^\d{8}$/.test(cleaned)) {
        return { valid: false, message: 'El teléfono debe tener exactamente 8 números' };
    }

    // Debe empezar con 6, 7 u 8
    if (!/^[678]/.test(cleaned)) {
        return { valid: false, message: 'El teléfono debe empezar con 6, 7 u 8' };
    }

    return { valid: true, message: '' };
};

// Validar placa de vehículo (formato boliviano: 1234ABC o ABC-1234)
export const validatePlaca = (placa) => {
    if (!placa) return { valid: false, message: 'La placa es requerida' };
    const cleaned = placa.toUpperCase().replace(/[\s-]/g, '');
    // Formato: números seguidos de letras o viceversa (4-7 caracteres)
    const regex = /^[A-Z0-9]{4,7}$/;
    if (!regex.test(cleaned)) {
        return { valid: false, message: 'La placa debe tener entre 4-7 caracteres alfanuméricos' };
    }
    return { valid: true, message: '' };
};

// Validar nombre (mínimo 2 caracteres, solo letras y espacios)
export const validateName = (name, fieldName = 'nombre') => {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: `El ${fieldName} es requerido` };
    }
    if (name.trim().length < 2) {
        return { valid: false, message: `El ${fieldName} debe tener al menos 2 caracteres` };
    }
    if (name.trim().length > 100) {
        return { valid: false, message: `El ${fieldName} no puede exceder 100 caracteres` };
    }
    return { valid: true, message: '' };
};

// Validar año de vehículo
export const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year);
    if (!numYear || numYear < 1900 || numYear > currentYear + 1) {
        return { valid: false, message: `El año debe estar entre 1900 y ${currentYear + 1}` };
    }
    return { valid: true, message: '' };
};

// Validar kilometraje
export const validateKilometraje = (km) => {
    const numKm = parseInt(km);
    if (numKm < 0) {
        return { valid: false, message: 'El kilometraje no puede ser negativo' };
    }
    if (numKm > 9999999) {
        return { valid: false, message: 'El kilometraje parece demasiado alto' };
    }
    return { valid: true, message: '' };
};

// Validar campo requerido genérico
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { valid: false, message: `${fieldName} es requerido` };
    }
    return { valid: true, message: '' };
};

// Validador de formulario completo
export const validateForm = (data, rules) => {
    const errors = {};
    let isValid = true;

    for (const [field, validators] of Object.entries(rules)) {
        for (const validator of validators) {
            const result = validator(data[field]);
            if (!result.valid) {
                errors[field] = result.message;
                isValid = false;
                break; // Solo mostrar el primer error por campo
            }
        }
    }

    return { isValid, errors };
};

// Formatear teléfono para mostrar
export const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('591') && cleaned.length === 11) {
        return `+591 ${cleaned.slice(3)}`;
    }
    return phone;
};

// Formatear placa (mayúsculas)
export const formatPlaca = (placa) => {
    if (!placa) return '';
    return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
};
