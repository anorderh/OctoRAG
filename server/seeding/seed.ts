import path from "path";
import { env } from "../src/env.js";
import { Seeder, SeederConfig } from "mongo-seeding";

 const config = {
    database: env.mongo.connStr,
    dropDatabase: false,
    dropCollections: false,
    removeAllDocuments: true
} as SeederConfig
const seeder: Seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(path.resolve(env.pathes.seedData), {
    extensions: ['ts'],
});

seeder
  .import(collections)
  .then(() => {
    console.log("Database succeessfully seeded.")
  })
  .catch((err) => {
    console.log("Error occurred.");
    console.log(JSON.stringify(err, null, 2))
  });