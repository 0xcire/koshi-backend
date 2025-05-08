-- example of sql file run on pg image start up when data dir is empty
-- creates db, user and grants necessary permissions for something like Mikro ORM to run migrations

CREATE DATABASE example_db;
CREATE USER example_user WITH ENCRYPTED PASSWORD "use-this";
GRANT ALL PRIVILEGES ON DATABASE example_db TO example_user;

\c example_db; -- an important line which i figured out super quickly for sure~
grant all privileges on all tables in schema public to example_user;
grant all privileges on all sequences in schema public to example_user;
grant all privileges on all functions in schema public to example_user;
GRANT CREATE ON SCHEMA public to example_user;
