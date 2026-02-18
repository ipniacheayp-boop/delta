-- ============================================================
-- Seed Data
-- File: supabase/migrations/002_seed_data.sql
-- ============================================================

-- Airports
INSERT INTO airports (iata_code, icao_code, name, city, country, timezone, latitude, longitude) VALUES
('ATL','KATL','Hartsfield-Jackson Atlanta International','Atlanta','USA','America/New_York',33.6407,-84.4277),
('JFK','KJFK','John F. Kennedy International','New York','USA','America/New_York',40.6413,-73.7781),
('LAX','KLAX','Los Angeles International','Los Angeles','USA','America/Los_Angeles',33.9425,-118.4081),
('LHR','EGLL','Heathrow Airport','London','UK','Europe/London',51.4775,-0.4614),
('CDG','LFPG','Charles de Gaulle Airport','Paris','France','Europe/Paris',49.0097,2.5479),
('NRT','RJAA','Narita International Airport','Tokyo','Japan','Asia/Tokyo',35.7720,140.3929),
('ORD','KORD','O Hare International Airport','Chicago','USA','America/Chicago',41.9742,-87.9073),
('MIA','KMIA','Miami International Airport','Miami','USA','America/New_York',25.7959,-80.2870),
('SFO','KSFO','San Francisco International','San Francisco','USA','America/Los_Angeles',37.6213,-122.3790),
('DXB','OMDB','Dubai International Airport','Dubai','UAE','Asia/Dubai',25.2532,55.3657),
('SYD','YSSY','Sydney Kingsford Smith Airport','Sydney','Australia','Australia/Sydney',-33.9461,151.1772),
('CUN','MMUN','Cancun International Airport','Cancun','Mexico','America/Cancun',21.0365,-86.8771);

-- Aircraft
INSERT INTO aircraft (registration, model, total_seats, seat_config) VALUES
('N123DA','Boeing 737-900ER',178,'{"first":16,"comfort_plus":24,"main":138}'),
('N456DA','Airbus A321-200',192,'{"first":20,"comfort_plus":42,"main":130}'),
('N789DA','Boeing 767-300ER',218,'{"delta_one":26,"comfort_plus":36,"main":156}'),
('N321DA','Airbus A330-900neo',281,'{"delta_one":29,"first":28,"comfort_plus":48,"main":176}'),
('N654DA','Boeing 757-200',199,'{"first":20,"comfort_plus":46,"main":133}');

-- Deals
INSERT INTO deals (title, description, badge, price, original_price, discount_percent, cabin_class, valid_from, valid_until) VALUES
('New York to Paris','Fly nonstop to the City of Light this summer','SALE',389,599,35,'main','2026-03-01','2026-06-30'),
('Atlanta to Tokyo','New nonstop route now open','NEW ROUTE',649,899,28,'main','2026-03-15','2026-07-31'),
('Chicago to Miami','Weekend beach escape from the Windy City','HOT',129,199,35,'main','2026-03-01','2026-05-31'),
('Los Angeles to London','Cross the Atlantic in style','DEAL',449,699,36,'main','2026-04-01','2026-08-31'),
('New York to Cancun','Spring break getaway','DEAL',199,299,33,'main','2026-03-01','2026-04-30'),
('Atlanta to Dubai','Experience the Middle East','HOT',749,999,25,'main','2026-05-01','2026-09-30');
