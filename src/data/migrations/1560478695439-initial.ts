import {MigrationInterface, QueryRunner} from 'typeorm';

export class initial1560478695439 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('CREATE TABLE `token` (`id` int NOT NULL AUTO_INCREMENT, `tokenString` varchar(20) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await queryRunner.query('CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(255) NULL DEFAULT null, `lastName` varchar(255) NULL DEFAULT null, `userName` varchar(255) NULL DEFAULT null, `email` varchar(255) NULL DEFAULT null, `password` varchar(255) NULL DEFAULT null, `loggedIn` tinyint NOT NULL DEFAULT 0, `tokenId` int NULL DEFAULT null, UNIQUE INDEX `REL_63301650f99948e1ff5e0af00b` (`tokenId`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await queryRunner.query('CREATE TABLE `expense` (`id` int NOT NULL AUTO_INCREMENT, `budgetId` int NOT NULL, `title` varchar(255) NULL DEFAULT null, `cost` decimal(2) NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await queryRunner.query('CREATE TABLE `budget` (`id` int NOT NULL AUTO_INCREMENT, `ownerId` int NULL DEFAULT null, `name` varchar(255) NULL DEFAULT null, `total` decimal(2) NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await queryRunner.query('ALTER TABLE `user` ADD CONSTRAINT `FK_63301650f99948e1ff5e0af00b5` FOREIGN KEY (`tokenId`) REFERENCES `token`(`id`)');
        await queryRunner.query('ALTER TABLE `expense` ADD CONSTRAINT `FK_a09e4ae0273f63ed09f9eae0a30` FOREIGN KEY (`budgetId`) REFERENCES `budget`(`id`)');
        await queryRunner.query('ALTER TABLE `budget` ADD CONSTRAINT `FK_854388e7f4b9e910f736dd0c552` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`)');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `budget` DROP FOREIGN KEY `FK_854388e7f4b9e910f736dd0c552`');
        await queryRunner.query('ALTER TABLE `expense` DROP FOREIGN KEY `FK_a09e4ae0273f63ed09f9eae0a30`');
        await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_63301650f99948e1ff5e0af00b5`');
        await queryRunner.query('DROP TABLE `budget`');
        await queryRunner.query('DROP TABLE `expense`');
        await queryRunner.query('DROP INDEX `REL_63301650f99948e1ff5e0af00b` ON `user`');
        await queryRunner.query('DROP TABLE `user`');
        await queryRunner.query('DROP TABLE `token`');
    }

}
