create schema if not exists cs;

create table if not exists users
(
    id           bigint generated always as identity primary key,
    email        text        not null,
    username     text,
    display_name text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    constraint users_email_unique unique (email),
    constraint users_username_unique unique (username)
);

create index if not exists users_created_at_idx on users (created_at desc);

create table if not exists stylists
(
    id           bigint generated always as identity primary key,
    email        text        not null,
    name         text        not null,
    bio          text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    constraint stylists_email_unique unique (email)
);

create index if not exists stylists_created_at_idx on stylists (created_at desc);

create table if not exists bookings
(
    id          bigint generated always as identity primary key,
    user_id     bigint      not null references users (id) on delete cascade,
    stylist_id  bigint      not null references stylists (id) on delete restrict,
    starts_at   timestamptz not null,
    ends_at     timestamptz not null,
    status      text        not null default 'scheduled',
    notes       text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on bookings (user_id);
create index if not exists bookings_stylist_id_idx on bookings (stylist_id);
create index if not exists bookings_starts_at_idx on bookings (starts_at desc);

create table if not exists rides
(
    id            bigint generated always as identity primary key,
    user_id       bigint      not null references users (id) on delete cascade,
    booking_id    bigint references bookings (id) on delete set null,
    pickup_label  text,
    pickup_addr   text,
    dropoff_label text,
    dropoff_addr  text,
    pickup_at     timestamptz,
    status        text        not null default 'requested',
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists rides_user_id_idx on rides (user_id);
create index if not exists rides_booking_id_idx on rides (booking_id);
create index if not exists rides_pickup_at_idx on rides (pickup_at desc);
