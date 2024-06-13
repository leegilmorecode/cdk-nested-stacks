import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

import { logger } from '@shared/index';

const eventBridge = new EventBridgeClient({});

export async function publishEvent<T>(
  eventBusName: string,
  detailType: string,
  source: string,
  detail: T
): Promise<void> {
  const params = {
    Entries: [
      {
        EventBusName: eventBusName,
        DetailType: detailType,
        Source: source,
        Detail: JSON.stringify(detail),
      },
    ],
  };

  try {
    await eventBridge.send(new PutEventsCommand(params));
    logger.info(
      `event published to bus ${eventBusName} with detail type ${detailType}`
    );
  } catch (error) {
    console.error('error publishing event: ', error);
    throw error;
  }
}
