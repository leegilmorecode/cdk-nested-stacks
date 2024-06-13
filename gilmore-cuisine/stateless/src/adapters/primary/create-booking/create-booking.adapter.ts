import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger, schemaValidator } from '@shared';

import { Booking } from '@stateless/dto/booking';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { ValidationError } from '@errors/validation-error';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { createBookingUseCase } from '@use-cases/create-booking';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import middy from '@middy/core';
import { schema } from './create-booking.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const createBookingAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const booking = JSON.parse(body) as Booking;

    schemaValidator(schema, booking);

    const created: Booking = await createBookingUseCase(booking);

    metrics.addMetric('SuccessfulCreateBooking', MetricUnit.Count, 1);

    return {
      statusCode: 201,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateBookingError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createBookingAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
