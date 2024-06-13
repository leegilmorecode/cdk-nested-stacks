import * as cdk from 'aws-cdk-lib';

import { ApiResources } from './nested/api/api-nested';
import { ComputeResources } from './nested/compute/compute-nested';
import { Construct } from 'constructs';

export interface GilmoreCuisineStatelessStackProps extends cdk.StackProps {
  stage: string;
}

export class GilmoreCuisineStatelessStack extends cdk.Stack {
  public apiResources: ApiResources;
  public computeResources: ComputeResources;

  constructor(
    scope: Construct,
    id: string,
    props: GilmoreCuisineStatelessStackProps
  ) {
    super(scope, id, props);

    // we pull in the two stateless nested stacks
    this.apiResources = new ApiResources(this, 'ApiResources', {
      stage: props.stage,
    });

    this.computeResources = new ComputeResources(this, 'ComputeResources', {
      stage: props.stage,
      api: this.apiResources.api,
    });
  }
}
