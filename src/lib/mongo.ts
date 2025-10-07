import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
let clientPromise: Promise<MongoClient>;

if (!uri) throw new Error("MONGODB_URI not set");

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    const client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
