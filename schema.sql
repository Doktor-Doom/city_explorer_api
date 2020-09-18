--dont use this bit in the real real
DROP TABLE IF EXISTS locations

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255)
)

DROP TABLE IF EXISTS weather (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(),
  formatted_query VARCHAR(),
  latitude VARCHAR(),
  longitude VARCHAR()
)
-- DROP TABLE IF EXISTS
-- DROP TABLE IF EXISTS
-- DROP TABLE IF EXISTS