import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017"; 
const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db("node_assignment");
}
