import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as moment from 'moment';


const prisma = new PrismaClient();

@Injectable()
export class AppointmentsService {
  constructor() {}
  
  async getAvailableSlots(date: string) {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const config = await prisma.configuration.findFirst();
    if (!config) {
      throw new BadRequestException('Configuration not found.');
    }

    const { slotDuration, operationalStartHour, operationalEndHour} = config;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(operationalStartHour, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(operationalEndHour, 0, 0, 0);
    const offset = 7 * 60;

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const unavailableHours = await prisma.unavailableHours.findMany();
    const availableSlots = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const nextTime = new Date(currentTime);
      nextTime.setMinutes(currentTime.getMinutes() + slotDuration);

      const isSlotTaken = appointments.some((appointment) => {
        const appointmentStartTime = new Date(appointment.startTime);
        const appointmentEndTime = new Date(appointment.endTime);
        return (
          (currentTime >= appointmentStartTime && currentTime < appointmentEndTime) ||
          (nextTime > appointmentStartTime && nextTime <= appointmentEndTime)
        );
      });

      const isUnavailable = unavailableHours.some((unavailableHour) => {
        const unavailableStart = new Date(selectedDate);
        unavailableStart.setHours(unavailableHour.startTime.getHours(), unavailableHour.startTime.getMinutes());
        const unavailableEnd = new Date(selectedDate);
        unavailableEnd.setHours(unavailableHour.endTime.getHours(), unavailableHour.endTime.getMinutes());

        return (currentTime >= unavailableStart && nextTime <= unavailableEnd);
      });

      const adjustTime = (date: Date) => {
        const gmtDate = new Date(date.getTime() + offset * 60 * 1000);
        return gmtDate.toISOString().split('T')[1].split('.')[0];
      };

      availableSlots.push({
        date: selectedDate.toISOString().split('T')[0],
        time: adjustTime(currentTime),
        slot: isSlotTaken || isUnavailable ? "0" : "1",
      });

      currentTime = nextTime;
    }

    return availableSlots;
  }

  async createAppointment(startTime: Date, slots: number) {
    const formattedStartTime = moment(startTime, 'YYYY-MM-DDTHH:mm:ss').toDate();
    const endTime = new Date(formattedStartTime);
    endTime.setMinutes(startTime.getMinutes() + slots * 30);
    const conflictingAppointments = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startTime: {
              lt: endTime,
            },
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    });

    if (conflictingAppointments) {
      throw new BadRequestException('The selected time slot is already booked.');
    }


    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: new Date(startTime.toISOString().split('T')[0]),
      },
    });

    if (holidays.length > 0) {
      throw new BadRequestException('The selected date is a public holiday.');
    }

    const unavailableHours = await prisma.unavailableHours.findMany();
    const isUnavailable = unavailableHours.some((unavailableHour) => {
      const unavailableStart = new Date(startTime);
      unavailableStart.setHours(unavailableHour.startTime.getHours(), unavailableHour.startTime.getMinutes());

      const unavailableEnd = new Date(startTime);
      unavailableEnd.setHours(unavailableHour.endTime.getHours(), unavailableHour.endTime.getMinutes());

      return (startTime >= unavailableStart && endTime <= unavailableEnd);
    });

    if (isUnavailable) {
      throw new BadRequestException('The selected time slot is during an unavailable period.');
    }
    
    return prisma.appointment.create({
      data: {
        startTime,
        endTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async configureSlot(duration: number, maxSlots: number, hours: { start: number; end: number }) {
    return prisma.configuration.create({
      data: {
        slotDuration: duration,
        maxSlotsPerAppointment: maxSlots,
        operationalStartHour: hours.start,
        operationalEndHour: hours.end,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
