import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  console.log('Running main');
  console.log('__dirname:', __dirname);

  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  console.log('Creating Posts');
  const post = orm.em.create(Post, {title: 'my first post'} as Post);
  await orm.em.persistAndFlush(post);

}

main().catch(e => {
  console.error(e);
});
