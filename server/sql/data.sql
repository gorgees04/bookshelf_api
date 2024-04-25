CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom enum type
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'status_enum'
  ) THEN
    CREATE TYPE status_enum AS ENUM ('public', 'private');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS authors (
    author_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS genres (
    genre_id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
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
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    book_url VARCHAR(255),
    file_path VARCHAR(255),
    status status_enum DEFAULT 'public',
    genre_id UUID REFERENCES genres(genre_id),
    user_id UUID REFERENCES users(user_id),
    author_id UUID REFERENCES authors(author_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- CREATE INDEX idx_books_user_id ON books(user_id);
-- CREATE INDEX idx_books_author_id ON books(author_id);
-- CREATE INDEX idx_books_genre_id ON books(genre_id);