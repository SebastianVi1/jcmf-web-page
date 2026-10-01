// The installed pg package does not expose TypeScript declarations in this setup.
// @ts-ignore: pg is intentionally consumed without bundled type declarations.
import { Client } from 'pg';
interface QueryResult<T> {
  result: <T>(data: T) => T;
}
interface ClientProps {
  connect: () => void;
  query: (query: string) => Promise<QueryResult<any>>;
  end: () => void;
}

export function queryDatabase(query: string): any {
  const db = connectToDatabase();
  return db
    .query(query)
    .catch((error: unknown) => {
      console.error('Error executing query:', error);
      throw error;
    })
    .finally(() => {
      db.end();
    });
}

export function connectToDatabase() {
  const connectionData = {
    user: 'postgres',
    host: '',
    database: 'construx',
    passworrd: process.env.DATABASE_PASSWORD,
    port: 5432,
  };
  const client = new Client(connectionData);
  client.connect();
  console.log('Connected to database');
  return client;
}
