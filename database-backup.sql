--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: sqamtho
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO sqamtho;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: sqamtho
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO sqamtho;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: sqamtho
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO sqamtho;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: sqamtho
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comments OWNER TO sqamtho;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO sqamtho;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.conversation_participants (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.conversation_participants OWNER TO sqamtho;

--
-- Name: conversation_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.conversation_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversation_participants_id_seq OWNER TO sqamtho;

--
-- Name: conversation_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.conversation_participants_id_seq OWNED BY public.conversation_participants.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO sqamtho;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO sqamtho;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.event_attendees (
    id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_attendees OWNER TO sqamtho;

--
-- Name: event_attendees_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.event_attendees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_attendees_id_seq OWNER TO sqamtho;

--
-- Name: event_attendees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.event_attendees_id_seq OWNED BY public.event_attendees.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    image_url text,
    creator_id integer NOT NULL,
    attendee_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.events OWNER TO sqamtho;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO sqamtho;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: financial_records; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.financial_records (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    amount integer NOT NULL,
    date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financial_records OWNER TO sqamtho;

--
-- Name: financial_records_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.financial_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_records_id_seq OWNER TO sqamtho;

--
-- Name: financial_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.financial_records_id_seq OWNED BY public.financial_records.id;


--
-- Name: friends; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.friends (
    id integer NOT NULL,
    user_id integer NOT NULL,
    friend_id integer NOT NULL,
    status character varying(10) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    relationship character varying(50),
    birth_year integer,
    death_year integer,
    is_deceased boolean DEFAULT false
);


ALTER TABLE public.friends OWNER TO sqamtho;

--
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.friends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.friends_id_seq OWNER TO sqamtho;

--
-- Name: friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.friends_id_seq OWNED BY public.friends.id;


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.group_members (
    id integer NOT NULL,
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL
);


ALTER TABLE public.group_members OWNER TO sqamtho;

--
-- Name: group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_members_id_seq OWNER TO sqamtho;

--
-- Name: group_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.group_members_id_seq OWNED BY public.group_members.id;


--
-- Name: group_messages; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.group_messages (
    id integer NOT NULL,
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_messages OWNER TO sqamtho;

--
-- Name: group_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.group_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_messages_id_seq OWNER TO sqamtho;

--
-- Name: group_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.group_messages_id_seq OWNED BY public.group_messages.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    member_count integer DEFAULT 0 NOT NULL,
    message_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.groups OWNER TO sqamtho;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO sqamtho;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: health_records; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.health_records (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    date timestamp without time zone NOT NULL,
    value text,
    unit text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.health_records OWNER TO sqamtho;

--
-- Name: health_records_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.health_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_records_id_seq OWNER TO sqamtho;

--
-- Name: health_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.health_records_id_seq OWNED BY public.health_records.id;


--
-- Name: marketplace_items; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.marketplace_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    location text NOT NULL,
    category text NOT NULL,
    image_url text,
    tags jsonb DEFAULT '[]'::jsonb,
    delivery boolean DEFAULT false NOT NULL,
    collection boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.marketplace_items OWNER TO sqamtho;

--
-- Name: marketplace_items_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.marketplace_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_items_id_seq OWNER TO sqamtho;

--
-- Name: marketplace_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.marketplace_items_id_seq OWNED BY public.marketplace_items.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    user_id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO sqamtho;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO sqamtho;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.posts OWNER TO sqamtho;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO sqamtho;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.reactions (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL
);


ALTER TABLE public.reactions OWNER TO sqamtho;

--
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reactions_id_seq OWNER TO sqamtho;

--
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- Name: saved_posts; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.saved_posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    collection_name text DEFAULT 'All Posts'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_posts OWNER TO sqamtho;

--
-- Name: saved_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.saved_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_posts_id_seq OWNER TO sqamtho;

--
-- Name: saved_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.saved_posts_id_seq OWNED BY public.saved_posts.id;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.stories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text,
    image_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.stories OWNER TO sqamtho;

--
-- Name: stories_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.stories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stories_id_seq OWNER TO sqamtho;

--
-- Name: stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.stories_id_seq OWNED BY public.stories.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    amount integer NOT NULL,
    currency text DEFAULT 'ZAR'::text NOT NULL,
    billing_cycle text NOT NULL,
    next_billing_date timestamp without time zone NOT NULL,
    category text NOT NULL,
    provider text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    reminder_days integer DEFAULT 7 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO sqamtho;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO sqamtho;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO sqamtho;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    theme text DEFAULT 'light'::text,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    language text DEFAULT 'en'::text,
    privacy_level text DEFAULT 'public'::text,
    show_online_status boolean DEFAULT true,
    show_activity_status boolean DEFAULT true,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    content_preferences jsonb DEFAULT '{"feedType": "balanced", "defaultSort": "newest", "postDisplay": "expanded", "contentFilters": []}'::jsonb,
    accessibility_settings jsonb DEFAULT '{"fontSize": "medium", "highContrast": false, "reducedMotion": false, "screenReaderOptimized": false}'::jsonb,
    communication_settings jsonb DEFAULT '{"readReceipts": true, "messagePrivacy": "everyone", "lastSeenPrivacy": "everyone", "typingIndicators": true}'::jsonb,
    regional_settings jsonb DEFAULT '{"currency": "ZAR", "timeZone": "UTC", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h"}'::jsonb,
    security_settings jsonb DEFAULT '{"loginAlerts": true, "activeSessions": [], "trustedDevices": [], "twoFactorEnabled": false}'::jsonb
);


ALTER TABLE public.user_settings OWNER TO sqamtho;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNER TO sqamtho;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sqamtho
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    display_name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    profile_picture text,
    location text,
    bio text,
    cover_image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    gender character varying(20),
    ethnicity character varying(50),
    date_of_birth timestamp without time zone
);


ALTER TABLE public.users OWNER TO sqamtho;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sqamtho
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO sqamtho;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sqamtho
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: sqamtho
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: conversation_participants id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversation_participants ALTER COLUMN id SET DEFAULT nextval('public.conversation_participants_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: event_attendees id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.event_attendees ALTER COLUMN id SET DEFAULT nextval('public.event_attendees_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: financial_records id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.financial_records ALTER COLUMN id SET DEFAULT nextval('public.financial_records_id_seq'::regclass);


--
-- Name: friends id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.friends ALTER COLUMN id SET DEFAULT nextval('public.friends_id_seq'::regclass);


--
-- Name: group_members id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_members ALTER COLUMN id SET DEFAULT nextval('public.group_members_id_seq'::regclass);


--
-- Name: group_messages id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_messages ALTER COLUMN id SET DEFAULT nextval('public.group_messages_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: health_records id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.health_records ALTER COLUMN id SET DEFAULT nextval('public.health_records_id_seq'::regclass);


--
-- Name: marketplace_items id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.marketplace_items ALTER COLUMN id SET DEFAULT nextval('public.marketplace_items_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- Name: saved_posts id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.saved_posts ALTER COLUMN id SET DEFAULT nextval('public.saved_posts_id_seq'::regclass);


--
-- Name: stories id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.stories ALTER COLUMN id SET DEFAULT nextval('public.stories_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: sqamtho
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.comments (id, post_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.conversation_participants (id, conversation_id, user_id) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.conversations (id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: event_attendees; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.event_attendees (id, event_id, user_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.events (id, title, description, location, start_date, end_date, image_url, creator_id, attendee_count, created_at) FROM stdin;
\.


--
-- Data for Name: financial_records; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.financial_records (id, user_id, title, description, category, amount, date, created_at) FROM stdin;
\.


--
-- Data for Name: friends; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.friends (id, user_id, friend_id, status, created_at, relationship, birth_year, death_year, is_deceased) FROM stdin;
5	1	5	pending	2025-05-10 16:01:56.17141	\N	\N	\N	f
6	21	1	accepted	2025-05-11 13:10:42.042391	\N	\N	\N	f
7	20	16	pending	2025-05-11 17:10:51.624533	\N	\N	\N	f
8	20	14	pending	2025-05-11 17:13:07.507586	\N	\N	\N	f
9	20	7	pending	2025-05-11 17:13:50.332132	\N	\N	\N	f
10	20	23	pending	2025-05-11 17:15:45.650969	\N	\N	\N	f
11	20	1	accepted	2025-05-12 08:12:19.930793	\N	\N	\N	f
4	1	21	accepted	2025-05-10 15:56:19.985342	Daughter	\N	\N	f
3	1	20	accepted	2025-05-10 15:42:53.784708	Mother	\N	\N	f
1	1	2	accepted	2025-05-09 11:50:04.934564	Father	\N	\N	f
18	25	26	accepted	2026-04-22 11:28:09.484493	Father	\N	\N	f
19	25	27	accepted	2026-04-22 11:28:09.491274	Mother	\N	\N	f
20	25	28	accepted	2026-04-22 11:28:09.495384	Spouse	\N	\N	f
21	25	29	accepted	2026-04-22 11:28:09.498703	Son	\N	\N	f
22	25	30	accepted	2026-04-22 11:28:09.501572	Daughter	\N	\N	f
23	25	31	accepted	2026-04-22 11:28:09.504438	Brother	\N	\N	f
25	1	12	accepted	2026-04-24 11:39:30.942484	Spouse	\N	\N	f
26	12	1	accepted	2026-04-24 12:19:07.74684	Spouse	\N	\N	f
27	10	1	accepted	2026-04-24 12:26:48.821245	Son	\N	\N	f
28	1	10	accepted	2026-04-24 12:26:48.828889	Mother	\N	\N	f
29	12	11	pending	2026-04-24 13:56:21.856343	Friend	\N	\N	f
30	12	13	pending	2026-04-24 13:57:04.180608	Friend	\N	\N	f
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.group_members (id, group_id, user_id, role) FROM stdin;
1	4	5	member
2	5	5	member
3	6	5	member
\.


--
-- Data for Name: group_messages; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.group_messages (id, group_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.groups (id, name, description, image_url, created_at, member_count, message_count) FROM stdin;
1	South African Tech Hub	A community for tech enthusiasts, developers, and innovators in South Africa	\N	2025-05-09 18:23:28.322465	0	0
2	Johannesburg Foodies	Exploring the best food spots and sharing recipes in Joburg	\N	2025-05-09 18:23:28.322465	0	0
3	Cape Town Photography	Capturing the beauty of Cape Town through photography	\N	2025-05-09 18:23:28.322465	0	0
4	South African Tech Hub	A community for tech enthusiasts, developers, and innovators in South Africa	\N	2025-05-09 18:24:10.352372	0	0
5	Johannesburg Foodies	Exploring the best food spots and sharing recipes in Joburg	\N	2025-05-09 18:24:10.352372	0	0
6	Cape Town Photography	Capturing the beauty of Cape Town through photography	\N	2025-05-09 18:24:10.352372	0	0
\.


--
-- Data for Name: health_records; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.health_records (id, user_id, type, title, description, date, value, unit, created_at) FROM stdin;
\.


--
-- Data for Name: marketplace_items; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.marketplace_items (id, user_id, title, description, price, currency, location, category, image_url, tags, delivery, collection, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.messages (id, conversation_id, content, read, user_id, "timestamp") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.posts (id, user_id, content, image_url, created_at) FROM stdin;
1	21	Thinking about @Test User... 	\N	2025-05-20 17:35:45.492502
3	1	Test	\N	2026-04-17 14:45:44.990659
4	1	test	\N	2026-04-17 14:55:10.292541
5	1	test	\N	2026-04-17 15:01:55.476464
6	1	test	\N	2026-04-17 15:36:47.791048
9	1	Testing Create new post	\N	2026-04-17 15:59:00.101441
2	1	I'm working on the profile page for sure	/uploads/file-1776437516564-168930927.jpg	2025-06-12 18:01:22.87323
10	1	\n😊 Feeling Happy\n📍 Cape Town, South Africa	/uploads/file-1776438336237-379610087.PNG	2026-04-17 17:05:38.69288
\.


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.reactions (id, post_id, user_id, type) FROM stdin;
1	1	1	like
2	1	21	like
3	1	21	like
4	1	21	like
5	1	21	like
\.


--
-- Data for Name: saved_posts; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.saved_posts (id, user_id, post_id, collection_name, created_at) FROM stdin;
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.stories (id, user_id, content, image_url, created_at, expires_at) FROM stdin;
1	1	This is my first story!	\N	2026-04-17 19:31:48.00604	2026-04-18 17:31:47.998
2	1	Testing story view functionality.	\N	2026-04-17 19:34:09.791567	2026-04-18 17:34:09.787
3	1	Going nowhere slowly...	/uploads/file-1776761219508-107888487.PNG	2026-04-21 10:47:39.891758	2026-04-22 08:47:39.879
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.subscriptions (id, user_id, name, description, amount, currency, billing_cycle, next_billing_date, category, provider, status, auto_renew, reminder_days, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
S9FXjnsSUiijl_ki0LQA2Thz9ND7WCGw	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T14:41:50.801Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-05-01 16:41:51
DlmjSgfhfuu1EXR6Ljzn7DYT70ij4t5H	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T09:08:44.149Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 11:08:45
5fzxfzz7fTv_qlA3FMIriQtHuuYNNVcG	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T12:53:42.454Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-28 14:53:43
bPSKT6cq5Qcu9Ody9OXcJSlp2oGtHvjT	{"cookie":{"originalMaxAge":604799999,"expires":"2026-04-28T12:53:47.846Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-28 14:53:48
WnrEXmvP_EzlhtGIcGHDnGKPZPXJJ8jI	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T09:07:49.277Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-04-28 11:07:50
kLK9KbcXczJ8bUPZ6BsXCpeVetx_25nx	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T12:53:48.079Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-28 14:53:49
4LVmp--cm14D_8tmpfJ6ckWNZDV7i46B	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T09:09:40.934Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 11:09:41
T20Tm6faTQ3UPqot6J4nrJSuEVxy46X1	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-24T17:11:57.796Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-04-24 19:11:58
VgpvJUv_24dKyH1FB_N76cmm8TQru134	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:59.126Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:03:00
mLxmUkwMSw50Qk7H4lSpiWMrCD6MUAX7	{"cookie":{"originalMaxAge":604799996,"expires":"2026-04-28T12:27:25.276Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-04-28 14:27:26
YVXmyMmzTld9n21W2Swy-vEUn0CAq083	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T08:49:53.584Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-04-28 10:49:54
7cYT4GQ-fglFWnnscTTWkwuz2AXW33JU	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:22:43.641Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":10},"userId":10}	2026-05-01 15:22:44
1Ffji5NrRakGqSOBITZma8tEaq7j2fh_	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T13:06:38.174Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-28 15:06:39
T1YBcC-LgUfIzlrwisbUhGBGmCqrVybT	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T12:42:01.207Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 14:42:02
8z9SDXvPpxuaDHgGlIPScpnTwt-oHsJG	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:32.505Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:02:33
YKZPv22nTbjkJmO-GvkNTQLpRAMjGS0X	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-28T08:59:55.927Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-28 10:59:56
WBwY0Wddxm3aV4LlRZLbX0kXLDS8gpuH	{"cookie":{"originalMaxAge":604799999,"expires":"2026-05-01T13:02:56.854Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1},"userId":1}	2026-05-01 15:02:57
57NE21rNnbfQvHhYoy5b2kqdjM_Jg__r	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:57.992Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:02:58
5PWKBIXa1CLb9ITsPjqqCLzlp6wA5-bH	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:57.649Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:02:58
G6qhYJWIUkrUM1_K0jKmlDmjMHvsu_Mm	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:57.711Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:02:58
AZ6-07h3oaVrm1V-iZ7I0JdN-T0B4Rz7	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T13:02:57.983Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-05-01 15:02:58
p0Gu39aQlXerxEB9M9b-dWXVibAsuBOb	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-24T16:59:13.338Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2026-04-24 18:59:14
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.user_settings (id, user_id, theme, notifications_enabled, email_notifications, push_notifications, language, privacy_level, show_online_status, show_activity_status, preferences, created_at, updated_at, content_preferences, accessibility_settings, communication_settings, regional_settings, security_settings) FROM stdin;
1	1	light	t	t	t	zu	public	t	t	{"notifications": {"push": true, "email": true}}	2025-04-27 18:22:45.585844	2025-04-27 16:23:20.027	{"feedType": "balanced", "defaultSort": "newest", "postDisplay": "expanded", "contentFilters": []}	{"fontSize": "medium", "highContrast": false, "reducedMotion": false, "screenReaderOptimized": false}	{"readReceipts": true, "messagePrivacy": "everyone", "lastSeenPrivacy": "everyone", "typingIndicators": true}	{"currency": "ZAR", "timeZone": "UTC", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h"}	{"loginAlerts": true, "activeSessions": [], "trustedDevices": [], "twoFactorEnabled": false}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sqamtho
--

COPY public.users (id, username, display_name, email, password_hash, profile_picture, location, bio, cover_image, created_at, gender, ethnicity, date_of_birth) FROM stdin;
2	frienduser	Friend User	friend@example.com	5b56179ab332621162f468381e0114e0ad4239c0b7cd7b2fa59c81586e735075a29a858cf91c05347dbb6ebe35a05b7a60d356dd8b7f22ba00acaa57e47a0973.fc7d7e0a07171c281fb21474add41c92	https://via.placeholder.com/150/0000FF/808080?text=Friend	Friend Location	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
3	suggestionuser	Suggestion User	suggestion@example.com	35559d3431e5b9873dac58be34a18f45540c0946a8ab1cb58ea9516d573173dd603eeafd0a8a313d8611a1924427992262f562bca9dcb362e8cf04a624c413a3.319f99d8aba980425260138e4d9b97a9	https://via.placeholder.com/150/FF0000/FFFFFF?text=Suggest	Suggestion Location	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
4	suggestionuser2	Suggestion User 2	suggestion2@example.com	d8f732e8d50dd4e22e938d2e64d9ea15632bda158462db2bce308e93d32f417225ceed2f16e433c67e14b1b0c6efd034c25364f905b56acbbb4b9c7994cfce77.d1edea171baa729bdabec1660415a840	https://via.placeholder.com/150/008000/FFFFFF?text=Suggest2	Suggestion Location 2	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
11	testuser7	Test User 7	testuser7@example.com	c1156b883904759b5b13157a43d83faaac66b1cd9b80099a9906b61419ef8632f9a1a1ef34fa841023ac1d4fa5d2a297a70968854c9dc9172bacf75f62706c2f.74731105c4aeb25b7870769d96c45562	https://via.placeholder.com/150/CCCCCC/000000?text=User7	Test Location 7	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
12	testuser8	Test User 8	testuser8@example.com	f4167165943d67bf7c5b7561fbe79e6b400b064fbd537bb6a8a4a671199f25b1723c4762459f7e8c1e6ca70040102252d4e547e539dcbdedcdb64cb10d869f9b.75d508a7fbe2419b5a1e61ef49e032c9	https://via.placeholder.com/150/CCCCCC/000000?text=User8	Test Location 8	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
13	testuser9	Test User 9	testuser9@example.com	90e5942279671965a25fcad275baf8ad284a533916248496989910284e0e69f277b7c730cf5d446c4f794de8d3c8c8b3a4cc9e61f92451a78405a79737e506d8.3229adbaa833f5dbb7e5c464501de4f7	https://via.placeholder.com/150/CCCCCC/000000?text=User9	Test Location 9	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
14	testuser10	Test User 10	testuser10@example.com	bec1dacb6da9707b3d934bc77cb23c9ba992ca1a47183edeff8c9806b049a25ed46aef103c0e0f0f77efe42baa987423f7be711c80160861d2d0c974399fe48d.af9f5022bd5c23e361d51d98068be5b2	https://via.placeholder.com/150/CCCCCC/000000?text=User10	Test Location 10	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
15	testuser11	Test User 11	testuser11@example.com	b7b4828097fe408ca57f18e5e1dd7bc45b6a9027ad2b0f56b8730b3ba59cd20ca8b78ace93a5c3fd3158f690905842c5a4ef311d84b17e6d98a52fe5305ed83a.e46dca14572aeee54c7b034f84357f2d	https://via.placeholder.com/150/CCCCCC/000000?text=User11	Test Location 11	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
16	testuser12	Test User 12	testuser12@example.com	7c6f510a1213560adeaa2115f925210b0a0a98ea1583b94987d695cd36429ecc2fa9233de8d0577680ff078d2869df212612b35f276b6c7d438e3117ffbeeb97.299657852953b2d0c5cc1549a31eee49	https://via.placeholder.com/150/CCCCCC/000000?text=User12	Test Location 12	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
17	testuser13	Test User 13	testuser13@example.com	88c67a8cb8b79c177c9026653d6b05280df35aeebb1343354ac533d602ae75829c03257d55c792952d82ee8628b3f2d14b641d9a79a8f583f4024e5c9cb1e6d8.51ca60133b7a3dde8255b973ed197822	https://via.placeholder.com/150/CCCCCC/000000?text=User13	Test Location 13	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
18	testuser14	Test User 14	testuser14@example.com	ceb062fee41e3c095c51e2495d0493d0f98ad991ce27a208c251f25b9ee47f313aa3076f41b538017cecdb3484a91e8b9b059010d3db30cae427eb9e838966ff.fa134636e3daaaf03a480a3552886895	https://via.placeholder.com/150/CCCCCC/000000?text=User14	Test Location 14	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
19	testuser15	Test User 15	testuser15@example.com	11e279fd23b39b14d9b029e01874df907a420d3f9f5bf998fc0df8f6668638ed818b80414e57234a9e8705dc320d9efd45119fb91b0f0f211097c575846a8d6d.99aa0d55e2ff8fbb529ca2d27c753d60	https://via.placeholder.com/150/CCCCCC/000000?text=User15	Test Location 15	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
20	testuser16	Test User 16	testuser16@example.com	e2406687d6f18c13d39fd22da1ef00a69adcfeaeec110c0837616d1cee29b4ac2218a4620269dd182aff0926e2f96bfa278d0d09c4abd5fb3e1bd4a29cab4e60.2d5ee9bbca04abe216fec5c56b7e463d	https://via.placeholder.com/150/CCCCCC/000000?text=User16	Test Location 16	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
21	testuser17	Test User 17	testuser17@example.com	c1e0fa4e62dfcfe37ec6e4c1b66f2c3d0fec27229ff37ab5bc625716b8e566874b1d8ce8329a9e86ef92c10c395077a0ebe0af0c314aa3bab34a0ea3c4f8fcca.daa695423f529f551e64714690b75c76	https://via.placeholder.com/150/CCCCCC/000000?text=User17	Test Location 17	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
22	testuser18	Test User 18	testuser18@example.com	1a225a34a9d41b10602cdb1b75e83b3319d5da8d4ffbfda9b9a43e084d30b51331c8a8fb6fd5e0646e38f04363c3d8ca287cb7402de2b0f2d716026c7b91ccab.906cf3b7a7f47a6778f73eaf10e8a772	https://via.placeholder.com/150/CCCCCC/000000?text=User18	Test Location 18	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
23	testuser19	Test User 19	testuser19@example.com	440cd602f62a5e19892d5eb03e1549c65d36e9dc73f67e3ce95607490e9cf3c253680b391ed4283e1f13e84c8c2e3f9d88a7ef9b721fb753c8682c1375c8ffba.032b3a57bdb8db160dc7ccd356e7091c	https://via.placeholder.com/150/CCCCCC/000000?text=User19	Test Location 19	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
24	testuser20	Test User 20	testuser20@example.com	9ee0abc440cbc95e510b36a71e9bc5135caa19719df9a9d1bffb9b123d8f5a3bf8e4e5af770e1648c4f07dac133af22506347a68d1a04547c68fc96a0bae7c8c.f136373f6275e2f6cbebae34ffa1bcee	https://via.placeholder.com/150/CCCCCC/000000?text=User20	Test Location 20	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
10	testuser6	Test User 6	testuser6@example.com	80302d3f5343d9ff23a572aca33cd5a4710794f5743d341c86b83971c98a00a11243a6b13ac99ed89b337ca5c31ca68937c76c33c48d075edd122efd4fafd1e1.708a6daf753e600e2aa8aa3a169fbc19	https://via.placeholder.com/150/CCCCCC/000000?text=User6	Test Location 6	\N	\N	2026-04-17 13:41:30.241978	Female	\N	\N
6	testuser2	Test User 2	testuser2@example.com	300401a8d2f46d94da258a0b75b793de22d1f38eec120982433280805d8f87c5df3827e3a62ceda1663cfca696d590be964134914711642060473ff80ac9dc90.1abf92a81748035da400a22d7257d098	https://via.placeholder.com/150/CCCCCC/000000?text=User2	Test Location 2	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
7	testuser3	Test User 3	testuser3@example.com	b258b359c5b52fcb98a74b4c7ba586581daadbf887b44015086aab14e598923858a2c7c60bf799890b6475cd9f34989d26348565a5c9835a39da05c055920c60.b48012e5af5ff720b896862c918af7b7	https://via.placeholder.com/150/CCCCCC/000000?text=User3	Test Location 3	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
8	testuser4	Test User 4	testuser4@example.com	72abb8a07a40d0b5d02dd4b71624008232afb930012f713634a03e7def3752591de0a255e7c3ec9e573855b9ca91e7a3c6367f2bba388e19c27c760be2c17a46.c61160be4df78714f8650dc971d450fe	https://via.placeholder.com/150/CCCCCC/000000?text=User4	Test Location 4	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
9	testuser5	Test User 5	testuser5@example.com	e47da692160c80d8a8c19e47305c7001ba98ca438b5460527f97defb305dfe2e3f8b3761db406d7161ff54ccfd031a1387bf8ecd02841a981a1cb3b3ecc8fbdb.47144c13b637cd00463ba06f9712744a	https://via.placeholder.com/150/CCCCCC/000000?text=User5	Test Location 5	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
5	testuser1	Test User 1	testuser1@example.com	977a66c911e5f345a6641ae022b950ba31346251f1dd8d0fc15a7b563d1badc14720edcb89154dae6632e17f43286110ef7480a918216e67ee38a39e3576c18d.cef3bce8081288619e52d65bc2ff6ac1	https://via.placeholder.com/150/CCCCCC/000000?text=User1	Test Location 1	\N	\N	2026-04-17 13:41:30.241978	\N	\N	\N
25	johndoe	John Doe	john@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.475214	\N	\N	\N
26	peterdoe	Peter Doe	peter@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.500161	\N	\N	\N
27	marydoe	Mary Doe	mary@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.508569	\N	\N	\N
28	janedoe	Jane Doe	jane@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.514799	\N	\N	\N
29	jimmydoe	Jimmy Doe	jimmy@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.522768	\N	\N	\N
30	jennydoe	Jenny Doe	jenny@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.529027	\N	\N	\N
31	bobdoe	Bob Doe	bob@example.com	hash	\N	\N	\N	\N	2026-04-22 11:27:02.534852	\N	\N	\N
1	testuser	Ezrom Mote Mokhotla	test@example.com	0ff69afdee0b4055f0c0e15fd2c12b710d94ee2c46dcd0443bb682a72dd11788073263af7af6e5c655271c875807a7517bb248fd6c3ce52ba82b45bd22b0db3f.6f6ed352b03f99f1ddc115a4ecaa6842	/uploads/file-1776445583365-15630588.PNG	South Africa	Passionate about Test User. Connecting worlds and creating memories. Just another soul on a mission to make every moment count.	/uploads/file-1776445583450-846025145.jpg	2026-04-17 13:41:30.241978	Male	Black	1975-08-24 00:00:00
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: sqamtho
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: conversation_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.conversation_participants_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: event_attendees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.event_attendees_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: financial_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.financial_records_id_seq', 1, false);


--
-- Name: friends_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.friends_id_seq', 30, true);


--
-- Name: group_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.group_members_id_seq', 3, true);


--
-- Name: group_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.group_messages_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.groups_id_seq', 6, true);


--
-- Name: health_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.health_records_id_seq', 1, false);


--
-- Name: marketplace_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.marketplace_items_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.posts_id_seq', 10, true);


--
-- Name: reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.reactions_id_seq', 5, true);


--
-- Name: saved_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.saved_posts_id_seq', 1, false);


--
-- Name: stories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.stories_id_seq', 3, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sqamtho
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: sqamtho
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: financial_records financial_records_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT financial_records_pkey PRIMARY KEY (id);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: group_messages group_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: health_records health_records_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_pkey PRIMARY KEY (id);


--
-- Name: marketplace_items marketplace_items_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT marketplace_items_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- Name: saved_posts saved_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_pkey PRIMARY KEY (id);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: friends unique_friendship; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT unique_friendship UNIQUE (user_id, friend_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: sqamtho
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: comments comments_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversation_participants conversation_participants_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: conversation_participants conversation_participants_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: event_attendees event_attendees_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: event_attendees event_attendees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: events events_creator_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_creator_id_users_id_fk FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: financial_records financial_records_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT financial_records_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: friends friends_friend_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_friend_id_users_id_fk FOREIGN KEY (friend_id) REFERENCES public.users(id);


--
-- Name: friends friends_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: group_members group_members_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: group_members group_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: group_messages group_messages_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: group_messages group_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: health_records health_records_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: marketplace_items marketplace_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT marketplace_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: posts posts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reactions reactions_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: reactions reactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: saved_posts saved_posts_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- Name: saved_posts saved_posts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.saved_posts
    ADD CONSTRAINT saved_posts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stories stories_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_settings user_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sqamtho
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

