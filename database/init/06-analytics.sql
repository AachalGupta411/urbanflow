USE analytics_db;

CREATE TABLE IF NOT EXISTS passenger_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_date DATE NOT NULL UNIQUE,
  total_registered INT DEFAULT 0,
  active_users INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_date DATE NOT NULL,
  vehicle_type ENUM('bus', 'metro', 'ev') NOT NULL,
  tickets_created INT DEFAULT 0,
  tickets_cancelled INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  UNIQUE KEY uk_date_type (stat_date, vehicle_type)
);

CREATE TABLE IF NOT EXISTS route_utilization (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id VARCHAR(50) NOT NULL,
  stat_date DATE NOT NULL,
  ticket_count INT DEFAULT 0,
  gps_event_count INT DEFAULT 0,
  avg_occupancy DECIMAL(5, 2) DEFAULT 0,
  UNIQUE KEY uk_route_date (route_id, stat_date)
);
