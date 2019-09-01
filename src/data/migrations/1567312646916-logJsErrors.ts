import {MigrationInterface, QueryRunner} from 'typeorm';

export class logJsErrors1567312646916 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('CREATE TABLE `js_error` (`id` int NOT NULL AUTO_INCREMENT, `userAgent` varchar(255) NOT NULL, `stackTrace` text NOT NULL, `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `ipAddress` varchar(45) NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('DROP TABLE `js_error`');
    }

}
