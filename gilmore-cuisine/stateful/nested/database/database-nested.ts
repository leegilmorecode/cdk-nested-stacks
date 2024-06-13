import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

interface DatabaseResourcesProps extends cdk.NestedStackProps {
  stage: string;
}

export class DatabaseResources extends cdk.NestedStack {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseResourcesProps) {
    super(scope, id, props);

    // our database is a static resource
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: `gilmore-cuisine-table-${props.stage}`,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
