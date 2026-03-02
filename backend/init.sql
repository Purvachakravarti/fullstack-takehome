-- ===============================
-- USERS TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===============================
-- POSTS TABLE (Extended Model)
-- ===============================

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- SAFE MIGRATION FOR EXISTING DBS
-- ===============================

-- Add content column if missing
ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS content TEXT;

-- Backfill existing rows
UPDATE posts
SET content = ''
WHERE content IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE posts
    ALTER COLUMN content SET NOT NULL;

-- Ensure default exists
ALTER TABLE posts
    ALTER COLUMN content SET DEFAULT '';


-- Trigger for posts updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===============================
-- SEED DATA
-- ===============================

INSERT INTO users (id, name, age, email, phone) VALUES
    (1, 'John Doe', 25, 'john.doe@example.com', '123-456-7890'),
    (2, 'Jane Smith', 30, 'jane.smith@example.com', '098-765-4321'),
    (4, 'Bob Johnson', 35, 'bob.johnson@example.com', '555-123-4567')
ON CONFLICT (email) DO NOTHING;


INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES
    (1, 1, 'Getting Started with Rust',
     'Rust is a systems programming language focused on safety and performance.',
     '2025-01-01 10:00:00', '2025-01-01 10:00:00'),

    (2, 1, 'Understanding Ownership',
     'Ownership, borrowing, and lifetimes prevent memory bugs at compile time.',
     '2025-01-02 14:30:00', '2025-01-02 14:30:00'),

    (3, 1, 'Building Web APIs',
     'You can build fast APIs in Rust using async runtimes and GraphQL.',
     '2025-01-03 09:15:00', '2025-01-03 09:15:00')
ON CONFLICT (id) DO NOTHING;

-- Ensure sequence is aligned with seeded data - this is needed because PostgreSQL sequences don’t auto-adjust when IDs are manually inserted, so I updated the sequence using setval.
SELECT setval(
    pg_get_serial_sequence('posts', 'id'),
    (SELECT MAX(id) FROM posts)
);