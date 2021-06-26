import * as AWS from "aws-sdk";
import * as crypto from "crypto";
import TodoEventDetails from "./TodoEventDetails";
// import * as mutations from "./graphql/mutations";
// import { ACTIONS } from "./API";

const docClient = new AWS.DynamoDB.DocumentClient();

const createTodo = async (eventDetails: TodoEventDetails) => {
  const todo = {
    id: crypto.randomBytes(16).toString("hex"),
    title: eventDetails.title as string,
    done: false,
  };
  try {
    await docClient
      .put({
        TableName: process.env.TODOS_TABLE as string,
        Item: { ...todo, username: eventDetails.username, created: Date.now() },
      })
      .promise();
    console.log("New Todo created:", JSON.stringify(todo, null, 4));
    return todo;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default createTodo;
