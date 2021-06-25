import * as AWS from "aws-sdk";
import TodoEventDetails from "./TodoEventDetails";
var docClient = new AWS.DynamoDB.DocumentClient();

const deleteTodo = async (eventDetails: TodoEventDetails) => {
  try {
    var deletedTodo = await docClient
      .delete({
        TableName: process.env.TODOS_TABLE as string,
        Key: { id: eventDetails.id, username: eventDetails.username },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    console.log("Todo deleted:", JSON.stringify(deletedTodo, null, 4));
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default deleteTodo;
