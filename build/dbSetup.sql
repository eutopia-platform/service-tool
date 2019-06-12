CREATE SCHEMA IF NOT EXISTS sc_tool;

CREATE TYPE sc_tool.visibility AS ENUM ('PUBLIC', 'UNLISTED');

DROP TABLE IF EXISTS sc_tool.toolkit;
CREATE TABLE sc_tool.toolkit(
  id                    uuid      PRIMARY KEY,
  title                 varchar   NOT NULL,
  description           varchar,
  description_markdown  varchar,
  canvas                json,
  learning              varchar,
  workflow              varchar,
  visibility            sc_tool.visibility  DEFAULT 'UNLISTED'
);

DROP USER IF EXISTS service_tool;
CREATE USER service_tool;

GRANT USAGE ON SCHEMA sc_tool TO service_tool;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sc_tool TO service_tool;
