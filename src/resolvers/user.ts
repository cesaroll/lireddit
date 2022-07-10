import { MyContext } from 'src/types';
import { Resolver, Ctx, Mutation, Arg, InputType, Field, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';

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
  @Mutation(() => UserResponse)
  async register(
    @Arg('options')
    options: UsernamePasswordInput,
    @Ctx()
    {em}: MyContext
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
      userName: options.username,
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
              message: "Already exists"
            }
          ]
        }
      }
    }

    return {user};
  }

  @Query(() => UserResponse)
  async login(
    @Arg('options')
    options: UsernamePasswordInput,
    @Ctx()
    {em}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { userName: options.username});

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

    return { user };
  }
}
