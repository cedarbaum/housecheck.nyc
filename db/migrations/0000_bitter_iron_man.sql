-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "metadata" (
	"dataset" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"last_updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "hpd_vacateorders" (
	"buildingid" integer,
	"registrationid" integer,
	"borough" text,
	"number" text,
	"street" text,
	"vacateordernumber" integer PRIMARY KEY NOT NULL,
	"primaryvacatereason" text,
	"vacatetype" text,
	"vacateeffectivedate" date,
	"rescinddate" date,
	"numberofvacatedunits" integer,
	"postcode" text,
	"latitude" numeric,
	"longitude" numeric,
	"communityboard" integer,
	"councildistrict" integer,
	"censustract" text,
	"bin" char(7),
	"bbl" char(10),
	"nta" text
);
--> statement-breakpoint
CREATE TABLE "hpd_litigations" (
	"litigationid" integer PRIMARY KEY NOT NULL,
	"buildingid" integer,
	"boro" integer,
	"housenumber" text,
	"streetname" text,
	"zip" text,
	"block" integer,
	"lot" integer,
	"casetype" text,
	"caseopendate" timestamp,
	"casestatus" text,
	"openjudgement" text,
	"findingofharassment" text,
	"findingdate" timestamp,
	"penalty" text,
	"respondent" text,
	"latitude" numeric,
	"longitude" numeric,
	"communitydistrict" text,
	"councildistrict" text,
	"censustract" text,
	"bin" char(7),
	"bbl" char(10),
	"nta" text
);
--> statement-breakpoint
CREATE TABLE "hpd_violations" (
	"violationid" integer PRIMARY KEY NOT NULL,
	"buildingid" integer,
	"registrationid" integer,
	"boroid" char(1),
	"borough" text,
	"housenumber" text,
	"lowhousenumber" text,
	"highhousenumber" text,
	"streetname" text,
	"streetcode" text,
	"postcode" char(5),
	"apartment" text,
	"story" text,
	"block" integer,
	"lot" integer,
	"class" char(1),
	"inspectiondate" date,
	"approveddate" date,
	"originalcertifybydate" date,
	"originalcorrectbydate" date,
	"newcertifybydate" date,
	"newcorrectbydate" date,
	"certifieddate" date,
	"ordernumber" text,
	"novid" integer,
	"novdescription" text,
	"novissueddate" date,
	"currentstatusid" smallint,
	"currentstatus" text,
	"currentstatusdate" date,
	"novtype" text,
	"violationstatus" text,
	"latitude" numeric,
	"longitude" numeric,
	"communityboard" text,
	"councildistrict" smallint,
	"censustract" text,
	"bin" char(7),
	"bbl" char(10),
	"nta" text,
	"rentimpairing" boolean
);
--> statement-breakpoint
CREATE TABLE "dob_violations" (
	"bbl" char(10),
	"isndobbisviol" text,
	"boro" char(1),
	"bin" char(7),
	"block" text,
	"lot" text,
	"issuedate" date,
	"violationtypecode" text,
	"violationnumber" text,
	"housenumber" text,
	"street" text,
	"dispositiondate" date,
	"dispositioncomments" text,
	"devicenumber" text,
	"description" text,
	"ecbnumber" text,
	"number" text PRIMARY KEY NOT NULL,
	"violationcategory" text,
	"violationtype" text
);
--> statement-breakpoint
CREATE TABLE "dob_complaints" (
	"complaintnumber" integer NOT NULL,
	"status" text NOT NULL,
	"dateentered" date NOT NULL,
	"housenumber" text,
	"zipcode" text,
	"housestreet" text,
	"bin" char(7) NOT NULL,
	"communityboard" integer,
	"specialdistrict" text,
	"complaintcategory" text NOT NULL,
	"unit" text,
	"dispositiondate" date,
	"dispositioncode" text,
	"inspectiondate" date,
	"dobrundate" date NOT NULL,
	CONSTRAINT "dob_complaints_pkey" PRIMARY KEY("complaintnumber","status","dateentered","bin","complaintcategory","dobrundate")
);
--> statement-breakpoint
CREATE TABLE "hpd_complaints_and_problems" (
	"receiveddate" date,
	"problemid" integer NOT NULL,
	"complaintid" integer NOT NULL,
	"buildingid" integer,
	"borough" text,
	"housenumber" text,
	"streetname" text,
	"postcode" text,
	"block" integer,
	"lot" integer,
	"apartment" text,
	"communityboard" integer,
	"unittype" text,
	"spacetype" text,
	"type" text,
	"majorcategory" text,
	"minorcategory" text,
	"problemcode" text,
	"complaintstatus" text,
	"complaintstatusdate" date,
	"problemstatus" text,
	"problemstatusdate" date,
	"statusdescription" text,
	"problemduplicateflag" boolean,
	"complaintanonymousflag" boolean,
	"uniquekey" text,
	"latitude" numeric,
	"longitude" numeric,
	"councildistrict" char(2),
	"censustract" text,
	"bin" char(7),
	"bbl" char(10),
	"nta" text,
	CONSTRAINT "hpd_complaints_and_problems_pkey" PRIMARY KEY("problemid","complaintid")
);
--> statement-breakpoint
CREATE INDEX "hpd_vacateorders_bbl_idx" ON "hpd_vacateorders" USING btree ("bbl" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_vacateorders_bin_idx" ON "hpd_vacateorders" USING btree ("bin" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_vacateorders_borough_idx" ON "hpd_vacateorders" USING btree ("borough" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_vacateorders_number_idx" ON "hpd_vacateorders" USING btree ("number" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_vacateorders_street_idx" ON "hpd_vacateorders" USING btree ("street" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_litigations_bbl_idx" ON "hpd_litigations" USING btree ("bbl" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_litigations_bin_idx" ON "hpd_litigations" USING btree ("bin" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_litigations_boro_idx" ON "hpd_litigations" USING btree ("boro" int4_ops);--> statement-breakpoint
CREATE INDEX "hpd_litigations_housenumber_idx" ON "hpd_litigations" USING btree ("housenumber" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_litigations_streetname_idx" ON "hpd_litigations" USING btree ("streetname" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_violations_bbl_idx" ON "hpd_violations" USING btree ("bbl" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_violations_bin_idx" ON "hpd_violations" USING btree ("bin" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_violations_borough_idx" ON "hpd_violations" USING btree ("borough" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_violations_housenumber_idx" ON "hpd_violations" USING btree ("housenumber" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_violations_streetname_idx" ON "hpd_violations" USING btree ("streetname" text_ops);--> statement-breakpoint
CREATE INDEX "dob_violations_bbl_idx" ON "dob_violations" USING btree ("bbl" bpchar_ops);--> statement-breakpoint
CREATE INDEX "dob_violations_bin_idx" ON "dob_violations" USING btree ("bin" bpchar_ops);--> statement-breakpoint
CREATE INDEX "dob_violations_boro_idx" ON "dob_violations" USING btree ("boro" bpchar_ops);--> statement-breakpoint
CREATE INDEX "dob_violations_housenumber_idx" ON "dob_violations" USING btree ("housenumber" text_ops);--> statement-breakpoint
CREATE INDEX "dob_violations_street_idx" ON "dob_violations" USING btree ("street" text_ops);--> statement-breakpoint
CREATE INDEX "dob_complaints_housenumber_idx" ON "dob_complaints" USING btree ("housenumber" text_ops);--> statement-breakpoint
CREATE INDEX "dob_complaints_housestreet_idx" ON "dob_complaints" USING btree ("housestreet" text_ops);--> statement-breakpoint
CREATE INDEX "dob_complaints_zipcode_idx" ON "dob_complaints" USING btree ("zipcode" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_complaints_and_problems_bbl_idx" ON "hpd_complaints_and_problems" USING btree ("bbl" bpchar_ops);--> statement-breakpoint
CREATE INDEX "hpd_complaints_and_problems_borough_idx" ON "hpd_complaints_and_problems" USING btree ("borough" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_complaints_and_problems_buildingid_idx" ON "hpd_complaints_and_problems" USING btree ("buildingid" int4_ops);--> statement-breakpoint
CREATE INDEX "hpd_complaints_and_problems_housenumber_idx" ON "hpd_complaints_and_problems" USING btree ("housenumber" text_ops);--> statement-breakpoint
CREATE INDEX "hpd_complaints_and_problems_streetname_idx" ON "hpd_complaints_and_problems" USING btree ("streetname" text_ops);
*/