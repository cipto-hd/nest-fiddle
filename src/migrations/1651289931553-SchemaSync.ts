import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaSync1651289931553 implements MigrationInterface {
  name = 'SchemaSync1651289931553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`coffees\` ADD \`description\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`coffees\` DROP COLUMN \`description\``,
    );
  }
}
