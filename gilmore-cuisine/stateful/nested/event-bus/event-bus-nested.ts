import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';

import { CloudWatchLogGroup } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

interface EventBusResourcesProps extends cdk.NestedStackProps {
  stage: string;
}

export class EventBusResources extends cdk.NestedStack {
  public bus: events.EventBus;

  constructor(scope: Construct, id: string, props: EventBusResourcesProps) {
    super(scope, id, props);

    // our event bus is a static resource
    this.bus = new events.EventBus(this, 'EventBus', {
      eventBusName: `gilmore-cuisine-event-bus-${props.stage}`,
    });
    this.bus.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // create a shared event bus log group
    const allEventLogs: logs.LogGroup = new logs.LogGroup(
      this,
      'event-bus-logs',
      {
        logGroupName: `gilmore-cuisine-event-bus-logs-${props.stage}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // log all events to cloudwatch so we can track what is happening and monitor
    // on the local bus
    new events.Rule(this, 'LogAllEventsToCloudwatch', {
      eventBus: this.bus,
      ruleName: 'LogAllEventsToCloudwatch',
      description: 'log all events',
      eventPattern: {
        source: [{ prefix: '' }] as any[],
      },
      targets: [new CloudWatchLogGroup(allEventLogs)],
    });
  }
}
