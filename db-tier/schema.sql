CREATE DATABASE IF NOT EXISTS webappdb;
USE webappdb;

CREATE TABLE IF NOT EXISTS tasks (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO tasks (title, description, status)
VALUES
  ('Deploy web tier', 'Build the React app and configure NGINX.', 'Pending'),
  ('Deploy app tier', 'Run the Express API with PM2.', 'Pending'),
  ('Connect database', 'Create the RDS schema and test connectivity.', 'Pending');
