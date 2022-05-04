import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Repository } from 'typeorm';
import { CoffeeService } from './coffee.service';
import { CoffeeRepository } from './repositories/coffee.repository';
import { FlavorRepository } from './repositories/flavor.repository';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('CoffeeService', () => {
  let service: CoffeeService;
  let coffeeRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Connection,
          useValue: {},
        },
        {
          provide: FlavorRepository,
          useValue: createMockRepository(),
        },
        {
          provide: CoffeeRepository,
          useValue: createMockRepository(),
        },
        CoffeeService,
      ],
    }).compile();

    service = module.get<CoffeeService>(CoffeeService);
    coffeeRepository = module.get<CoffeeRepository, MockRepository>(
      CoffeeRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOne', () => {
    describe('when coffee with ID exists', () => {
      it('should return the coffee object', async () => {
        const coffeeId = 1;
        const expectedCoffee = {};
        coffeeRepository.findOne.mockResolvedValue(expectedCoffee);

        const coffee = await service.getOne(coffeeId);
        expect(coffee).toEqual(expectedCoffee);
      });
    });

    describe('otherwise', () => {
      it('should return the NotfoundException', async () => {
        const coffeeId = 1;
        coffeeRepository.findOne.mockResolvedValue(undefined);

        try {
          await service.getOne(coffeeId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toEqual(
            `Coffee with ID #${coffeeId} was not found`,
          );
        }
      });
    });
  });
});
