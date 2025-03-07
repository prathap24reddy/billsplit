-- Table to store trips
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP
);

-- Table to store users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Table to manage the many-to-many relationship between trips and users
CREATE TABLE trip_users (
    trip_id INT REFERENCES trips(id),
    user_id INT REFERENCES users(id),
    PRIMARY KEY (trip_id, user_id)
);

-- Table to store transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id),
    amount DECIMAL(10, 2),
    note TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store transaction details (borrow and lent amounts for each user involved)
CREATE TABLE transaction_users (
    transaction_id INT REFERENCES transactions(id),
    user_id INT REFERENCES users(id),
    borrow DECIMAL(10, 2) DEFAULT 0,
    lent DECIMAL(10, 2) DEFAULT 0,
    PRIMARY KEY (transaction_id, user_id)
);


