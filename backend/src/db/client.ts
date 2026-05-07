import { Db, MongoClient } from 'mongodb';
import { config } from '../config.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 20,
  });
  await client.connect();
  db = client.db(config.mongoDb);
  return db;
}

export async function getDb(): Promise<Db> {
  if (!db) return connectMongo();
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
