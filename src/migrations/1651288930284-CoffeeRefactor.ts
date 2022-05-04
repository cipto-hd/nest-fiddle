import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoffeeRefactor1651288930284 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('coffees', 'name', 'title');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('coffees', 'title', 'name');
  }
}
