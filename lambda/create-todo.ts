import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME || "";

interface ITodo {
  id: string;
  title: string;
}

const createResponse = (body: string, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
  };
};

const createTodo = async (todo: ITodo) => {
  const createTodoCommand = new PutCommand({
    TableName: tableName,
    Item: {
      ...todo,
      id: todo.id || uuid(),
    },
  });

  const res = await docClient.send(createTodoCommand);

  return res;
};

export const handler = async (event: APIGatewayEvent) => {
  try {
    const { body } = event;
    const todo = JSON.parse(body || "{}");
    const response = await createTodo(todo);

    if (!response) {
      return createResponse("Todo not created", 400);
    }

    return createResponse("Todo created succesfully");
  } catch (error) {
    console.error(error);
    return createResponse((error as Error).message, 500);
  }
};
