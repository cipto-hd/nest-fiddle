import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { createMercuriusTestClient } from 'mercurius-integration-testing';
import { AppModule } from 'src/app.module';

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

describe('AppModule GraphQL (e2e)', () => {
  let app: NestFastifyApplication;
  let testClient, subscription;
  const message = 'Salam';
  const defaultMessage = 'Hello World!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          database: 'nestjs_fiddle_test',
          username: 'postgres',
          password: 'bismillah',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(
      new WrapResponseInterceptor(),
      new TimeoutInterceptor(),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    testClient = createMercuriusTestClient(app.getHttpAdapter().getInstance());
  });

  afterAll(async () => {
    subscription.unsubscribe();
    app.close();
  });

  describe('Query', () => {
    it('should response with string from DB', async () => {
      const query = `
        query {
          check
        }
      `;

      const expectedResponse = {
        data: {
          check: expect.any(String),
        },
      };

      const res = await testClient.query(query);

      expect(res).toEqual(expectedResponse);
      // check if string is indeed from DB
      expect(res.data.check).toBe('Test Coffee'); //data I set in the DB
    });

    /**
     * For subscription to work, we need to wait a hot second for the sub to connect, see below
     * which message received by subscription  test, cannot be predicted
     * therefore we expect with any string
     */
    it('Subscription', async () => {
      /** Subscribe first, subscribe for helloSaid event */
      const subscriptionQuery = `
      subscription {
        helloSaid {
          message
        }
      }
    `;
      subscription = await testClient.subscribe({
        query: subscriptionQuery,
        onData(response) {
          expect(response).toEqual({
            data: { helloSaid: { message: expect.any(String) } },
          });
        },
      });

      await sleep(500); // we need to wait a hot second here for the sub to connect
    });

    it('should response with default message', async () => {
      const query = `
        query {
          sayHello
        }
      `;

      const expectedResponse = {
        data: {
          sayHello: defaultMessage,
        },
      };

      /** Query to publish helloSaid event */
      expect(await testClient.query(query)).toEqual(expectedResponse);
    });

    it('should response with custom message', async () => {
      const query = `
        query($message: String!) {
          sayHello(messageInput: {content: $message})
        }
      `;

      const queryOptions = {
        variables: {
          message,
        },
      };

      const expectedResponse = {
        data: {
          sayHello: message,
        },
      };

      /** Query to publish helloSaid event */
      expect(await testClient.query(query, queryOptions)).toEqual(
        expectedResponse,
      );
    });
  });
});
