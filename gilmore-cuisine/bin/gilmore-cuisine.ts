#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { GilmoreCuisineStatefulStack } from '../stateful/stateful';
import { GilmoreCuisineStatelessStack } from '../stateless/stateless';

const stage = 'prod';

const app = new cdk.App();

const stateful = new GilmoreCuisineStatefulStack(
  app,
  'GilmoreCuisineStatefulStack',
  {
    stage,
  }
);

const stateless = new GilmoreCuisineStatelessStack(
  app,
  'GilmoreCuisineStatelessStack',
  {
    stage,
  }
);

// ensure stateful is deployed before stateless
stateless.addDependency(stateful);
