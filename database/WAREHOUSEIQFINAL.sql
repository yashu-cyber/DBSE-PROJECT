CREATE DATABASE warehouseiq_final;
USE warehouseiq_final;
USE warehouseiq_final;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Stores supplier and vendor information
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    lead_time_days INT NOT NULL,
    last_contact_date DATE
);
DESCRIBE suppliers;
-- Stores the main product catalogue
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    minimum_stock INT NOT NULL,
    supplier_id INT NOT NULL,

    -- Connects each product to its supplier
    FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
);
-- Stores warehouse location, bin and capacity information
CREATE TABLE warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    bin_code VARCHAR(50) NOT NULL,
    capacity INT NOT NULL
);
-- Stores the current stock of each product in each warehouse
CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,

    -- Product whose stock is being stored
    product_id INT NOT NULL,

    -- Warehouse where the product is stored
    warehouse_id INT NOT NULL,

    -- Physical bin/location inside the warehouse
    bin_location VARCHAR(50) NOT NULL,

    -- Stock currently available for use or dispatch
    available_stock INT NOT NULL DEFAULT 0,

    -- Stock already reserved for orders
    reserved_stock INT NOT NULL DEFAULT 0,

    -- Automatically updates when the inventory record changes
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Connects inventory to the product
    FOREIGN KEY (product_id)
        REFERENCES products(product_id),

    -- Connects inventory to the warehouse
    FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id),

    -- Same product cannot have two inventory records
    -- in the same warehouse
    UNIQUE (product_id, warehouse_id),

    -- Stock quantities cannot be negative
    CHECK (available_stock >= 0),
    CHECK (reserved_stock >= 0)
);
-- Records every stock IN and stock OUT transaction
CREATE TABLE stock_movements (
    movement_id INT PRIMARY KEY AUTO_INCREMENT,

    -- Product involved in the movement
    product_id INT NOT NULL,

    -- Warehouse where the movement happened
    warehouse_id INT NOT NULL,

    -- Employee/Admin who performed the movement
    user_id INT NOT NULL,

    -- Type of stock movement
    movement_type ENUM('IN', 'OUT') NOT NULL,

    -- Number of units moved
    quantity INT NOT NULL,

    -- Purchase order or sales order reference
    reference_number VARCHAR(50) NOT NULL,

    -- Reason for the movement
    reason VARCHAR(255),

    -- Current status of the transaction
    status ENUM('Completed', 'Pending', 'Cancelled')
        DEFAULT 'Completed',

    -- Automatically records when the movement occurred
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Connects movement to the product
    FOREIGN KEY (product_id)
        REFERENCES products(product_id),

    -- Connects movement to the warehouse
    FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(warehouse_id),

    -- Connects movement to the user who performed it
    FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    -- Quantity must always be positive
    CHECK (quantity > 0)
);
-- Adds the users who can access and operate WarehouseIQ
INSERT INTO users
(full_name, username, password, role)
VALUES
('Arjun Mehta', 'admin', 'admin123', 'Admin'),
('Rahul Sharma', 'rahul', 'rahul123', 'Employee'),
('Priya Nair', 'priya', 'priya123', 'Employee'),
('Karan Reddy', 'karan', 'karan123', 'Employee');
-- Adds suppliers that provide products to WarehouseIQ
INSERT INTO suppliers
(supplier_name, contact_person, phone, email, address,
 lead_time_days, last_contact_date)
VALUES
('TechSource India', 'Ravi Kumar', '9876543210',
 'ravi@techsource.example', 'Banjara Hills, Hyderabad',
 5, '2026-08-28'),

('Global Electronics', 'Anita Sharma', '9876543211',
 'anita@globalelectronics.example', 'Whitefield, Bengaluru',
 7, '2026-08-27'),

('Prime Office Supplies', 'Vikram Rao', '9876543212',
 'vikram@primeoffice.example', 'Guindy, Chennai',
 4, '2026-08-25'),

('Smart Devices India', 'Neha Singh', '9876543213',
 'neha@smartdevices.example', 'Andheri East, Mumbai',
 8, '2026-08-29'),

('Warehouse Essentials', 'Amit Patel', '9876543214',
 'amit@warehouseessentials.example', 'Hinjewadi, Pune',
 6, '2026-08-26'),

('PackRight Solutions', 'Suresh Menon', '9876543215',
 'suresh@packright.example', 'Peenya, Bengaluru',
 3, '2026-08-30');
 -- Adds products to the warehouse catalogue
INSERT INTO products
(product_name, sku, category, description, price, minimum_stock, supplier_id)
VALUES
('Wireless Mouse', 'WM-1001', 'Computer Accessories',
 '2.4 GHz wireless optical mouse', 799.00, 20, 1),

('Mechanical Keyboard', 'MK-1002', 'Computer Accessories',
 '87-key mechanical keyboard with USB connection', 2499.00, 15, 1),

('USB-C Hub', 'UH-1003', 'Computer Accessories',
 '7-in-1 USB-C connectivity hub', 1299.00, 15, 2),

('Bluetooth Speaker', 'BS-1004', 'Audio',
 'Portable Bluetooth speaker', 1999.00, 12, 2),

('Office Chair', 'OC-1005', 'Furniture',
 'Adjustable ergonomic office chair', 6499.00, 8, 3),

('Laptop Stand', 'LS-1006', 'Furniture',
 'Adjustable aluminium laptop stand', 1599.00, 10, 3),

('Webcam', 'WC-1007', 'Computer Accessories',
 '1080p USB webcam with microphone', 2299.00, 12, 4),

('Wireless Headset', 'WH-1008', 'Audio',
 'Bluetooth over-ear headset', 2999.00, 10, 4),

('Barcode Scanner', 'BC-1009', 'Warehouse Equipment',
 'USB handheld barcode scanner', 4499.00, 6, 5),

('Packing Tape', 'PT-1010', 'Packaging',
 '48 mm heavy-duty packaging tape', 199.00, 25, 6),

('Thermal Label Printer', 'LP-1011', 'Warehouse Equipment',
 'Direct thermal shipping label printer', 5799.00, 5, 5),

('Shipping Labels', 'SL-1012', 'Packaging',
 '100 x 150 mm adhesive shipping labels', 349.00, 30, 6),

('HDMI Cable', 'HC-1013', 'Cables',
 '2 metre HDMI 2.0 cable', 499.00, 20, 2),

('Power Adapter', 'PA-1014', 'Electronics',
 '65W USB-C laptop power adapter', 2199.00, 10, 1),

('Keyboard Wrist Rest', 'KR-1015', 'Computer Accessories',
 'Memory foam keyboard wrist rest', 699.00, 12, 3),

('Laptop 01', 'WI-1016', 'Computers',
 'Business laptop computer', 86905.00, 8, 1),

('Monitor 01', 'WI-1017', 'Monitors',
 'Professional LED monitor', 9819.00, 28, 2),

('Desktop PC 01', 'WI-1018', 'Computers',
 'Business desktop computer', 53024.00, 12, 3),

('WiFi Router 01', 'WI-1019', 'Networking',
 'Dual-band wireless router', 3628.00, 9, 4),

('Network Switch 01', 'WI-1020', 'Networking',
 'Managed gigabit network switch', 15566.00, 8, 5),

('Ethernet Cable 01', 'WI-1021', 'Cables',
 'Cat6 Ethernet networking cable', 1635.00, 28, 6),

('SSD 01', 'WI-1022', 'Storage',
 'High-speed solid state drive', 12435.00, 7, 1),

('Hard Drive 01', 'WI-1023', 'Storage',
 'High-capacity internal hard drive', 14174.00, 18, 2),

('RAM Module 01', 'WI-1024', 'Computer Components',
 'DDR4 desktop memory module', 3020.00, 5, 3),

('Graphics Card 01', 'WI-1025', 'Computer Components',
 'Dedicated graphics processing unit', 37280.00, 11, 4),

('Power Supply 01', 'WI-1026', 'Computer Components',
 '80 Plus certified power supply', 8311.00, 21, 5),

('UPS 01', 'WI-1027', 'Power Equipment',
 'Uninterruptible power supply', 5369.00, 22, 6),

('Laser Printer 01', 'WI-1028', 'Office Equipment',
 'Monochrome laser printer', 15515.00, 27, 1),

('Document Scanner 01', 'WI-1029', 'Office Equipment',
 'High-speed document scanner', 28295.00, 27, 2),

('Projector 01', 'WI-1030', 'Office Equipment',
 'Full HD business projector', 60713.00, 18, 3),

('Conference Camera 01', 'WI-1031', 'Audio Visual',
 'USB conference room camera', 14223.00, 19, 4),

('Desk 01', 'WI-1032', 'Furniture',
 'Office workstation desk', 26309.00, 13, 5),

('Filing Cabinet 01', 'WI-1033', 'Furniture',
 'Steel office filing cabinet', 5106.00, 29, 6),

('Visitor Chair 01', 'WI-1034', 'Furniture',
 'Padded visitor chair', 3807.00, 27, 1),

('Storage Rack 01', 'WI-1035', 'Warehouse Equipment',
 'Heavy-duty warehouse storage rack', 39696.00, 15, 2),

('Pallet Truck 01', 'WI-1036', 'Warehouse Equipment',
 'Manual warehouse pallet truck', 27105.00, 9, 3),

('Safety Helmet 01', 'WI-1037', 'Safety Equipment',
 'Industrial safety helmet', 890.00, 35, 4),

('Safety Vest 01', 'WI-1038', 'Safety Equipment',
 'High-visibility safety vest', 1081.00, 15, 5),

('Safety Gloves 01', 'WI-1039', 'Safety Equipment',
 'Industrial protective gloves', 254.00, 7, 6),

('Stretch Film 01', 'WI-1040', 'Packaging',
 'Industrial pallet stretch film', 2356.00, 8, 1),

('Bubble Wrap 01', 'WI-1041', 'Packaging',
 'Protective bubble wrap roll', 1970.00, 32, 2),

('Corrugated Box 01', 'WI-1042', 'Packaging',
 'Heavy-duty corrugated shipping box', 128.00, 24, 3),

('Zip Ties 01', 'WI-1043', 'Packaging',
 'Nylon cable and packaging ties', 420.00, 30, 4),

('USB Flash Drive 01', 'WI-1044', 'Storage',
 'USB 3.2 portable flash drive', 588.00, 28, 5),

('External SSD 01', 'WI-1045', 'Storage',
 'Portable external solid state drive', 14027.00, 22, 6),

('Power Strip 01', 'WI-1046', 'Electronics',
 'Surge-protected power strip', 1211.00, 34, 1),

('Extension Cable 01', 'WI-1047', 'Electronics',
 'Heavy-duty electrical extension cable', 1275.00, 7, 2),

('Smartphone 01', 'WI-1048', 'Mobile Devices',
 'Business smartphone', 48178.00, 14, 3),

('Tablet 01', 'WI-1049', 'Mobile Devices',
 'Business productivity tablet', 55198.00, 24, 4),

('Tablet Stand 01', 'WI-1050', 'Accessories',
 'Adjustable tablet desk stand', 2181.00, 23, 5),

('Wireless Presenter 01', 'WI-1051', 'Presentation',
 'Wireless presentation clicker', 1687.00, 27, 6),

('Headphones 01', 'WI-1052', 'Audio',
 'Over-ear wired headphones', 1769.00, 6, 1),

('Microphone 01', 'WI-1053', 'Audio Visual',
 'USB condenser microphone', 7217.00, 12, 2),

('LED Light 01', 'WI-1054', 'Electronics',
 'Energy-efficient LED work light', 3766.00, 14, 3),

('Handheld Terminal 01', 'WI-1055', 'Warehouse Equipment',
 'Android handheld warehouse terminal', 23229.00, 32, 4),

('RFID Reader 01', 'WI-1056', 'Warehouse Equipment',
 'UHF RFID inventory reader', 60512.00, 32, 5),

('RFID Tag Pack 01', 'WI-1057', 'Warehouse Equipment',
 'Pack of UHF RFID inventory tags', 2027.00, 17, 6),

('Barcode Labels 01', 'WI-1058', 'Packaging',
 'Thermal barcode label roll', 1538.00, 19, 1),

('Label Cutter 01', 'WI-1059', 'Warehouse Equipment',
 'Industrial label cutter', 7707.00, 31, 2),

('Packing Scale 01', 'WI-1060', 'Warehouse Equipment',
 'Digital parcel weighing scale', 9477.00, 10, 3),

('Digital Caliper 01', 'WI-1061', 'Tools',
 'Precision digital measuring caliper', 3932.00, 16, 4),

('Tool Kit 01', 'WI-1062', 'Tools',
 'Professional maintenance tool kit', 5932.00, 26, 5),

('Cleaning Kit 01', 'WI-1063', 'Warehouse Supplies',
 'Warehouse equipment cleaning kit', 1593.00, 27, 6),

('Floor Marking Tape 01', 'WI-1064', 'Warehouse Supplies',
 'Heavy-duty warehouse floor tape', 3499.00, 25, 1),

('Plastic Storage Bin 01', 'WI-1065', 'Warehouse Supplies',
 'Stackable plastic storage bin', 892.00, 24, 2),

('Steel Storage Bin 01', 'WI-1066', 'Warehouse Supplies',
 'Durable steel parts storage bin', 6401.00, 10, 3),

('Laptop 02', 'WI-1067', 'Computers',
 'Business laptop computer', 80005.00, 28, 4),

('Monitor 02', 'WI-1068', 'Monitors',
 'Professional LED monitor', 17021.00, 10, 5),

('Desktop PC 02', 'WI-1069', 'Computers',
 'Business desktop computer', 65294.00, 17, 6),

('WiFi Router 02', 'WI-1070', 'Networking',
 'Dual-band wireless router', 4011.00, 34, 1),

('Network Switch 02', 'WI-1071', 'Networking',
 'Managed gigabit network switch', 13985.00, 27, 2),

('Ethernet Cable 02', 'WI-1072', 'Cables',
 'Cat6 Ethernet networking cable', 1390.00, 12, 3),

('SSD 02', 'WI-1073', 'Storage',
 'High-speed solid state drive', 8813.00, 31, 4),

('Hard Drive 02', 'WI-1074', 'Storage',
 'High-capacity internal hard drive', 5416.00, 12, 5),

('RAM Module 02', 'WI-1075', 'Computer Components',
 'DDR4 desktop memory module', 3025.00, 30, 6),

('Graphics Card 02', 'WI-1076', 'Computer Components',
 'Dedicated graphics processing unit', 66347.00, 17, 1),

('Power Supply 02', 'WI-1077', 'Computer Components',
 '80 Plus certified power supply', 8886.00, 7, 2),

('UPS 02', 'WI-1078', 'Power Equipment',
 'Uninterruptible power supply', 11413.00, 34, 3),

('Laser Printer 02', 'WI-1079', 'Office Equipment',
 'Monochrome laser printer', 27585.00, 33, 4),

('Document Scanner 02', 'WI-1080', 'Office Equipment',
 'High-speed document scanner', 17311.00, 11, 5),

('Projector 02', 'WI-1081', 'Office Equipment',
 'Full HD business projector', 67954.00, 20, 6),

('Conference Camera 02', 'WI-1082', 'Audio Visual',
 'USB conference room camera', 19964.00, 33, 1),

('Desk 02', 'WI-1083', 'Furniture',
 'Office workstation desk', 22035.00, 9, 2),

('Filing Cabinet 02', 'WI-1084', 'Furniture',
 'Steel office filing cabinet', 9339.00, 9, 3),

('Visitor Chair 02', 'WI-1085', 'Furniture',
 'Padded visitor chair', 4520.00, 28, 4),

('Storage Rack 02', 'WI-1086', 'Warehouse Equipment',
 'Heavy-duty warehouse storage rack', 48789.00, 22, 5),

('Pallet Truck 02', 'WI-1087', 'Warehouse Equipment',
 'Manual warehouse pallet truck', 26609.00, 28, 6),

('Safety Helmet 02', 'WI-1088', 'Safety Equipment',
 'Industrial safety helmet', 1647.00, 18, 1),

('Safety Vest 02', 'WI-1089', 'Safety Equipment',
 'High-visibility safety vest', 897.00, 17, 2),

('Safety Gloves 02', 'WI-1090', 'Safety Equipment',
 'Industrial protective gloves', 520.00, 12, 3),

('Stretch Film 02', 'WI-1091', 'Packaging',
 'Industrial pallet stretch film', 1366.00, 21, 4),

('Bubble Wrap 02', 'WI-1092', 'Packaging',
 'Protective bubble wrap roll', 2521.00, 7, 5),

('Corrugated Box 02', 'WI-1093', 'Packaging',
 'Heavy-duty corrugated shipping box', 233.00, 6, 6),

('Zip Ties 02', 'WI-1094', 'Packaging',
 'Nylon cable and packaging ties', 262.00, 9, 1),

('USB Flash Drive 02', 'WI-1095', 'Storage',
 'USB 3.2 portable flash drive', 1785.00, 10, 2),

('External SSD 02', 'WI-1096', 'Storage',
 'Portable external solid state drive', 17649.00, 18, 3),

('Power Strip 02', 'WI-1097', 'Electronics',
 'Surge-protected power strip', 3142.00, 7, 4),

('Extension Cable 02', 'WI-1098', 'Electronics',
 'Heavy-duty electrical extension cable', 1288.00, 17, 5),

('Smartphone 02', 'WI-1099', 'Mobile Devices',
 'Business smartphone', 51052.00, 19, 6),

('Tablet 02', 'WI-1100', 'Mobile Devices',
 'Business productivity tablet', 48676.00, 13, 1),

('Tablet Stand 02', 'WI-1101', 'Accessories',
 'Adjustable tablet desk stand', 747.00, 26, 2),

('Wireless Presenter 02', 'WI-1102', 'Presentation',
 'Wireless presentation clicker', 1369.00, 26, 3),

('Headphones 02', 'WI-1103', 'Audio',
 'Over-ear wired headphones', 5598.00, 29, 4),

('Microphone 02', 'WI-1104', 'Audio Visual',
 'USB condenser microphone', 3985.00, 29, 5),

('LED Light 02', 'WI-1105', 'Electronics',
 'Energy-efficient LED work light', 3225.00, 15, 6),

('Handheld Terminal 02', 'WI-1106', 'Warehouse Equipment',
 'Android handheld warehouse terminal', 25310.00, 14, 1),

('RFID Reader 02', 'WI-1107', 'Warehouse Equipment',
 'UHF RFID inventory reader', 86985.00, 10, 2),

('RFID Tag Pack 02', 'WI-1108', 'Warehouse Equipment',
 'Pack of UHF RFID inventory tags', 4916.00, 5, 3),

('Barcode Labels 02', 'WI-1109', 'Packaging',
 'Thermal barcode label roll', 1478.00, 21, 4),

('Label Cutter 02', 'WI-1110', 'Warehouse Equipment',
 'Industrial label cutter', 8741.00, 10, 5),

('Packing Scale 02', 'WI-1111', 'Warehouse Equipment',
 'Digital parcel weighing scale', 11817.00, 34, 6),

('Digital Caliper 02', 'WI-1112', 'Tools',
 'Precision digital measuring caliper', 1771.00, 32, 1),

('Tool Kit 02', 'WI-1113', 'Tools',
 'Professional maintenance tool kit', 12744.00, 14, 2),

('Cleaning Kit 02', 'WI-1114', 'Warehouse Supplies',
 'Warehouse equipment cleaning kit', 2579.00, 24, 3),

('Floor Marking Tape 02', 'WI-1115', 'Warehouse Supplies',
 'Heavy-duty warehouse floor tape', 1514.00, 9, 4);
 
 -- Adds the warehouses managed by WarehouseIQ
INSERT INTO warehouses
(warehouse_name, location, bin_code, capacity)
VALUES
('Hyderabad Central Warehouse', 'Hyderabad', 'HYD-A01', 5000),

('Bengaluru Distribution Center', 'Bengaluru', 'BLR-B02', 4000),

('Chennai Storage Hub', 'Chennai', 'CHE-C03', 3500),

('Pune Regional Warehouse', 'Pune', 'PUN-D04', 3000);
-- Adds current stock for products across different warehouses
INSERT INTO inventory
(product_id, warehouse_id, bin_location, available_stock, reserved_stock)
VALUES

-- Hyderabad Central Warehouse
(1, 1, 'A01-01', 120, 15),
(2, 1, 'A01-02', 75, 10),
(3, 1, 'A01-03', 45, 8),
(4, 1, 'A01-04', 65, 12),
(5, 1, 'A01-05', 18, 3),
(6, 1, 'A01-06', 35, 5),
(7, 1, 'A01-07', 50, 7),
(9, 1, 'A01-09', 14, 2),
(10, 1, 'A01-10', 60, 10),
(11, 1, 'A01-11', 8, 1),

-- Bengaluru Distribution Center
(1, 2, 'B02-01', 80, 10),
(3, 2, 'B02-03', 35, 5),
(4, 2, 'B02-04', 40, 6),
(7, 2, 'B02-07', 25, 5),
(8, 2, 'B02-08', 48, 8),
(9, 2, 'B02-09', 9, 2),
(10, 2, 'B02-10', 22, 4),
(12, 2, 'B02-12', 35, 5),

-- Chennai Storage Hub
(2, 3, 'C03-02', 55, 8),
(4, 3, 'C03-04', 30, 5),
(5, 3, 'C03-05', 9, 2),
(6, 3, 'C03-06', 24, 4),
(8, 3, 'C03-08', 18, 3),
(9, 3, 'C03-09', 5, 1),
(10, 3, 'C03-10', 14, 3),
(13, 3, 'C03-13', 40, 6),

-- Pune Regional Warehouse
(1, 4, 'D04-01', 45, 5),
(3, 4, 'D04-03', 28, 4),
(6, 4, 'D04-06', 20, 3),
(7, 4, 'D04-07', 15, 2),
(11, 4, 'D04-11', 6, 1),
(14, 4, 'D04-14', 12, 2),
(15, 4, 'D04-15', 10, 2),

-- Additional products across the warehouse network
(16, 1, 'A01-10', 69.0, 6.0),
(17, 2, 'B02-11', 70, 7),
(18, 3, 'C03-12', 32, 3),
(19, 4, 'D04-13', 235, 23),
(20, 1, 'A01-14', 50, 5),
(21, 2, 'B02-15', 182, 18),
(22, 3, 'C03-16', 112, 11),
(23, 4, 'D04-17', 52, 5),
(24, 1, 'A01-18', 128, 12),
(25, 2, 'B02-19', 48, 4),
(26, 3, 'C03-20', 89, 8),
(27, 4, 'D04-21', 80, 8),
(28, 1, 'A01-22', 57, 5),
(29, 2, 'B02-23', 40, 4),
(30, 3, 'C03-24', 33, 3),
(31, 4, 'D04-25', 60, 6),
(32, 1, 'A01-26', 30, 3),
(33, 2, 'B02-27', 2269.0, 226.0),
(34, 3, 'C03-28', 117, 11),
(35, 4, 'D04-29', 59, 5),
(36, 1, 'A01-30', 33, 3),
(37, 2, 'B02-31', 315, 31),
(38, 3, 'C03-32', 221, 22),
(39, 4, 'D04-33', 531, 53),
(40, 1, 'A01-34', 142, 14),
(41, 2, 'B02-35', 167, 16),
(42, 3, 'C03-36', 520, 52),
(43, 4, 'D04-37', 560, 56),
(44, 1, 'A01-38', 466, 46),
(45, 2, 'B02-39', 77, 7),
(46, 3, 'C03-40', 238, 23),
(47, 4, 'D04-41', 151, 15),
(48, 1, 'A01-42', 70, 7),
(49, 2, 'B02-43', 24, 2),
(50, 3, 'C03-44', 202, 20),
(51, 4, 'D04-45', 195, 19),
(52, 1, 'A01-46', 212, 21),
(53, 2, 'B02-47', 116, 11),
(54, 3, 'C03-48', 215, 21),
(55, 4, 'D04-49', 32, 3),
(56, 1, 'A01-50', 22, 2),
(57, 2, 'B02-51', 157, 15),
(58, 3, 'C03-52', 116, 11),
(59, 4, 'D04-53', 93, 9),
(60, 1, 'A01-54', 52, 5),
(61, 2, 'B02-55', 250, 25),
(62, 3, 'C03-56', 120, 12),
(63, 4, 'D04-57', 158, 15),
(64, 1, 'A01-58', 250, 25),
(65, 2, 'B02-59', 362, 36),
(66, 3, 'C03-60', 50, 5),
(67, 4, 'D04-61', 17, 1),
(68, 1, 'A01-62', 130, 13),
(69, 2, 'B02-63', 16, 1),
(70, 3, 'C03-64', 158, 15),
(71, 4, 'D04-65', 58, 5),
(72, 1, 'A01-66', 108, 10),
(73, 2, 'B02-67', 92, 9),
(74, 3, 'C03-68', 59, 5),
(75, 4, 'D04-69', 231, 23),
(76, 1, 'A01-70', 22, 2),
(77, 2, 'B02-71', 85, 8),
(78, 3, 'C03-72', 112, 11),
(79, 4, 'D04-73', 38, 3),
(80, 1, 'A01-74', 119, 11),
(81, 2, 'B02-75', 19, 1),
(82, 3, 'C03-76', 123, 12),
(83, 4, 'D04-77', 61, 6),
(84, 1, 'A01-78', 110, 11),
(85, 2, 'B02-79', 162, 16),
(86, 3, 'C03-80', 55, 5),
(87, 4, 'D04-81', 51, 5),
(88, 1, 'A01-82', 148, 14),
(89, 2, 'B02-83', 298, 29),
(90, 3, 'C03-84', 299, 29),
(91, 4, 'D04-85', 210, 21),
(92, 1, 'A01-86', 190, 19),
(93, 2, 'B02-87', 466, 46),
(94, 3, 'C03-88', 460, 46),
(95, 4, 'D04-89', 219, 21),
(96, 1, 'A01-90', 56, 5),
(97, 2, 'B02-91', 125, 12),
(98, 3, 'C03-92', 115, 11),
(99, 4, 'D04-93', 27, 2),
(100, 1, 'A01-94', 46, 4),
(101, 2, 'B02-95', 305, 30),
(102, 3, 'C03-96', 163, 16),
(103, 4, 'D04-97', 74, 7),
(104, 1, 'A01-98', 148, 14),
(105, 2, 'B02-99', 237, 23),
(106, 3, 'C03-10', 53, 5),
(107, 4, 'D04-11', 19, 1),
(108, 1, 'A01-12', 208, 20),
(109, 2, 'B02-13', 146, 14),
(110, 3, 'C03-14', 85, 8),
(111, 4, 'D04-15', 109, 10),
(112, 1, 'A01-16', 163, 16),
(113, 2, 'B02-17', 59, 5),
(114, 3, 'C03-18', 213, 21),
(115, 4, 'D04-19', 240, 24);
-- Adds the history of stock received and stock dispatched
INSERT INTO stock_movements
(product_id, warehouse_id, user_id, movement_type,
 quantity, reference_number, reason, status, movement_date)
VALUES

-- Hyderabad transactions
(1, 1, 2, 'IN', 100, 'PO-2026-081', 'Supplier delivery', 'Completed', '2026-08-20 09:15:00'),
(2, 1, 2, 'IN', 60, 'PO-2026-082', 'Supplier delivery', 'Completed', '2026-08-20 10:30:00'),
(3, 1, 3, 'IN', 50, 'PO-2026-083', 'New stock received', 'Completed', '2026-08-21 11:10:00'),
(1, 1, 4, 'OUT', 20, 'SO-2026-441', 'Customer dispatch', 'Completed', '2026-08-22 14:20:00'),
(4, 1, 2, 'OUT', 15, 'SO-2026-442', 'Customer dispatch', 'Completed', '2026-08-22 15:05:00'),
(5, 1, 3, 'IN', 20, 'PO-2026-084', 'Supplier delivery', 'Completed', '2026-08-23 09:45:00'),
(9, 1, 4, 'OUT', 5, 'SO-2026-443', 'Equipment issue', 'Completed', '2026-08-24 13:10:00'),
(10, 1, 2, 'IN', 80, 'PO-2026-085', 'Packaging stock received', 'Completed', '2026-08-24 16:00:00'),

-- Bengaluru transactions
(1, 2, 2, 'IN', 70, 'PO-2026-086', 'Supplier delivery', 'Completed', '2026-08-21 10:15:00'),
(3, 2, 3, 'IN', 40, 'PO-2026-087', 'Supplier delivery', 'Completed', '2026-08-22 11:25:00'),
(4, 2, 4, 'IN', 50, 'PO-2026-088', 'New stock received', 'Completed', '2026-08-23 09:30:00'),
(7, 2, 2, 'OUT', 10, 'SO-2026-444', 'Customer dispatch', 'Completed', '2026-08-24 12:15:00'),
(8, 2, 3, 'OUT', 12, 'SO-2026-445', 'Customer dispatch', 'Completed', '2026-08-25 14:40:00'),
(9, 2, 4, 'OUT', 4, 'SO-2026-446', 'Customer dispatch', 'Completed', '2026-08-26 10:20:00'),
(12, 2, 2, 'IN', 50, 'PO-2026-089', 'Packaging stock received', 'Completed', '2026-08-26 15:10:00'),

-- Chennai transactions
(2, 3, 3, 'IN', 60, 'PO-2026-090', 'Supplier delivery', 'Completed', '2026-08-22 09:20:00'),
(4, 3, 4, 'IN', 35, 'PO-2026-091', 'Supplier delivery', 'Completed', '2026-08-23 10:10:00'),
(5, 3, 2, 'OUT', 8, 'SO-2026-447', 'Customer dispatch', 'Completed', '2026-08-24 11:45:00'),
(6, 3, 3, 'IN', 30, 'PO-2026-092', 'New stock received', 'Completed', '2026-08-25 09:50:00'),
(8, 3, 4, 'OUT', 7, 'SO-2026-448', 'Customer dispatch', 'Completed', '2026-08-26 13:30:00'),
(10, 3, 2, 'OUT', 6, 'SO-2026-449', 'Customer dispatch', 'Completed', '2026-08-27 15:20:00'),

-- Pune transactions
(1, 4, 3, 'IN', 50, 'PO-2026-093', 'Regional replenishment', 'Completed', '2026-08-24 10:00:00'),
(3, 4, 4, 'IN', 35, 'PO-2026-094', 'Supplier delivery', 'Completed', '2026-08-25 11:15:00'),
(6, 4, 2, 'OUT', 10, 'SO-2026-450', 'Customer dispatch', 'Completed', '2026-08-26 12:00:00'),
(7, 4, 3, 'IN', 20, 'PO-2026-095', 'New stock received', 'Completed', '2026-08-27 09:40:00'),
(11, 4, 4, 'OUT', 4, 'SO-2026-451', 'Equipment issue', 'Completed', '2026-08-28 14:15:00'),
(14, 4, 2, 'IN', 15, 'PO-2026-096', 'Supplier delivery', 'Completed', '2026-08-29 10:30:00'),
(15, 4, 3, 'OUT', 5, 'SO-2026-452', 'Customer dispatch', 'Completed', '2026-08-29 16:20:00'),

-- Additional stock receipts for the expanded product catalogue
(16, 1, 2, 'IN', 17.0, 'PO-2026-100', 'Supplier delivery', 'Completed', '2026-09-01 09:00:00'),
(17, 2, 3, 'IN', 17, 'PO-2026-101', 'Supplier delivery', 'Completed', '2026-09-02 10:07:00'),
(18, 3, 4, 'IN', 8, 'PO-2026-102', 'Supplier delivery', 'Completed', '2026-09-03 11:14:00'),
(19, 4, 2, 'IN', 58, 'PO-2026-103', 'Supplier delivery', 'Completed', '2026-09-04 12:21:00'),
(20, 1, 3, 'IN', 12, 'PO-2026-104', 'Supplier delivery', 'Completed', '2026-09-05 13:28:00'),
(21, 2, 4, 'IN', 45, 'PO-2026-105', 'Supplier delivery', 'Completed', '2026-09-06 14:35:00'),
(22, 3, 2, 'IN', 28, 'PO-2026-106', 'Supplier delivery', 'Completed', '2026-09-07 15:42:00'),
(23, 4, 3, 'IN', 13, 'PO-2026-107', 'Supplier delivery', 'Completed', '2026-09-08 16:49:00'),
(24, 1, 4, 'IN', 32, 'PO-2026-108', 'Supplier delivery', 'Completed', '2026-09-09 09:56:00'),
(25, 2, 2, 'IN', 12, 'PO-2026-109', 'Supplier delivery', 'Completed', '2026-09-10 10:03:00'),
(26, 3, 3, 'IN', 22, 'PO-2026-110', 'Supplier delivery', 'Completed', '2026-09-01 11:10:00'),
(27, 4, 4, 'IN', 20, 'PO-2026-111', 'Supplier delivery', 'Completed', '2026-09-02 12:17:00'),
(28, 1, 2, 'IN', 14, 'PO-2026-112', 'Supplier delivery', 'Completed', '2026-09-03 13:24:00'),
(29, 2, 3, 'IN', 10, 'PO-2026-113', 'Supplier delivery', 'Completed', '2026-09-04 14:31:00'),
(30, 3, 4, 'IN', 8, 'PO-2026-114', 'Supplier delivery', 'Completed', '2026-09-05 15:38:00'),
(31, 4, 2, 'IN', 15, 'PO-2026-115', 'Supplier delivery', 'Completed', '2026-09-06 16:45:00'),
(32, 1, 3, 'IN', 7, 'PO-2026-116', 'Supplier delivery', 'Completed', '2026-09-07 09:52:00'),
(33, 2, 4, 'IN', 567.0, 'PO-2026-117', 'Supplier delivery', 'Completed', '2026-09-08 10:59:00'),
(34, 3, 2, 'IN', 29, 'PO-2026-118', 'Supplier delivery', 'Completed', '2026-09-09 11:06:00'),
(35, 4, 3, 'IN', 14, 'PO-2026-119', 'Supplier delivery', 'Completed', '2026-09-10 12:13:00');
USE warehouseiq_final;

SELECT * FROM users;
SELECT * FROM suppliers;
SELECT * FROM products;
SELECT * FROM warehouses;
SELECT * FROM inventory;
SELECT * FROM stock_movements;
-- Finds products whose available stock has reached the minimum level
SELECT
    p.product_name,
    p.sku,
    p.minimum_stock,
    i.available_stock,
    w.warehouse_name
FROM inventory i
JOIN products p
    ON i.product_id = p.product_id
JOIN warehouses w
    ON i.warehouse_id = w.warehouse_id
WHERE i.available_stock <= p.minimum_stock;
-- Shows the complete history of stock movements
SELECT
    sm.movement_id,
    p.product_name,
    w.warehouse_name,
    u.full_name AS performed_by,
    sm.movement_type,
    sm.quantity,
    sm.reference_number,
    sm.reason,
    sm.status,
    sm.movement_date
FROM stock_movements sm
JOIN products p
    ON sm.product_id = p.product_id
JOIN warehouses w
    ON sm.warehouse_id = w.warehouse_id
JOIN users u
    ON sm.user_id = u.user_id
ORDER BY sm.movement_date DESC;
-- Compares total stock received with total stock dispatched
SELECT
    movement_type,
    COUNT(*) AS total_movements,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY movement_type;
-- Shows current available and reserved stock in each warehouse
SELECT
    w.warehouse_name,
    SUM(i.available_stock) AS available_units,
    SUM(i.reserved_stock) AS reserved_units
FROM inventory i
JOIN warehouses w
    ON i.warehouse_id = w.warehouse_id
GROUP BY w.warehouse_id, w.warehouse_name
ORDER BY available_units DESC;
-- Calculates the total value of available inventory in each warehouse
SELECT
    w.warehouse_name,
    SUM(i.available_stock * p.price) AS inventory_value
FROM inventory i
JOIN products p
    ON i.product_id = p.product_id
JOIN warehouses w
    ON i.warehouse_id = w.warehouse_id
GROUP BY w.warehouse_id, w.warehouse_name
ORDER BY inventory_value DESC;
-- Shows which products have been dispatched the most
SELECT
    p.product_name,
    SUM(sm.quantity) AS total_dispatched
FROM stock_movements sm
JOIN products p
    ON sm.product_id = p.product_id
WHERE sm.movement_type = 'OUT'
GROUP BY p.product_id, p.product_name
ORDER BY total_dispatched DESC;




-- Verifies the total value of available inventory
SELECT
    SUM(i.available_stock * p.price) AS total_inventory_value
FROM inventory i
JOIN products p
    ON i.product_id = p.product_id;

-- Expected result: 100000000.00 (₹10 crore)
