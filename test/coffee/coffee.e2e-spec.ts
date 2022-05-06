import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CoffeeModule } from 'src/coffee/coffee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpStatus, NotFoundException, ValidationPipe } from '@nestjs/common';
import { WrapResponseInterceptor } from 'src/common/interceptors/wrap-response.interceptor';
import { TimeoutInterceptor } from 'src/common/interceptors/timeout.interceptor';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { CreateCoffeeDto } from 'src/coffee/dtos/create-coffee.dto';
import { UpdateCoffeeDto } from 'src/coffee/dtos/update-coffee.dto';
import { FlavorEntity } from 'src/coffee/entities/flavor.entity';

describe('[Feature] Coffee (e2e) - /coffeees', () => {
  let app: NestFastifyApplication;
  let createdCoffee;

  const coffee = {
    name: 'Shipwreck Roast',
    brand: 'Buddy brew',
    flavors: ['chocolate', 'vanilla'],
  };

  const expectedCoffee = expect.objectContaining({
    ...coffee,
    flavors: expect.arrayContaining(
      coffee.flavors.map((name) => expect.objectContaining({ name })),
    ),
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeeModule,
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

    const res = await app.inject({
      method: 'POST',
      url: '/coffees',
      payload: coffee as CreateCoffeeDto,
    });
    createdCoffee = JSON.parse(res.body).data;
  });

  afterAll(async () => {
    app.close();
  });

  describe('Create [POST /]', () => {
    it('should return the created coffee on success', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/coffees',
        payload: coffee as CreateCoffeeDto,
      });
      expect(res.statusCode).toEqual(HttpStatus.CREATED);
      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({ data: expectedCoffee }),
      );
    });
  });

  describe('GetAll [GET /]', () => {
    it('should return an array of coffee', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/coffees',
      });
      expect(res.statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([expectedCoffee]),
        }),
      );
    });
  });

  describe('GetOne [GET /:id]', () => {
    it('shoudl return coffee on success', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/coffees/${createdCoffee.id}`,
      });
      expect(res.statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({ data: expectedCoffee }),
      );
    });
  });

  describe('Update [PATCH /:id]', () => {
    it('should return coffee with updated data', async () => {
      const newFlavors = ['yes', 'vanilla'];
      let mergedFlavors: string[] = [];
      mergedFlavors = createdCoffee.flavors.map(
        (flavor: FlavorEntity) => flavor.name,
      );

      newFlavors.map((flavor) => {
        !mergedFlavors.includes(flavor) && mergedFlavors.push(flavor);
      });

      const res = await app.inject({
        method: 'PATCH',
        url: `/coffees/${createdCoffee.id}`,
        payload: { flavors: newFlavors } as UpdateCoffeeDto,
      });

      expect(res.statusCode).toEqual(HttpStatus.OK);

      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            ...coffee,
            flavors: expect.arrayContaining(
              mergedFlavors.map((flavor: string) =>
                expect.objectContaining({ name: flavor }),
              ),
            ),
          }),
        }),
      );
    });
  });

  describe('Delete [DELETE /:id]', () => {
    it('should return the deleted coffee on success', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/coffees/${createdCoffee.id}`,
      });
      expect(res.statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({ data: expectedCoffee }),
      );
    });

    it('should return the NotfoundException otherwise', async () => {
      try {
        await app.inject({
          method: 'GET',
          url: `/coffees/${createdCoffee.id}`,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(
          `Coffee with ID #${createdCoffee.id} was not found`,
        );
      }
    });
  });
});
