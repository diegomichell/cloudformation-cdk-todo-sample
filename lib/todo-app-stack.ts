import * as cdk from "aws-cdk-lib";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as lamda from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { TodoBackend } from "./todo-backend";

export class TodoAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "TodoAppQueue", {
      visibilityTimeout: Duration.seconds(300),
    });

    const topic = new sns.Topic(this, "TodoAppTopic");

    topic.addSubscription(new subs.SqsSubscription(queue));

    const bucket = new s3.Bucket(this, "todo-app-bucket", {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const helloWorldFunction = new lamda.NodejsFunction(
      this,
      "HelloWorldFunction",
      {
        entry: "lambda/hello-world.ts",
        handler: "handler",
        memorySize: 256,
        timeout: Duration.seconds(5),
      }
    );
    
    const endpoint = new apiGateway.LambdaRestApi(this, "TodoAppEndpoint", {
      handler: helloWorldFunction,
    });

    const todoBackend = new TodoBackend(this, "TodoBackend", {});
  }
}
