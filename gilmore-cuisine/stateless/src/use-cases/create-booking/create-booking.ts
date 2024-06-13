import { Booking, CreateBooking } from '@stateless/dto/booking';
import { logger, schemaValidator } from '@shared';

import { config } from '@config';
import { publishEvent } from '@stateless/adapters/secondary/event-adapter';
import { schema } from '@schemas/booking';
import { upsert } from '@stateless/adapters/secondary/database-adapter';
import { v4 as uuid } from 'uuid';

const tableName = config.get('tableName');
const eventBus = config.get('eventBus');

export async function createBookingUseCase(
  newBooking: CreateBooking
): Promise<Booking> {
  const booking: Booking = {
    id: uuid(),
    ...newBooking,
  };

  schemaValidator(schema, booking);

  logger.info(`booking with id ${booking.id} saved`);

  // add the item to the database
  await upsert(booking, tableName, booking.id);

  logger.info(`booking with id ${booking.id} created event published`);

  // publish the event to the bus
  await publishEvent(eventBus, 'CreateBooking', 'booking-service', {
    data: booking,
    metadata: {
      id: booking.id,
      domain: 'bookings',
      service: 'booking-service',
      type: 'event',
    },
  });

  return booking;
}
