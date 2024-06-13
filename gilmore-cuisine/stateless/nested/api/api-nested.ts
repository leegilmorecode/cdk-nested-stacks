import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

interface ApiResourcesProps extends cdk.NestedStackProps {
  stage: string;
}

export class ApiResources extends cdk.NestedStack {
  public api: apigw.RestApi;

  constructor(scope: Construct, id: string, props: ApiResourcesProps) {
    super(scope, id, props);

    // create the api for the service
    this.api = new apigw.RestApi(this, 'Api', {
      description: `(${props.stage}) API`,
      restApiName: `gilmore-cuisine-api-${props.stage}`,
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create our api and resources
    const root: apigw.Resource = this.api.root.addResource('v1');
    root.addResource('bookings');
  }
}
