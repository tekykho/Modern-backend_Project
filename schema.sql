-- SQL Schema for Logistic Company

CREATE DATABASE IF NOT EXISTS logistic;
USE logistic;

-- 1. Create Strong Entities (No dependencies)

CREATE TABLE Industry_Categories (
    category_id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (category_id)
);

CREATE TABLE Departments (
    department_id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (department_id)
);

CREATE TABLE Shipping_Routes (
    route_id INT UNSIGNED AUTO_INCREMENT,
    origin_hub VARCHAR(150) NOT NULL,
    destination_hub VARCHAR(150) NOT NULL,
    shipping_date DATETIME NOT NULL,
    shipment_day INT UNSIGNED NOT NULL,
    PRIMARY KEY (route_id)
);

CREATE TABLE Fleet_Vehicles (
    vehicle_id INT UNSIGNED AUTO_INCREMENT,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    model_type VARCHAR(100) NOT NULL,
    remarks TEXT,
    PRIMARY KEY (vehicle_id)
);


-- 2. Create Dependent Entities (Contain single foreign keys)

CREATE TABLE Employees (
    employee_id INT UNSIGNED AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    joint_date DATE NOT NULL,
    PRIMARY KEY (employee_id),
    FOREIGN KEY (department_id) REFERENCES DEPARTMENTS(department_id)
);

CREATE TABLE Clients (
    client_id INT UNSIGNED AUTO_INCREMENT,
    category_id INT UNSIGNED NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    joint_date DATE NOT NULL,
    employee_id INT UNSIGNED NULL, 
    PRIMARY KEY (client_id),
    FOREIGN KEY (category_id) REFERENCES INDUSTRY_CATEGORIES(category_id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL
);


-- 3. Create Join/Junction Tables (Many-to-Many relationships)

CREATE TABLE Client_Route (
    client_id INT UNSIGNED,
    route_id INT UNSIGNED,
    PRIMARY KEY (client_id, route_id),
    FOREIGN KEY (client_id) REFERENCES CLIENTS(client_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES SHIPPING_ROUTES(route_id) ON DELETE CASCADE
);

CREATE TABLE Employee_Vehicle (
    employee_id INT UNSIGNED,
    vehicle_id INT UNSIGNED,
    PRIMARY KEY (employee_id, vehicle_id),
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES FLEET_VEHICLES(vehicle_id) ON DELETE CASCADE
);