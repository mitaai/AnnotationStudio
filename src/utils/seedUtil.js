import { Seeder, getObjectId, getObjectIds } from 'mongo-seeding';
import path from 'path';

const seedDb = async () => {
  const config = { database: process.env.DB_URI };
  const seeder = new Seeder(config);
  const collections = seeder.readCollectionsFromPath(path.resolve('../seeds'));

  try {
    await seeder.import(collections);
  } catch (err) {
    Error('MONGODB_SEED_ERROR', err);
  }
};

const mapToEntities = (names) => names.map((name) => {
  const id = getObjectId(name);

  return {
    id,
    name,
  };
});

module.exports = {
  seedDb,
  mapToEntities,
  getObjectId,
  getObjectIds,
};
