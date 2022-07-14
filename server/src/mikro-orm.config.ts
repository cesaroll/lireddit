import { __prod__ } from './constants';
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: path.join(__dirname, './migrations'),
    pathTs: path.join(__dirname, './migrations'),
  },
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  dbName: 'lireddit',
  type: 'postgresql',
  password: "docker", // Comment as needed
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
