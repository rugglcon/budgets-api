import {MigrationInterface, QueryRunner} from "typeorm";

export class addScaleToBudgetAndExpense1561606288899 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `firstName` `firstName` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastName` `lastName` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `user` CHANGE `userName` `userName` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `user` CHANGE `email` `email` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `user` CHANGE `password` `password` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `expense` CHANGE `title` `title` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `expense` CHANGE `cost` `cost` decimal(2,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `budget` DROP INDEX `FK_854388e7f4b9e910f736dd0c552`");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `ownerId` `ownerId` int NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `name` `name` varchar(255) NULL DEFAULT null");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `total` `total` decimal(2,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `budget` ADD CONSTRAINT `FK_854388e7f4b9e910f736dd0c552` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `budget` DROP FOREIGN KEY `FK_854388e7f4b9e910f736dd0c552`");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `total` `total` decimal(2,0) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `name` `name` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `budget` CHANGE `ownerId` `ownerId` int NULL");
        await queryRunner.query("ALTER TABLE `budget` ADD CONSTRAINT `FK_854388e7f4b9e910f736dd0c552` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
        await queryRunner.query("ALTER TABLE `expense` CHANGE `cost` `cost` decimal(2,0) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `expense` CHANGE `title` `title` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `password` `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `email` `email` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `userName` `userName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `lastName` `lastName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `firstName` `firstName` varchar(255) NULL");
    }

}
