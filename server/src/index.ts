import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import session from "express-session";
import cors from "cors";

const main = async () => {
  console.log('Running main');
  console.log('__dirname:', __dirname);

  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  // const session = require("express-session")
  const RedisStore = require("connect-redis")(session);

  // redis@v4
  const { createClient } = require("redis");
  const redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }
  ));

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "kdljfkalj5etjo65ig965wrf549nflk9",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  });
}

main().catch(e => {
  console.error(e);
});
