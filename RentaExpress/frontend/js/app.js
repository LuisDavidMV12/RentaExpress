// ============================================
// RENTEXPRESS - FRONTEND JAVASCRIPT
// Adaptado para XAMPP/PHP Backend
// ============================================

// Variables globales
let currentUser = null;
let vehicles = [];
let selectedVehicle = null;

// API Base URL - Actualizado para XAMPP
const API_BASE = 'http://localhost/RentaExpress/backend';

// ========================================
// FUNCIONES DE UTILIDAD GLOBALES
// ========================================

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    showAlert(message, 'error');
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showAlert(message, type) {
    // Buscar contenedor de alertas específico de cada página
    let alertsContainer = document.getElementById('login-alerts') || 
                         document.getElementById('register-alerts') || 
                         document.getElementById('alerts') ||
                         document.body;
    
    // Si no encontramos un contenedor específico, crear uno temporal
    if (alertsContainer === document.body) {
        alertsContainer = document.createElement('div');
        alertsContainer.style.cssText = `
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(alertsContainer);
    }
    
    // Limpiar alertas previas solo en contenedores específicos
    if (alertsContainer.id && alertsContainer.id.includes('alerts')) {
        alertsContainer.innerHTML = '';
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        animation: slideIn 0.3s ease-out;
        position: relative;
    `;
    
    // Colores según el tipo
    const alertStyles = {
        success: 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;',
        error: 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;',
        info: 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;',
        warning: 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;'
    };
    
    alertDiv.style.cssText += alertStyles[type] || alertStyles.info;
    
    alertDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; margin-left: 10px;"
                    aria-label="Cerrar alerta">
                ✖
            </button>
        </div>
    `;
    
    alertsContainer.appendChild(alertDiv);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

async function checkSession() {
    // Para versión PHP simple, solo verificar localStorage
    const userSession = localStorage.getItem('currentUser');
    
    if (userSession) {
        try {
            currentUser = JSON.parse(userSession);
            updateNavigation(true);
            
            // Solo actualizar greeting en index.html
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                const greeting = document.getElementById('user-greeting');
                const userName = document.getElementById('user-name');
                if (greeting && userName) {
                    greeting.classList.remove('hidden');
                    userName.textContent = currentUser.name;
                }
            }
            return true;
        } catch (error) {
            localStorage.removeItem('currentUser');
            return false;
        }
    }
    
    updateNavigation(false);
    return false;
}

function updateNavigation(isLoggedIn) {
    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    const userLink = document.getElementById('nav-user');
    const adminLink = document.getElementById('nav-admin');
    const logoutLink = document.getElementById('nav-logout');
    
    if (isLoggedIn && currentUser) {
        if (loginLink) loginLink.classList.add('hidden');
        if (registerLink) registerLink.classList.add('hidden');
        if (userLink) userLink.classList.remove('hidden');
        if (logoutLink) logoutLink.classList.remove('hidden');
        
        if (currentUser.type === 'admin') {
            if (adminLink) adminLink.classList.remove('hidden');
        }
    } else {
        if (loginLink) loginLink.classList.remove('hidden');
        if (registerLink) registerLink.classList.remove('hidden');
        if (userLink) userLink.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
        if (logoutLink) logoutLink.classList.add('hidden');
    }
}

async function logout() {
    try {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateNavigation(false);
        showSuccess('Sesión cerrada exitosamente');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Error during logout:', error);
        showError('Error al cerrar sesión');
    }
}

// ========================================
// FUNCIONES DE VEHÍCULOS
// ========================================

async function loadVehicles() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/vehicles.php`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            vehicles = data.vehicles || [];
            displayVehicles(vehicles);
        } else {
            // Si no hay vehículos, usar datos de prueba
            vehicles = getDemoVehicles();
            displayVehicles(vehicles);
            showAlert('Mostrando vehículos de demostración', 'info');
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        // En caso de error, usar datos de prueba
        vehicles = getDemoVehicles();
        displayVehicles(vehicles);
        showAlert('Error de conexión. Mostrando vehículos de demostración.', 'warning');
    } finally {
        showLoading(false);
    }
}

function displayVehicles(vehicleList) {
    const grid = document.getElementById('vehicles-grid') || document.getElementById('vehicleContainer');
    const noResults = document.getElementById('no-results');
    
    if (!grid) return; // No estamos en index.html
    
    if (vehicleList.length === 0) {
        grid.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    
    grid.innerHTML = vehicleList.map(vehicle => `
        <div class="vehicle-card">
            <div class="vehicle-image">
                ${vehicle.image 
                    ? `<img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}" style="width: 100%; height: 200px; object-fit: cover;" onerror="this.parentElement.innerHTML='<span>📷 Imagen no disponible</span>'">`
                    : `<span style="display: flex; align-items: center; justify-content: center; height: 200px; background: #f0f0f0; color: #666;">📷 Imagen no disponible</span>`
                }
            </div>
            <div class="vehicle-info">
                <h3 class="vehicle-title">${vehicle.brand} ${vehicle.model}</h3>
                <div class="vehicle-price">RD$ ${parseFloat(vehicle.price_per_day || 0).toFixed(2)}/día</div>
                <div class="vehicle-details">
                    <p><strong>Año:</strong> ${vehicle.year}</p>
                    <p><strong>Color:</strong> ${vehicle.color || 'N/A'}</p>
                    <p><strong>Disponible:</strong> ${vehicle.available ? 'Sí' : 'No'}</p>
                </div>
                ${vehicle.available 
                    ? `<button class="btn btn-primary" onclick="selectVehicle(${vehicle.id})" ${!currentUser ? 'disabled title="Inicia sesión para rentar"' : ''}>
                        ${currentUser ? 'Seleccionar' : 'Inicia Sesión para Rentar'}
                       </button>`
                    : `<button class="btn btn-danger" disabled>No Disponible</button>`
                }
            </div>
        </div>
    `).join('');
}

// ========================================
// FUNCIONES DE LOGIN
// ========================================

async function performLogin() {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    
    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    setLoadingState(true);
    
    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar usuario en localStorage
            currentUser = {
                id: Date.now(), // ID temporal
                email: email,
                name: email.split('@')[0], // Nombre temporal del email
                type: data.user_type || 'user'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccess('¡Inicio de sesión exitoso!');
            
            setTimeout(() => {
                window.location.href = data.redirect || 'index.html';
            }, 1500);
            
        } else {
            showError(data.message || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Error durante el login:', error);
        showError('Error de conexión. Verifica tu internet.');
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    const button = document.getElementById('login-btn');
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.textContent = 'Iniciando...';
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        button.textContent = 'Iniciar Sesión';
    }
}

// ========================================
// FUNCIONES DE REGISTRO
// ========================================

async function performRegister() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('password_confirmation')?.value || document.getElementById('confirmPassword')?.value;
    const phone = document.getElementById('phone')?.value.trim();
    const username = document.getElementById('username')?.value.trim();
    
    // Validaciones
    if (!name || !email || !password || !username) {
        showError('Por favor completa todos los campos obligatorios');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    setRegisterLoadingState(true);
    
    try {
        const response = await fetch(`${API_BASE}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                username: username,
                email: email,
                password: password,
                phone: phone
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('¡Registro exitoso! Redirigiendo al login...');
            
            document.getElementById('register-form')?.reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            showError(data.message || 'Error en el registro');
        }
        
    } catch (error) {
        console.error('Error durante el registro:', error);
        showError('Error de conexión. Verifica tu internet.');
    } finally {
        setRegisterLoadingState(false);
    }
}

function setRegisterLoadingState(loading) {
    const button = document.getElementById('register-btn');
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.textContent = 'Registrando...';
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        button.textContent = 'Crear Mi Cuenta';
    }
}

// ========================================
// FUNCIONES DE VEHÍCULOS
// ========================================

function selectVehicle(vehicleId) {
    if (!currentUser) {
        showError('Debes iniciar sesión para seleccionar un vehículo');
        return;
    }
    
    selectedVehicle = vehicles.find(v => v.id == vehicleId);
    if (!selectedVehicle) {
        showError('Vehículo no encontrado');
        return;
    }
    
    // Guardar vehículo seleccionado
    localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));
    showSuccess(`Has seleccionado: ${selectedVehicle.brand} ${selectedVehicle.model}`);
    
    // Aquí puedes agregar lógica adicional como abrir un modal de reserva
    console.log('Vehículo seleccionado:', selectedVehicle);
}

// ========================================
// BÚSQUEDA DE VEHÍCULOS
// ========================================

function searchVehicles(filters) {
    if (!vehicles || vehicles.length === 0) {
        loadVehicles();
        return;
    }
    
    let filteredVehicles = vehicles.filter(vehicle => {
        let matches = true;
        
        if (filters.brand && filters.brand.trim()) {
            matches = matches && vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase().trim());
        }
        
        if (filters.model && filters.model.trim()) {
            matches = matches && vehicle.model.toLowerCase().includes(filters.model.toLowerCase().trim());
        }
        
        if (filters.year && filters.year.trim()) {
            matches = matches && vehicle.year.toString() === filters.year.trim();
        }
        
        if (filters.max_price && filters.max_price.trim()) {
            const maxPrice = parseFloat(filters.max_price);
            if (!isNaN(maxPrice)) {
                matches = matches && parseFloat(vehicle.price_per_day) <= maxPrice;
            }
        }
        
        return matches;
    });
    
    displayVehicles(filteredVehicles);
    
    if (filteredVehicles.length === 0) {
        showAlert('No se encontraron vehículos con los filtros seleccionados', 'info');
    }
}

function clearFilters() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.reset();
        loadVehicles();
    }
}

// ========================================
// DATOS DE DEMOSTRACIÓN
// ========================================

function getDemoVehicles() {
    return [
        {
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            color: 'Blanco',
            price_per_day: 2500.00,
            available: true,
            image: null
        },
        {
            id: 2,
            brand: 'Honda',
            model: 'Civic',
            year: 2023,
            color: 'Gris',
            price_per_day: 2800.00,
            available: true,
            image: null
        },
        {
            id: 3,
            brand: 'Nissan',
            model: 'Sentra',
            year: 2021,
            color: 'Negro',
            price_per_day: 2400.00,
            available: true,
            image: null
        },
        {
            id: 4,
            brand: 'Hyundai',
            model: 'Elantra',
            year: 2022,
            color: 'Azul',
            price_per_day: 2600.00,
            available: false,
            image: null
        },
        {
            id: 5,
            brand: 'Toyota',
            model: 'RAV4',
            year: 2023,
            color: 'Rojo',
            price_per_day: 4500.00,
            available: true,
            image: null
        }
    ];
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión al cargar cualquier página
    checkSession();
    
    // Event listeners específicos por página
    setupPageSpecificListeners();
    
    // Cargar vehículos si estamos en index.html
    if (document.getElementById('vehicles-grid') || document.getElementById('vehicleContainer')) {
        loadVehicles();
    }
    
    // Agregar estilos CSS
    addCustomStyles();
});

function setupPageSpecificListeners() {
    // LOGIN FORM
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await performLogin();
        });
    }
    
    // REGISTER FORM
    const registerForm = document.getElementById('registerForm') || document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await performRegister();
        });
    }
    
    // SEARCH FORM
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const filters = {
                brand: document.getElementById('brand')?.value.trim() || '',
                model: document.getElementById('model')?.value.trim() || '',
                year: document.getElementById('year')?.value || '',
                max_price: document.getElementById('max_price')?.value || ''
            };
            
            searchVehicles(filters);
        });
    }
    
    // LOGOUT BUTTONS
    const logoutBtns = document.querySelectorAll('[onclick*="logout"]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// ========================================
// ESTILOS ADICIONALES
// ========================================

function addCustomStyles() {
    if (document.getElementById('custom-rental-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'custom-rental-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .vehicle-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            background: white;
        }
        
        .vehicle-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .vehicle-image {
            width: 100%;
            height: 200px;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 15px;
            background: #f0f0f0;
        }
        
        .vehicle-title {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .vehicle-price {
            color: #28a745;
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .vehicle-details {
            margin-bottom: 15px;
        }
        
        .vehicle-details p {
            margin: 5px 0;
            color: #666;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background-color: #007bff;
            color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
            background-color: #0056b3;
        }
        
        .btn-primary:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .btn-danger {
            background-color: #dc3545;
            color: white;
        }
        
        .btn-loading {
            position: relative;
            color: transparent;
        }
        
        .btn-loading::after {
            content: "";
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        
        .hidden {
            display: none !important;
        }
        
        #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatPrice(price) {
    return `RD$ ${parseFloat(price).toFixed(2)}`;
}

// Función para mostrar/ocultar contraseña
function togglePassword(fieldId = 'password') {
    const passwordInput = document.getElementById(fieldId);
    const toggleIcon = passwordInput?.parentElement.querySelector('.password-toggle');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁';
        }
    }
}