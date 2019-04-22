CREATE SCHEMA IF NOT EXISTS sc_tool;

DROP TABLE IF EXISTS sc_tool.toolkit;
CREATE TABLE sc_tool.toolkit();

DROP USER IF EXISTS service_tool;
CREATE USER service_tool;

GRANT USAGE ON SCHEMA sc_tool TO service_tool;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sc_tool TO service_tool;
