import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';

interface ComputeResourcesProps extends cdk.NestedStackProps {
  stage: string;
  api: apigw.RestApi;
}

export class ComputeResources extends cdk.NestedStack {
  private api: apigw.RestApi;
  private table: dynamodb.Table;
  private bus: events.EventBus;

  constructor(scope: Construct, id: string, props: ComputeResourcesProps) {
    super(scope, id, props);

    this.api = props.api;

    // get an instance of the table from the stateful stack
    this.table = dynamodb.Table.fromTableName(
      this,
      'Table',
      `gilmore-cuisine-table-${props.stage}`
    ) as dynamodb.Table;

    // get an instance of the bus from the stateful stack
    this.bus = events.EventBus.fromEventBusName(
      this,
      'EventBus',
      `gilmore-cuisine-event-bus-${props.stage}`
    ) as events.EventBus;

    // create the lambda powertools config
    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'gilmore-cuisine-service',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'gilmore-cuisine',
    };

    // create the lambda functions
    const listBookingsLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'ListBookingsLambda', {
        functionName: `${props.stage}-gilmore-cuisine-list-bookings`,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          '../../src/adapters/primary/list-bookings/list-bookings.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: true,
        },
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
          BUS: this.bus.eventBusName,
        },
      });

    const createBookingLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateBookingLambda', {
        functionName: `${props.stage}-gilmore-cuisine-create-booking`,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          '../../src/adapters/primary/create-booking/create-booking.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: true,
        },
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
          BUS: this.bus.eventBusName,
        },
      });

    // table permissions for the functions
    this.table.grantReadData(listBookingsLambda);
    this.table.grantWriteData(createBookingLambda);

    // allow the function to publish messages
    this.bus.grantPutEventsTo(createBookingLambda);

    // add the lambda functions to the correct api resources
    const orders = this.api.root
      .getResource('v1')
      ?.getResource('bookings') as apigw.Resource;

    orders.addMethod(
      'GET',
      new apigw.LambdaIntegration(listBookingsLambda, {
        proxy: true,
      })
    );

    orders.addMethod(
      'POST',
      new apigw.LambdaIntegration(createBookingLambda, {
        proxy: true,
      })
    );
  }
}
