USE gps_db;

INSERT INTO vehicles (vehicle_id, vehicle_type, route_id, status) VALUES
  ('BUS-001', 'bus', 'R-101', 'active'),
  ('BUS-002', 'bus', 'R-101', 'active'),
  ('METRO-10', 'metro', 'R-202', 'active'),
  ('EV-001', 'ev', 'R-303', 'active')
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO routes (route_id, name, origin, destination, stops) VALUES
  ('R-101', 'Central to Airport Express', 'Central Station', 'International Airport',
   '["Central Station", "Downtown", "Business District", "Airport Terminal"]'),
  ('R-202', 'Metro Line A', 'North Terminal', 'South Terminal',
   '["North Terminal", "City Center", "University", "South Terminal"]'),
  ('R-303', 'EV Green Route', 'Eco Hub', 'Tech Park',
   '["Eco Hub", "Green Valley", "Tech Park"]')
ON DUPLICATE KEY UPDATE name = VALUES(name);
