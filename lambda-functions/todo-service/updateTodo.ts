import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import TodoEventDetails from "./TodoEventDetails";
var docClient = new AWS.DynamoDB.DocumentClient();
// https://stackoverflow.com/a/65572954/288746

const updateTodo = async (eventDetails: TodoEventDetails) => {
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

  console.log("params: ", JSON.stringify(params, null, 4));
  try {
    const updatedTodo = await docClient.update(params).promise();

    console.log("Todo updated:", JSON.stringify(updatedTodo, null, 4));
  } catch (error) {
    console.log("DynamoDB error: ", error);
    throw error;
  }
};

export default updateTodo;
