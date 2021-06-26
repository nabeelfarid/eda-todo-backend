import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as crypto from "crypto";
import Todo from "./Todo";
import TodoEventDetails from "./TodoEventDetails";

const docClient = new AWS.DynamoDB.DocumentClient();

const createTodo = async (eventDetails: TodoEventDetails): Promise<Todo> => {
  const todo: Todo = {
    id: crypto.randomBytes(16).toString("hex"),
    title: eventDetails.title as string,
    done: false,
  };

  const params: DocumentClient.PutItemInput = {
    TableName: process.env.TODOS_TABLE as string,
    Item: { ...todo, username: eventDetails.username, created: Date.now() },
  };

  try {
    console.log("Creating Todo... params: ", JSON.stringify(params, null, 4));

    await docClient.put(params).promise();

    console.log("New Todo created:", JSON.stringify(todo, null, 4));
    return todo;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default createTodo;
