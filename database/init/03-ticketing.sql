USE ticketing_db;

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NOT NULL,
  route_id VARCHAR(50) NOT NULL,
  vehicle_type ENUM('bus', 'metro', 'ev') NOT NULL DEFAULT 'bus',
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  fare DECIMAL(10, 2) NOT NULL,
  status ENUM('active', 'used', 'cancelled') NOT NULL DEFAULT 'active',
  ticket_code VARCHAR(36) NOT NULL UNIQUE,
  travel_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_passenger (passenger_id),
  INDEX idx_status (status),
  INDEX idx_ticket_code (ticket_code)
);
