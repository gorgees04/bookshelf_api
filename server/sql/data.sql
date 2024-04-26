CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS authors (
    author_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS genres (
    genre_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    genre VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS books (
    book_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    book_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    book_url TEXT,
    file_path TEXT,
    status VARCHAR(255) DEFAULT 'public',
    genre_id UUID REFERENCES genres(genre_id),
    user_id UUID REFERENCES users(user_id),
    author_id UUID REFERENCES authors(author_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

