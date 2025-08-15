-- BASE DE DATOS RENTEXPRESS - VERSIÓN SIMPLE
CREATE DATABASE IF NOT EXISTS car_rental;
USE car_rental;

-- TABLA DE USUARIOS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    type ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE VEHÍCULOS
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    price_per_day DECIMAL(8,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE RESERVAS
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vehicle_id INT,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- DATOS DE EJEMPLO
INSERT INTO users (username, email, password, name, type) VALUES
('admin', 'admin@rentexpress.com', 'admin123', 'Administrador', 'admin');

INSERT INTO users (username, email, password, name, phone) VALUES
('juan123', 'juan@email.com', '123456', 'Juan Pérez', '809-555-1234'),
('maria456', 'maria@email.com', '123456', 'María García', '809-555-5678');

INSERT INTO vehicles (brand, model, year, color, price_per_day, image) VALUES
('Toyota', 'Corolla', 2022, 'Blanco', 2500.00, 'images/corolla.webp'),
('Honda', 'Civic', 2023, 'Gris', 2800.00, 'images/civic.jpg'),
('Nissan', 'Sentra', 2021, 'Negro', 2400.00, 'images/sentra.jpg'),
('Hyundai', 'Elantra', 2022, 'Azul', 2600.00, 'images/elantra.jpg'),
('Toyota', 'RAV4', 2023, 'Rojo', 4500.00, 'images/rav4.jpg');

INSERT INTO rentals (user_id, vehicle_id, pickup_date, return_date, total_amount, status) VALUES
(2, 1, '2025-08-15', '2025-08-18', 7500.00, 'confirmed');