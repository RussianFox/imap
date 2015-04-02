CREATE TABLE hosts_links_settings (
ids bigint NOT NULL,
color character varying(30) DEFAULT NULL,
weight integer,
opacity integer,
dash character varying(100) DEFAULT NULL
);
ALTER TABLE ONLY hosts_links_settings ADD CONSTRAINT hosts_links_settings_pkey PRIMARY KEY (ids);

CREATE SEQUENCE hosts_links_seq;
CREATE TABLE hosts_links (
id bigint DEFAULT nextval('hosts_links_seq') NOT NULL,
name character varying(300) DEFAULT NULL,
host1 bigint NOT NULL,
host2 bigint NOT NULL
);
ALTER TABLE ONLY hosts_links ADD CONSTRAINT hosts_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hosts_links ADD CONSTRAINT hosts_unique UNIQUE (host1, host2);
