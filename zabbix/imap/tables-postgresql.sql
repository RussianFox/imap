CREATE TABLE imap_hosts_links_settings (
    ids bigint NOT NULL,
    color character varying(30) DEFAULT '#0000FF'::character varying NOT NULL,
    alertcolor character varying(30) DEFAULT '#FF0000'::character varying NOT NULL,
    weight integer,
    dash character varying(100) DEFAULT NULL::character varying
);
ALTER TABLE ONLY imap_hosts_links_settings ADD CONSTRAINT imap_hosts_links_settings_pkey PRIMARY KEY (ids);

CREATE SEQUENCE imap_hosts_links_seq;
CREATE TABLE imap_hosts_links (
    id bigint DEFAULT nextval('imap_hosts_links_seq'::regclass) NOT NULL,
    name character varying(300) DEFAULT NULL::character varying,
    host1 bigint NOT NULL,
    host2 bigint NOT NULL
);
ALTER TABLE ONLY imap_hosts_links ADD CONSTRAINT imap_hosts_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY imap_hosts_links ADD CONSTRAINT imap_hosts_unique UNIQUE (host1, host2);

CREATE SEQUENCE imap_triggers_links_seq;
CREATE TABLE imap_triggers_links (
    id bigint DEFAULT nextval('imap_triggers_links_seq'::regclass) NOT NULL,
    triggerid bigint NOT NULL,
    objectid bigint NOT NULL,
    objecttype character varying(50) DEFAULT NULL::character varying NOT NULL
);
ALTER TABLE ONLY imap_triggers_links ADD CONSTRAINT imap_triggers_links_pkey PRIMARY KEY (id);

CREATE SEQUENCE imap_items_links_seq;
CREATE TABLE imap_items_links (
    id bigint DEFAULT nextval('imap_items_links_seq'::regclass) NOT NULL,
    triggerid bigint NOT NULL,
    objectid bigint NOT NULL,
    objecttype character varying(50) DEFAULT NULL::character varying NOT NULL,
    max_value double precision NOT NULL,
    min_value double precision NOT NULL,
    gradient bigint DEFAULT '0'::bigint NOT NULL
);
ALTER TABLE ONLY imap_items_links ADD CONSTRAINT imap_items_links_pkey PRIMARY KEY (id);
ALTER TABLE ONLY imap_items_links ADD CONSTRAINT imap_items_unique UNIQUE (objectid, objecttype);