import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { DatabaseResources } from './nested/database/database-nested';
import { EventBusResources } from './nested/event-bus/event-bus-nested';

export interface GilmoreCuisineStatefulStackProps extends cdk.StackProps {
  stage: string;
}

export class GilmoreCuisineStatefulStack extends cdk.Stack {
  public databaseResources: DatabaseResources;
  public eventBusResources: EventBusResources;

  constructor(
    scope: Construct,
    id: string,
    props: GilmoreCuisineStatefulStackProps
  ) {
    super(scope, id, props);

    // we pull in the two stateful nested stacks
    this.databaseResources = new DatabaseResources(this, 'DatabaseResources', {
      stage: props.stage,
    });

    this.eventBusResources = new EventBusResources(this, 'EventBusResources', {
      stage: props.stage,
    });
  }
}
