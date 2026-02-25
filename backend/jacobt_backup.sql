--
-- PostgreSQL database dump
--

\restrict 9VBueDRGNqrTflo7WIZdzBNiBsHtCah8nPqIR3GYqc8HD13vtYTYq37PCdyaeyc

-- Dumped from database version 17.8 (6108b59)
-- Dumped by pg_dump version 17.6 (Homebrew)

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
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ACTIVE',
    'SOLD',
    'MAINTENANCE'
);


ALTER TYPE public."AssetStatus" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    dimensions text NOT NULL,
    description text,
    images text[],
    "purchasePrice" numeric(12,2) NOT NULL,
    "currentValue" numeric(12,2) NOT NULL,
    status public."AssetStatus" DEFAULT 'ACTIVE'::public."AssetStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "purchaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "associatedUsersId" text[],
    "submittedById" text,
    "updatedById" text
);


ALTER TABLE public."Asset" OWNER TO neondb_owner;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "proofImage" text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentCircle" integer NOT NULL,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedById" text,
    "submittedById" text
);


ALTER TABLE public."Payment" OWNER TO neondb_owner;

--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PushSubscription" OWNER TO neondb_owner;

--
-- Name: Target; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Target" (
    id text NOT NULL,
    year integer NOT NULL,
    "individualTarget" numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "numOfPayments" integer DEFAULT 10 NOT NULL,
    "numOfMembers" integer DEFAULT 6 NOT NULL
);


ALTER TABLE public."Target" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Asset" (id, name, location, dimensions, description, images, "purchasePrice", "currentValue", status, "createdAt", "updatedAt", "purchaseDate", "associatedUsersId", "submittedById", "updatedById") FROM stdin;
e3ba32da-510f-42f8-983a-82bed1cd10ea	Oha Arce 1	Along Express	1 Arce	First Arce purchase at Oha community	{https://res.cloudinary.com/dqxyecesu/image/upload/v1771876695/jacobt/hurxl3lnl5wkqx8i8n6e.png,https://res.cloudinary.com/dqxyecesu/image/upload/v1771876697/jacobt/e7f0ppny4wmkxsjwjzez.png}	4000000.00	5000000.00	ACTIVE	2026-02-23 19:58:48.845	2026-02-23 19:58:48.845	2025-12-26 00:00:00	{9febec43-476b-4aa3-84d5-e40cb3312949,b67fd0ef-8bd1-4c3e-bacb-bcd22edbe380,77b35443-d9bf-4545-bcb8-b59ae9024a10,e93991bc-e3bb-4bf4-91df-a6d5bbe88395,0863c01b-219d-497b-91a3-952a9feb7980}	e93991bc-e3bb-4bf4-91df-a6d5bbe88395	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Payment" (id, "userId", amount, "proofImage", status, "paymentCircle", "rejectionReason", "createdAt", "updatedAt", "updatedById", "submittedById") FROM stdin;
8006886f-98c9-4595-b2e7-ffe924c28d15	77b35443-d9bf-4545-bcb8-b59ae9024a10	590000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771874996/jacobt/p5xhhttmgzmziahyoav4.png	CONFIRMED	2025	\N	2026-02-23 19:29:58.99	2026-02-23 19:29:58.99	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
8b6b4ac3-5531-441a-96d5-0eebb69ea821	0863c01b-219d-497b-91a3-952a9feb7980	100000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771876386/jacobt/xaioceb3ajkar4dzqkj9.png	CONFIRMED	2026	\N	2026-02-23 19:53:09.732	2026-02-23 19:53:09.732	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
a80c688f-8ecd-4e71-bcc3-f966b1d38704	9febec43-476b-4aa3-84d5-e40cb3312949	700000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771872664/jacobt/c3sqwi0jh6chhocrj1da.png	CONFIRMED	2025	\N	2026-02-23 18:51:08.085	2026-02-23 18:51:08.085	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
cdaf1634-e60d-48c1-b93b-f78d3df1e305	e93991bc-e3bb-4bf4-91df-a6d5bbe88395	700000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771871730/jacobt/eyx4gaqe1pt9wzmrvttp.png	CONFIRMED	2025	\N	2026-02-23 18:35:35.11	2026-02-23 18:35:35.11	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
dfcef68f-24a2-4210-86bb-260482d13b18	b67fd0ef-8bd1-4c3e-bacb-bcd22edbe380	700000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771871973/jacobt/gygmeiykugrsrmwmlg1p.png	CONFIRMED	2025	\N	2026-02-23 18:39:38.431	2026-02-23 18:39:38.431	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
25f2fc66-db5b-4ba9-97af-a06ee351dcff	e3ce5ee3-453c-4a74-8df4-1adf75d6e9f1	100000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771876469/jacobt/ozutvskaq60udwtldmgz.png	CONFIRMED	2026	\N	2026-02-23 19:54:37.917	2026-02-23 19:54:37.917	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
5bdfdc7d-04cf-421f-8faa-5a6755105541	e3ce5ee3-453c-4a74-8df4-1adf75d6e9f1	700000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771873488/jacobt/fdvy7ci0clzfy0fowxc4.jpg	CONFIRMED	2025	\N	2026-02-23 19:04:52.916	2026-02-23 19:04:52.916	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
77dffd41-8bea-4cf4-922d-8e9ca18f23c6	0863c01b-219d-497b-91a3-952a9feb7980	700000.00	https://res.cloudinary.com/dqxyecesu/image/upload/v1771872560/jacobt/sjatwx6jdsi0aujuuk28.png	CONFIRMED	2025	\N	2026-02-23 18:49:24.247	2026-02-23 18:49:24.247	\N	e93991bc-e3bb-4bf4-91df-a6d5bbe88395
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PushSubscription" (id, "userId", endpoint, p256dh, auth, "createdAt") FROM stdin;
ccdbb6a3-5315-4a4b-b5a9-7c7c2cf5b487	e93991bc-e3bb-4bf4-91df-a6d5bbe88395	https://fcm.googleapis.com/fcm/send/e8Hk8DEwqXc:APA91bEFWPDhPjA9Q1dbux5dgVlIIOiDWpnw4TycoqqvyVXuT6IwI8t84TevGfa-jJYlpVAsMXrQu7JHmizkdVzZyiPgbEdmPUGATdoVbcz9qQ6xxPCt5asONC0Dw3C0gbBDoKafFBqh	BAiLbjco-M0G2_xH3LrVZ-J-AZI1Nx_iFqkKHwgNlZYCub4gs_NOQmHQ24HqVFDbthqml_cmI-5rjkM3U3zz-No	tkGLaSiWlQ9kRgK2fbhgqg	2026-02-23 16:21:31.145
\.


--
-- Data for Name: Target; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Target" (id, year, "individualTarget", "createdAt", "updatedAt", "numOfPayments", "numOfMembers") FROM stdin;
21720684-26fe-45c6-92b3-f165aef266e7	2026	100000.00	2026-02-23 19:49:53.736	2026-02-23 19:49:53.736	10	6
20aa639a-69f6-4ba7-8463-44832c329cdf	2025	70000.00	2026-02-23 14:47:39.855	2026-02-23 19:50:12.089	10	6
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, phone, password, role, "createdAt", "updatedAt") FROM stdin;
e93991bc-e3bb-4bf4-91df-a6d5bbe88395	Cleave Owhiroro	08165124558	$2b$10$b0WuzCFiea.uFFhGTtLhp.DsxiRFhyXyKxGwXJGjX9zTeJINrIxdG	SUPERADMIN	2026-02-23 14:47:40.112	2026-02-23 14:47:40.112
9febec43-476b-4aa3-84d5-e40cb3312949	Achioja Darlington	+447849015822	$2b$10$hBKcmZqKoCy/UmiuRf.dVeF2RWMGpc5nw.bUf0T9tQENkb2qnKyQK	USER	2026-02-23 18:27:51.717	2026-02-23 18:27:51.717
77b35443-d9bf-4545-bcb8-b59ae9024a10	Bryan Azanor	08148297188	$2b$10$ZoQzRJ0z5.pdlXcoRinB.umcSEP3fDPiui7Ey54hSJ9i08VBntIyS	ADMIN	2026-02-23 18:28:52.454	2026-02-23 18:28:52.454
b67fd0ef-8bd1-4c3e-bacb-bcd22edbe380	Babalola Odusanya	07060503227	$2b$10$HNmvuM6PpwkQWfgPA5FaEebAMQ2qOVXGbR7s/EyWp15Ls0gyUz8hO	ADMIN	2026-02-23 18:29:41.689	2026-02-23 18:29:41.689
0863c01b-219d-497b-91a3-952a9feb7980	Edward Ozah	08051982217	$2b$10$DvL1KdrrQPLTjBwSGF/Exub2KeaDAku0m1OAY6ZmulVLXr6hdMoyq	USER	2026-02-23 18:30:37.062	2026-02-23 18:30:37.062
e3ce5ee3-453c-4a74-8df4-1adf75d6e9f1	Joy Azah	07034547499	$2b$10$uL6EhXreLmyXo1EnLB9mXuVefewGbhCh/wTNBcb6In/wqFu2RkRJC	USER	2026-02-23 18:31:34.523	2026-02-23 18:31:34.523
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f0be78dc-8373-4721-b313-c75d6710ffdd	3611a048c2bbd683520edffcc00d93472017927dacecc8d9f7bcd034a48dde25	2026-02-23 14:46:17.685327+00	20260222172943_init	\N	\N	2026-02-23 14:46:14.578577+00	1
b7c9b834-5693-4653-8c52-ee3455a170ac	5ec2dc261f74ef4a0b2ab41134054bffb71199cfe28de51390736d7270e74dc3	2026-02-23 14:46:19.382135+00	20260222231855_init	\N	\N	2026-02-23 14:46:18.063452+00	1
5806d6cd-7acf-4b23-98cb-2222cb755f87	1c5a41d9ed429dfca11532cbd4533bcb45438c5324b2d0d95e8b48dbea12755e	2026-02-23 14:46:20.565655+00	20260222232541_init	\N	\N	2026-02-23 14:46:19.741801+00	1
cecc0cf9-06b7-4c09-beaa-b1e10297ae70	de836f3b661c554d66db2749f6bb5c501cb1eaa47f4f3734a7f61bb1f37e491d	2026-02-23 14:46:22.217408+00	20260223115343_init	\N	\N	2026-02-23 14:46:20.891085+00	1
4db2fa51-7671-4975-b7f4-36785a7591ba	c69325ec0682d4d83baf342f8b0bc8ed7a68e7d0957e04b041a091023445aa65	2026-02-24 15:21:18.478673+00	20260224142812_init	\N	\N	2026-02-24 15:21:17.68898+00	1
25c76905-298f-499f-a0bb-c1c1c195aaa1	012e90c1d65589ced25810a413444108239d37359769a38389aa63ff076d5acb	2026-02-24 15:21:19.55409+00	20260224143316_init	\N	\N	2026-02-24 15:21:18.772667+00	1
\.


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: Target Target_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Target"
    ADD CONSTRAINT "Target_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: PushSubscription_endpoint_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON public."PushSubscription" USING btree (endpoint);


--
-- Name: Target_year_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Target_year_key" ON public."Target" USING btree (year);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: Asset Asset_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Asset Asset_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PushSubscription PushSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 9VBueDRGNqrTflo7WIZdzBNiBsHtCah8nPqIR3GYqc8HD13vtYTYq37PCdyaeyc

