import { Collection, Db, MongoClient, OptionalUnlessRequiredId } from "mongodb";
import { Board, createBoardCollection } from "src/data/collections/board.collection";
import { createEventLogCollection, EventLog } from "src/data/collections/event.collection";
import { createUserCollection, User } from "src/data/collections/user.collection";
import { CollectionId } from "src/data/utils/constants/collection-id";
import { CollectionSetup } from "src/data/utils/types/collection-setup";
import { env } from "src/shared/utils/constants/env";
import { developmentUser } from "./data/1-User/DevelopmentUser";
import { javaBoard } from "./data/2-Board/LearnJava";

// Setup Mongo.
const client: MongoClient = new MongoClient(env.mongo.connStr, {});
await client.connect();
const db: Db = client.db();
const collectionSetups: CollectionSetup[] = [
  createUserCollection,
  createEventLogCollection,
  createBoardCollection
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
  events: db.collection<EventLog>(CollectionId.EventLog),
  users: db.collection<User>(CollectionId.User),
  boards: db.collection<Board>(CollectionId.Board)
}

// Seed helper function.
async function seedData<T>(collection: Collection<T>, data: OptionalUnlessRequiredId<T>[]) {
  await collection.insertMany(data);
}

// Seed data.
await seedData(collections.users, [
  developmentUser,
])
await seedData(collections.boards, [
  javaBoard,
  // ...dummyBoards
]);

// Close Mongo connection.
await client.close();