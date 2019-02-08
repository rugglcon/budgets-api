CREATE DATABASE `budget_tracker` /*!40100 DEFAULT CHARACTER SET utf8 */;

CREATE TABLE `Users` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `LoggedIn` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `Tokens` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Token` varchar(64) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_Tokens_1_idx` (`UserID`),
  CONSTRAINT `fk_Tokens_UserID_Users_Id` FOREIGN KEY (`UserID`) REFERENCES `Users` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `Budgets` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `OwnerId` int(11) NOT NULL,
  `Name` varchar(45) NOT NULL,
  `Total` int(11) DEFAULT NULL,
  `ParentBudgetId` int(11) DEFAULT NULL,
  `LastEdited` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_Budgets_OwnerId_Users_Id_idx` (`OwnerId`),
  KEY `fk_Budgets_ParentBudgetId_Budgets_Id_idx` (`ParentBudgetId`),
  CONSTRAINT `fk_Budgets_OwnerId_Users_Id` FOREIGN KEY (`OwnerId`) REFERENCES `Users` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Budgets_ParentBudgetId_Budgets_Id` FOREIGN KEY (`ParentBudgetId`) REFERENCES `Budgets` (`Id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Expenses` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `BudgetId` int(11) NOT NULL,
  `Title` varchar(45) NOT NULL,
  `Cost` double NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_Expenses_BudgetId_Budgets_Id_idx` (`BudgetId`),
  CONSTRAINT `fk_Expenses_BudgetId_Budgets_Id` FOREIGN KEY (`BudgetId`) REFERENCES `Budgets` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
