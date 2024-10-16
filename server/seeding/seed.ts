import { Collection, Db, MongoClient, OptionalUnlessRequiredId } from "mongodb";
import { createUserCollection, User } from "src/data/collections/user.collection";
import { CollectionId } from "src/data/utils/constants/collection-id";
import { CollectionSetup } from "src/data/utils/types/collection-setup";
import { env } from "src/shared/utils/constants/env";
import { developmentUser } from "./data/Users/DevelopmentUser";
// Setup Mongo.
const client: MongoClient = new MongoClient(env.mongo.connStr, {});
await client.connect();
const db: Db = client.db();
const collectionSetups: CollectionSetup[] = [
  createUserCollection
];

// Prepare collections.
let collectionsToWipe = (await db.collections());
for(let c of collectionsToWipe) {
  await c.drop();
}
for (let setup of collectionSetups) {
  await setup(db);
}
const collections = {
  users: db.collection<User>(CollectionId.User),
}

// Seed helper function.
async function seedData<T>(collection: Collection<T>, data: OptionalUnlessRequiredId<T>[]) {
  await collection.insertMany(data);
}

// Seed data.
await seedData(collections.users, [
  developmentUser,
])

// Close Mongo connection.
await client.close();