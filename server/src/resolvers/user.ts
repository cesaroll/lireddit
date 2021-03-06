import { MyContext } from 'src/types';
import { Resolver, Ctx, Mutation, Arg, InputType, Field, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import "express-session";
import { COOKIE_NAME } from '../constants';

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
   @Field(() => User, { nullable: true })
   user?: User;

   @Field(() => [FieldError], { nullable: true })
   errors?: FieldError[];
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(
    @Ctx()
    { req, em }: MyContext
  ): Promise<User | null> {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options')
    options: UsernamePasswordInput,
    @Ctx()
    { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length < 5) {
      return {
        errors: [
           {
             field: "username",
             message: "lenght must be 5 chars long or more"
           }
        ]
      }
    }

    if (options.password.length < 5) {
      return {
        errors: [
           {
             field: "password",
             message: "lenght must be 5 chars long or more"
           }
        ]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    } as User);

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code = '23505') {
        return {
          errors: [
            {
              field: "username",
              message: "username  already exists"
            }
          ]
        }
      }
    }

    // Store userId session, to set cookie to user and keep them logged in.
    req.session.userId = user.id;

    return {user};
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options')
    options: UsernamePasswordInput,
    @Ctx()
    {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username});

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Invaid user name"
          }
        ]
      };
    }

    if (!await argon2.verify(user.password, options.password)) {
      return {
        errors: [
          {
            field: "password",
            message: "Invaid password "
          }
        ]
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx()
    { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      // res.clearCookie(COOKIE_NAME);
      // res.clearCookie("qid");
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      resolve(true);
    }));
  }
}
