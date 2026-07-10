
USE logistic;

-- ==========================================
-- 1. INDUSTRY_CATEGORIES (Strong Entity)
-- ==========================================
INSERT INTO Industry_Categories (name) VALUES
('Cold Chain & Pharmaceuticals'),
('Automotive & Heavy Machinery'),
('E-commerce & Retail Logistics');

-- ==========================================
-- 2. DEPARTMENTS (Strong Entity)
-- ==========================================
INSERT INTO Departments (name) VALUES
('Fleet Operations'),
('Route Dispatch & Coordination'),
('Key Account Management');

-- ==========================================
-- 3. SHIPPING_ROUTES (Strong Entity)
-- ==========================================
INSERT INTO Shipping_Routes (origin_hub, destination_hub, shipping_date, shipment_day) VALUES
('Chicago Fulfillment Center', 'New York Logistics Hub', '2026-08-12 06:00:00', 1),
('Los Angeles Port Terminal', 'Dallas Distribution Center', '2026-08-12 14:30:00', 2),
('Seattle Overland Depot', 'Denver Cargo Terminal', '2026-08-13 08:00:00', 1),
('Miami Domestic Terminal', 'Atlanta Sorting Facility', '2026-08-14 11:15:00', 1),
('Houston Distribution Center', 'Phoenix Freight Yard', '2026-08-15 05:00:00', 2),
('Boston Transit Hub', 'Philadelphia Delivery Center', '2026-08-15 22:00:00', 1);

-- ==========================================
-- 4. FLEET_VEHICLES (Strong Entity)
-- ==========================================
INSERT INTO Fleet_Vehicles (license_plate, model_type, remarks) VALUES
('10-XYZ-99', '53ft Refrigerated Semi-Trailer', 'Maintained at 4°C for pharma cargo'),
('22-ABC-44', 'Heavy-Duty Flatbed Truck', 'Equipped with oversized load rigging'),
('55-LMN-11', 'Standard Dry Van Trailer', 'Routine maintenance passed last week'),
('77-PQR-88', 'Step-Deck Specialized Trailer', 'Used primarily for industrial machinery'),
('88-DEF-22', 'High-Cube Express Box Truck', 'Optimized for local last-mile deliveries'),
('99-GHI-33', 'Insulated Thermo Container Van', 'Calibrated backup cooling unit active');

-- ==========================================
-- 5. EMPLOYEES (Dependent Entity)
-- ==========================================
INSERT INTO Employees (first_name, last_name, department_id, joint_date) VALUES
('Daniel', 'Hughes', 1, '2021-03-15'), -- Fleet Operations
('Rebecca', 'Morgan', 2, '2022-06-01'), -- Route Dispatch
('Thomas', 'Ellis', 3, '2023-01-10');   -- Key Accounts

-- ==========================================
-- 6. CLIENTS (Dependent Entity)
-- ==========================================
INSERT INTO Clients (category_id, company_name, contact_email, first_name, last_name, joint_date, employee_id) VALUES
(1, 'BioPharma Express Care', 'logistics@biopharma.com', 'John', 'Doe', '2024-02-15', 1),
(1, 'Apex Med Distribution', 'supply@apexmed.com', 'Alice', 'Smith', '2024-05-20', 1),
(2, 'Titan Heavy Equipment', 'shipping@titaneq.com', 'Robert', 'Miller', '2023-11-01', 2),
(2, 'Velocity Motors Global', 'freight@velocitymotors.com', 'Emma', 'Davis', '2025-01-14', 2),
(3, 'OmniRetail Online Solutions', 'delivery@omniretail.com', 'Michael', 'Brown', '2024-08-19', 3),
(3, 'UrbanCart Groceries', 'fulfillment@urbancart.com', 'Sarah', 'Wilson', '2025-03-22', 3);

-- ==========================================
-- 7. CLIENT_ROUTE (Join/Junction Table)
-- ==========================================
INSERT INTO Client_Route (client_id, route_id) VALUES
-- BioPharma Express Care
(1, 1),
(1, 3),
(1, 5),

-- Apex Med Distribution
(2, 2),
(2, 4),

-- Titan Heavy Equipment
(3, 3),
(3, 6),

-- Velocity Motors Global
(4, 1),
(4, 2),
(4, 5),

-- OmniRetail Online Solutions
(5, 3),
(5, 5),

-- UrbanCart Groceries
(6, 1),
(6, 4),
(6, 6);

-- ==========================================
-- 8. EMPLOYEE_VEHICLE (Join/Junction Table)
-- ==========================================
INSERT INTO Employee_Vehicle (employee_id, vehicle_id) VALUES
-- Daniel Hughes (Cleared for Cold Chain vehicles)
(1, 1),
(1, 3),
(1, 5),

-- Rebecca Morgan (Cleared for Heavy / Machinery vehicles)
(2, 2),
(2, 4),
(2, 6),

-- Thomas Ellis (Cleared for Standard/Overland routes vehicles)
(3, 1),
(3, 3),
(3, 6);