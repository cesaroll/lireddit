import { MyContext } from 'src/types';
import { Resolver, Ctx, Mutation, Arg, InputType, Field } from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options')
    options: UsernamePasswordInput,
    @Ctx()
    {em}: MyContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      userName: options.username,
      password: hashedPassword
    } as User);
    await em.persistAndFlush(user);
    return user;
  }
}
