import {MigrationInterface, QueryRunner} from 'typeorm';

export class changeTokenLength1560487421834 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `token` DROP COLUMN `tokenString`');
        await queryRunner.query('ALTER TABLE `token` ADD `tokenString` varchar(35) NOT NULL');
        await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_63301650f99948e1ff5e0af00b5`');
        await queryRunner.query('ALTER TABLE `user` CHANGE `firstName` `firstName` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `user` CHANGE `lastName` `lastName` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `user` CHANGE `userName` `userName` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `user` CHANGE `email` `email` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `user` CHANGE `password` `password` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `user` CHANGE `tokenId` `tokenId` int NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `expense` CHANGE `title` `title` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `expense` CHANGE `cost` `cost` decimal(2) NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `budget` CHANGE `name` `name` varchar(255) NULL DEFAULT null');
        await queryRunner.query('ALTER TABLE `budget` CHANGE `total` `total` decimal(2) NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `user` ADD CONSTRAINT `FK_63301650f99948e1ff5e0af00b5` FOREIGN KEY (`tokenId`) REFERENCES `token`(`id`)');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user` DROP FOREIGN KEY `FK_63301650f99948e1ff5e0af00b5`');
        await queryRunner.query("ALTER TABLE `budget` CHANGE `total` `total` decimal(2,0) NOT NULL DEFAULT '0'");
        await queryRunner.query('ALTER TABLE `budget` CHANGE `name` `name` varchar(255) NULL');
        await queryRunner.query("ALTER TABLE `expense` CHANGE `cost` `cost` decimal(2,0) NOT NULL DEFAULT '0'");
        await queryRunner.query('ALTER TABLE `expense` CHANGE `title` `title` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `tokenId` `tokenId` int NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `password` `password` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `email` `email` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `userName` `userName` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `lastName` `lastName` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` CHANGE `firstName` `firstName` varchar(255) NULL');
        await queryRunner.query('ALTER TABLE `user` ADD CONSTRAINT `FK_63301650f99948e1ff5e0af00b5` FOREIGN KEY (`tokenId`) REFERENCES `token`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT');
        await queryRunner.query('ALTER TABLE `token` DROP COLUMN `tokenString`');
        await queryRunner.query('ALTER TABLE `token` ADD `tokenString` varchar(20) NOT NULL');
    }

}
