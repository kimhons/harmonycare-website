CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerSignupId` int NOT NULL,
	`referredSignupId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`rewardStatus` varchar(50) NOT NULL DEFAULT 'pending',
	`rewardType` varchar(50),
	`rewardValue` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `signups` ADD `referralCode` varchar(20);--> statement-breakpoint
ALTER TABLE `signups` ADD `ownReferralCode` varchar(20);--> statement-breakpoint
ALTER TABLE `signups` ADD CONSTRAINT `signups_ownReferralCode_unique` UNIQUE(`ownReferralCode`);