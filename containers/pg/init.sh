#!/bin/bash
set -e

# Define environment variables for the main superuser and password
# These usually come from your Docker Compose file or `docker run` command
# For example: POSTGRES_USER=myuser POSTGRES_PASSWORD=mypassword
# POSTGRES_DB is the default database the entrypoint initially connects to (usually 'postgres')

# Define specific user for application_db
# APP_DB_USER="app_user"
# APP_DB_PASSWORD="2B7wzozq9h/8skJsurGzNGEIdocPQdIaa2WuSN7LQxg="

echo "Creating user: $POSTGRES_KOSHI_USER and application_db"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $POSTGRES_KOSHI_USER WITH ENCRYPTED PASSWORD '$POSTGRES_KOSHI_PASSWORD';
    CREATE DATABASE $POSTGRES_KOSHI_DB OWNER $POSTGRES_KOSHI_USER;
    REVOKE ALL ON DATABASE $POSTGRES_KOSHI_DB FROM PUBLIC;
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_KOSHI_DB TO $POSTGRES_KOSHI_USER;
    CREATE EXTENSION IF NOT EXISTS postgis;
EOSQL


# echo "Creating database: application_db"
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE DATABASE application_db OWNER $APP_DB_USER;
#     REVOKE ALL ON DATABASE application_db FROM PUBLIC;
#     -- Grant all privileges on the database to the app user
#     GRANT ALL PRIVILEGES ON DATABASE application_db TO $APP_DB_USER;
# EOSQL

# echo "Creating database: osm_db"
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE DATABASE osm_db OWNER $POSTGRES_USER; # osm_db owned by the main POSTGRES_USER
#     REVOKE ALL ON DATABASE osm_db FROM PUBLIC;
#     GRANT ALL PRIVILEGES ON DATABASE osm_db TO $POSTGRES_USER;
# EOSQL

# # Enable PostGIS in osm_db
# echo "Enabling PostGIS in osm_db"
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "osm_db" <<-EOSQL
#     CREATE EXTENSION postgis;
#     -- CREATE EXTENSION postgis_topology;
#     -- CREATE EXTENSION fuzzystrmatch;
#     -- CREATE EXTENSION postgis_raster;
# EOSQL


# echo "Database and user setup complete!"