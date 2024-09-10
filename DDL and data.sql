CREATE TABLE public."Appointment" (
	id serial4 NOT NULL,
	"startTime" timestamp(3) NOT NULL,
	"endTime" timestamp(3) NOT NULL,
	"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp(3) NULL,
	CONSTRAINT "Appointment_pkey" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "Appointment_startTime_endTime_key" ON public."Appointment" USING btree ("startTime", "endTime");


CREATE TABLE public."Configuration" (
	id serial4 NOT NULL,
	"slotDuration" int4 NOT NULL,
	"maxSlotsPerAppointment" int4 NOT NULL,
	"operationalStartHour" int4 NOT NULL,
	"operationalEndHour" int4 NOT NULL,
	"createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp(3) NULL,
	"unavailableEndTime" timestamp(3) NULL,
	"unavailableStartTime" timestamp(3) NULL,
	CONSTRAINT "Configuration_pkey" PRIMARY KEY (id)
);


CREATE TABLE public."PublicHoliday" (
	id serial4 NOT NULL,
	"date" timestamp(3) NOT NULL,
	description text NULL,
	CONSTRAINT "PublicHoliday_pkey" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "PublicHoliday_date_key" ON public."PublicHoliday" USING btree (date);


CREATE TABLE public."UnavailableHours" (
	id serial4 NOT NULL,
	"startTime" timestamp(3) NOT NULL,
	"endTime" timestamp(3) NOT NULL,
	description text NULL,
	CONSTRAINT "UnavailableHours_pkey" PRIMARY KEY (id)
);



INSERT INTO public."Appointment" ("startTime","endTime","createdAt","updatedAt") VALUES
	 ('2024-09-11 03:00:00.000','2024-09-11 03:30:00.000','2024-09-10 03:05:53.351','2024-09-10 03:05:53.351'),
	 ('2024-09-11 03:30:00.000','2024-09-11 03:00:00.000','2024-09-10 03:07:25.050','2024-09-10 03:07:25.050');
	 
	 
INSERT INTO public."Configuration" ("slotDuration","maxSlotsPerAppointment","operationalStartHour","operationalEndHour","createdAt","updatedAt","unavailableEndTime","unavailableStartTime") VALUES
	 (30,1,9,18,'2024-09-10 09:23:00.194','2024-09-10 09:23:00.194',NULL,NULL);
	 
	 
INSERT INTO public."PublicHoliday" ("date",description) VALUES
	 ('2024-01-01 00:00:00.000','New Years Day'),
	 ('2024-03-25 00:00:00.000','Good Friday'),
	 ('2024-05-01 00:00:00.000','Labour Day'),
	 ('2024-08-17 00:00:00.000','Independence Day'),
	 ('2024-12-25 00:00:00.000','Christmas Day');
	 
INSERT INTO public."UnavailableHours" ("startTime","endTime",description) VALUES
	 ('2024-01-01 02:00:00.000','2024-01-01 02:30:00.000','Morning Team Meeting'),
	 ('2024-01-01 05:00:00.000','2024-01-01 06:00:00.000','Lunch Break');