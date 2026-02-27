-- Initialize the database with a users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, age, email, phone) VALUES
    (1, 'John Doe', 25, 'john.doe@example.com', '123-456-7890'),
    (2, 'Jane Smith', 30, 'jane.smith@example.com', '098-765-4321'),
    (3, 'Purva Chakravarti', 30, 'purva@example.com', '092-365-4321'),
    (4, 'Bob Johnson', 35, 'bob.johnson@example.com', '555-123-4567')
ON CONFLICT (email) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Posts table (includes content)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safety migration: ensure user_id exists (kept from the original)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE posts
            ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Seed posts WITH content
INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES
    -- Posts by John Doe (user_id: 1)
    (1, 1, 'Getting Started with Rust',
     'Rust is a systems programming language focused on safety and performance. This post covers setup, cargo, and the basics.',
     '2025-01-01 10:00:00', '2025-01-01 10:00:00'),

    (2, 1, 'Understanding Ownership',
     'Ownership, borrowing, and lifetimes are Rust’s superpower. They prevent common memory bugs at compile time.',
     '2025-01-02 14:30:00', '2025-01-02 14:30:00'),

    (3, 1, 'Building Web APIs',
     'You can build fast APIs in Rust using async runtimes and frameworks like Axum, and expose them via GraphQL.',
     '2025-01-03 09:15:00', '2025-01-03 09:15:00'),

    -- Posts by Jane Smith (user_id: 2)
    (4, 2, 'GraphQL vs REST',
     'REST is simple and cache-friendly. GraphQL shines when clients need flexible shapes and minimal over-fetching.',
     '2025-01-01 16:20:00', '2025-01-01 16:20:00'),

    (5, 2, 'Database Design Patterns',
     'Good schema design uses constraints, indexes, and thoughtful normalization. The goal is correctness first, speed second.',
     '2025-01-02 11:45:00', '2025-01-02 11:45:00'),

    (6, 2, 'Frontend State Management',
     'Start with local state, graduate to context, and only bring in a store when you feel the pain. Avoid premature complexity.',
     '2025-01-04 13:10:00', '2025-01-04 13:10:00'),

    -- Posts by Bob Johnson (user_id: 4)
    (7, 4, 'Docker Containerization',
     'Docker packages your app and dependencies into an image so it runs consistently across machines and environments.',
     '2025-01-01 08:30:00', '2025-01-01 08:30:00'),

    (8, 4, 'Kubernetes Deployment',
     'Kubernetes orchestrates containers at scale: scheduling, service discovery, rolling updates, and self-healing.',
     '2025-01-03 15:45:00', '2025-01-03 15:45:00'),

    (9, 4, 'CI/CD Best Practices',
     'Fast feedback wins. Keep pipelines small, run tests in parallel, and deploy safely with clear rollback paths.',
     '2025-01-05 10:20:00', '2025-01-05 10:20:00'),

    (10, 4, 'Monitoring and Observability',
     'Metrics tell you what, logs tell you why, traces tell you where. Together they make production debuggable.',
     '2025-01-06 12:00:00', '2025-01-06 12:00:00')
ON CONFLICT (id) DO NOTHING;

-- Optional: trigger for posts updated_at (nice-to-have, consistent with users)
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();