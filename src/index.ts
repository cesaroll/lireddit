import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from 'express';

const main = async () => {
  console.log('Running main');
  console.log('__dirname:', __dirname);

  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();
  app.get('/', (_, res) => {
    res.send('Hello World!')
;  });
  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  });
}

main().catch(e => {
  console.error(e);
});
