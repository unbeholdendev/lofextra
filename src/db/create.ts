export const create = [
  `
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(40) PRIMARY KEY,
  title TEXT NOT NULL,
  deletedAt INTEGER,
  updatedAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
);
`,
  `
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(40) PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  pubKeyHex TEXT NOT NULL,
  categoryId VARCHAR(40),
  deletedAt INTEGER,
  updatedAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(categoryId) REFERENCES categories(id)
);
`,
  `
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  createdAt INTEGER NOT NULL
);
`,
];
