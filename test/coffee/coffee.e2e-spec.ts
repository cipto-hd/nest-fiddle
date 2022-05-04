import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CoffeeModule } from 'src/coffee/coffee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { CreateCoffeeDto } from 'src/coffee/dtos/create-coffee.dto';

describe('[Feature] Coffee (e2e) - /coffeees', () => {
  let app: NestFastifyApplication;

  const coffee = {
    name: 'Shipwreck Roast',
    brand: 'Buddy brew',
    flavors: ['chocolate', 'vanilla'],
  };

  const expectedCoffee = expect.objectContaining({
    data: expect.objectContaining({
      ...coffee,
      flavors: expect.arrayContaining(
        coffee.flavors.map((name) => expect.objectContaining({ name })),
      ),
    }),
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeeModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
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
  });

  afterAll(async () => {
    app.close();
  });

  it('Create [POST /]', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/coffees',
      payload: coffee as CreateCoffeeDto,
    });
    expect(res.statusCode).toEqual(HttpStatus.CREATED);
    expect(JSON.parse(res.body)).toEqual(expectedCoffee);
  });
  it.todo('GetAll [GET /]');
  it.todo('GetOne [GET /:id]');
  it.todo('Update [PATCH /:id]');
  it.todo('Delete [DELETE /:id]');
});
