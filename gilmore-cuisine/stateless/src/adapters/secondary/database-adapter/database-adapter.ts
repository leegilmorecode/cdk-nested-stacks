import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { logger } from '@shared/index';

const dynamoDb = new DynamoDBClient({});

export async function upsert<T>(
  newItem: T,
  tableName: string,
  id: string
): Promise<T> {
  const params = {
    TableName: tableName,
    Item: marshall(newItem),
  };

  try {
    await dynamoDb.send(new PutItemCommand(params));

    logger.info(`item created with ID ${id} into ${tableName}`);

    return newItem;
  } catch (error) {
    console.error('error creating item:', error);
    throw error;
  }
}

export async function getAll<T>(tableName: string): Promise<T[]> {
  const allItems: T[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;
  let params: ScanCommandInput = {
    TableName: tableName,
  };

  do {
    if (lastEvaluatedKey) {
      params = {
        ...params,
        ExclusiveStartKey: lastEvaluatedKey,
      };
    }

    try {
      const data: ScanCommandOutput = await dynamoDb.send(
        new ScanCommand(params)
      );

      const items: T[] = data.Items
        ? data.Items.map((item) => unmarshall(item) as T)
        : [];

      allItems.push(...items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } catch (error) {
      console.error('Error scanning table:', error);
      throw error;
    }
  } while (lastEvaluatedKey);

  logger.info(`retrieved ${allItems.length} items from ${tableName}`);
  return allItems;
}
