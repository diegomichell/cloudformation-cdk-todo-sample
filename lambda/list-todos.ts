import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME || "";

const createResponse = (
  body: Record<string, unknown>[] | string,
  statusCode = 200
) => {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
  };
};

const getAllTodos = async () => {
  const selectAllTodosCommand = new ScanCommand({
    TableName: tableName,
  });

  const res = await docClient.send(selectAllTodosCommand);
  return res;
};

export const handler = async () => {
  try {
    const response = await getAllTodos();

    return createResponse(response.Items || []);
  } catch (error) {
    console.error(error);
    return createResponse((error as Error).message, 500);
  }
};
