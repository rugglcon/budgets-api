import {MigrationInterface, QueryRunner} from 'typeorm';

export class signUpDate1567315606899 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` ADD `signUpDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP COLUMN `signUpDate`');
    }

}
