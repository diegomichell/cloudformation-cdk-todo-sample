import { StackProps } from "aws-cdk-lib";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lamda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class TodoBackend extends Construct {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const todoTable = new dynamodb.Table(this, "TodoTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const listTodosFunction = new lamda.NodejsFunction(
      this,
      "ListTodosFunction",
      {
        entry: "lambda/list-todos.ts",
        handler: "handler",
        environment: {
          TABLE_NAME: todoTable.tableName,
        },
      }
    );
    todoTable.grantReadData(listTodosFunction);

    const createTodoFunction = new lamda.NodejsFunction(
      this,
      "CreateTodoFunction",
      {
        entry: "lambda/create-todo.ts",
        handler: "handler",
        environment: {
          TABLE_NAME: todoTable.tableName,
        },
      }
    );
    todoTable.grantReadWriteData(createTodoFunction);

    const todosRestApi = new apiGateway.RestApi(this, "TodoRestApi", {
      restApiName: "Todo Rest Api",
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });

    const todosResource = todosRestApi.root.addResource("todos");

    todosResource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(listTodosFunction)
    );

    todosResource.addMethod(
      "POST",
      new apiGateway.LambdaIntegration(createTodoFunction)
    );
  }
}
