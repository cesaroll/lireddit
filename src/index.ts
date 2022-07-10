import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const main = async () => {
  console.log('Running main');

  const orm = await MikroORM.init<PostgreSqlDriver>({
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !__prod__,
  });

  console.log('Creating Posts');
  const post = orm.em.create(Post, {title: 'my first post'} as Post);
  await orm.em.persistAndFlush(post);
  console.log('--------------------sql2----------------');
  await orm.em.nativeInsert(Post, {title: 'my first post'});

}

main().catch(e => {
  console.error(e);
});
