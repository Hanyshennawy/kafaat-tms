-- Create database (run this in psql as superuser)
-- psql -U postgres -f setup-db.sql

-- Create database if not exists
SELECT 'CREATE DATABASE kafaat_tms'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kafaat_tms')\gexec

-- Connect to the database
\c kafaat_tms

-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kafaat') THEN
    CREATE ROLE kafaat WITH LOGIN PASSWORD 'kafaat_password';
  END IF;
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kafaat_tms TO kafaat;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kafaat;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kafaat;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kafaat;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kafaat;

-- Success message
SELECT 'Kafaat TMS database setup complete!' as status;
