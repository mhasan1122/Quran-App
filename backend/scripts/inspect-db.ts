import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  console.log('connected');

  const adminDbs = await client.db().admin().listDatabases();
  console.log('databases:', adminDbs.databases.map(d => d.name));

  const dbName = process.env.MONGODB_DB || 'QuranDatabase';
  const db = client.db(dbName);
  const cols = await db.listCollections().toArray();
  console.log(`collections in ${dbName}:`, cols.map(c => c.name));

  for (const c of cols) {
    const col = db.collection(c.name);
    const count = await col.estimatedDocumentCount();
    const sample = await col.findOne();
    console.log(`---\ncollection: ${c.name} (count≈${count})`);
    console.log('sample keys:', sample ? Object.keys(sample) : '(empty)');
    console.log('sample (truncated):', JSON.stringify(sample, null, 2)?.slice(0, 1500));
  }

  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
