CREATE TABLE `signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`facilityName` varchar(200) NOT NULL,
	`facilityType` varchar(100) NOT NULL,
	`residentCount` int NOT NULL,
	`tier` varchar(50) NOT NULL,
	`interestedFeatures` text,
	`additionalNeeds` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signups_id` PRIMARY KEY(`id`)
);
