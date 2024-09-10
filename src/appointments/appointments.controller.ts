import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment(@Body() body: { startTime: string; slots: number }) {
    const { startTime, slots } = body;

    // Validasi dan konversi format startTime
    const startTimeDate = this.parseDate(startTime);
    if (!startTimeDate) {
      throw new BadRequestException('Invalid startTime format. It must be in the format "YYYY-MM-DD HH:mm:ss".');
    }

    if (!Number.isInteger(slots) || slots !== 1) {
      throw new BadRequestException('Slots must be an integer and equal to 1.');
    }

    return this.appointmentsService.createAppointment(startTimeDate, slots);
  }

  @Get('/available-slots')
  async getAvailableSlots(@Query('date') date: string) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Invalid date format. It must be a valid date string.');
    }

    return this.appointmentsService.getAvailableSlots(date);
  }

  private parseDate(dateString: string): Date | null {
    const match = dateString.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
      return date;
    }
    return null;
  }
}
