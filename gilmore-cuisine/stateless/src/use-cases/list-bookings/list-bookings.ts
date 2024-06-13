import { Booking, Bookings } from '@stateless/dto/booking';

import { config } from '@config';
import { getAll } from '@stateless/adapters/secondary/database-adapter';
import { logger } from '@shared';

const tableName = config.get('tableName');

export async function listBookingsUseCase(): Promise<Bookings> {
  logger.info('list existing bookings');

  const bookings: Booking[] = await getAll<Booking>(tableName);

  logger.info(`${bookings.length} existing bookings listed`);

  return {
    items: bookings,
  };
}
