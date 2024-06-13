import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger } from '@shared';

import { Bookings } from '@stateless/dto/booking';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { listBookingsUseCase } from '@stateless/use-cases/list-bookings';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import middy from '@middy/core';

const tracer = new Tracer();
const metrics = new Metrics();

export const listBookingsAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const bookings: Bookings = await listBookingsUseCase();

    metrics.addMetric('SuccessfulListBookings', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(bookings),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('ListBookingsError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(listBookingsAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
