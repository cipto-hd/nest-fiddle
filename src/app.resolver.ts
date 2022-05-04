import {
  Args,
  ArgsType,
  Context,
  Field,
  InputType,
  ObjectType,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PubSub } from 'mercurius';

@ObjectType()
class GreetingOutput {
  @Field()
  message: string;
}

@ArgsType()
class MessageArg {
  @Field({ defaultValue: 'Hello Word!' })
  @IsOptional()
  content: string;
}

@InputType()
class MessageInput {
  @Field()
  @IsOptional()
  content: string;
}

@Resolver()
export class AppResolver {
  @Query(() => String)
  check() {
    return 'Check 123!';
  }

  @Query(() => String)
  sayHello(
    @Context('pubsub') pubSub: PubSub,
    // @Args() messageArg?: MessageArg,
    @Args({
      nullable: true,
      name: 'messageInput',
      defaultValue: { content: 'Hello World!' },
    })
    messageInput?: MessageInput,
  ): string {
    pubSub.publish({
      topic: 'helloSaid',
      payload: {
        // helloSaid: { message: messageArg.content },
        helloSaid: { message: messageInput.content },
      },
    });

    // return messageArg.content;
    return messageInput.content;
  }

  @Subscription(() => GreetingOutput)
  helloSaid(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('helloSaid');
  }
}
