-- Create contacts table
CREATE TABLE contacts (
    id bigint primary key generated always as identity,
    first_name text,
    middle_name text,
    last_name text,
    phonetic_first_name text,
    phonetic_middle_name text,
    phonetic_last_name text,
    name_prefix text,
    name_suffix text,
    nickname text,
    file_as text,
    birthday date,
    notes text,
    photo text,
    labels text
);

-- Create organizations table
CREATE TABLE organizations (
    id bigint primary key generated always as identity,
    name text UNIQUE, -- Ensure the organization name is unique
    address_formatted text,
    address_street text,
    address_city text,
    address_po_box text,
    address_region text,
    address_postal_code text,
    address_country text,
    address_extended_address text
);

-- Create contact_organizations table
CREATE TABLE contact_organizations (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    organization_id bigint references organizations(id),
    title text,
    department text
);

-- Create emails table
CREATE TABLE emails (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    email text,
    label text
);

-- Create phones table
CREATE TABLE phones (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    phone text,
    label text
);

-- Create addresses table
CREATE TABLE addresses (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    formatted text,
    street text,
    city text,
    po_box text,
    region text,
    postal_code text,
    country text,
    extended_address text,
    label text
);

-- Create facebook_links table
CREATE TABLE facebook_links (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    url text
);

-- Create website_links table
CREATE TABLE website_links (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    url text,
    label text
);

-- Create twitter_links table
CREATE TABLE twitter_links (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    url text
);

-- Create linkedin_links table
CREATE TABLE linkedin_links (
    id bigint primary key generated always as identity,
    contact_id bigint references contacts(id),
    url text
);

-- Create connections table
CREATE TABLE connections (
    id bigint primary key generated always as identity,
    name text
);

-- Create contact_connections table
CREATE TABLE contact_connections (
    id bigint primary key generated always as identity,
    connection_id bigint references connections(id),
    contact_id bigint references contacts(id)
);