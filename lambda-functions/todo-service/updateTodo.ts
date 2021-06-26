import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Todo from "./Todo";
import TodoEventDetails from "./TodoEventDetails";
var docClient = new AWS.DynamoDB.DocumentClient();
// https://stackoverflow.com/a/65572954/288746

const updateTodo = async (eventDetails: TodoEventDetails): Promise<Todo> => {
  const params: DocumentClient.UpdateItemInput = {
    TableName: process.env.TODOS_TABLE as string,
    Key: {
      id: eventDetails.id,
      username: eventDetails.username,
    },
    // set parameter for each column
    UpdateExpression: "set done = :done",
    // ConditionExpression: "attribute_exists(id)",
    //provide value for each parameter
    ExpressionAttributeValues: {
      ":done": eventDetails.done,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    console.log("Updating Todo... params: ", JSON.stringify(params, null, 4));

    const updatedTodo = await docClient.update(params).promise();

    console.log("Todo updated:", JSON.stringify(updatedTodo, null, 4));
    return updatedTodo.Attributes as Todo;
  } catch (error) {
    console.log("DynamoDB error: ", error);
    throw error;
  }
};

export default updateTodo;
