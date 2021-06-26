import * as AWS from "aws-sdk";
import Todo from "./Todo";
import TodoEventDetails from "./TodoEventDetails";
var docClient = new AWS.DynamoDB.DocumentClient();

const deleteTodo = async (eventDetails: TodoEventDetails): Promise<Todo> => {
  try {
    var deletedTodo = await docClient
      .delete({
        TableName: process.env.TODOS_TABLE as string,
        Key: { id: eventDetails.id, username: eventDetails.username },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    console.log("Todo deleted:", JSON.stringify(deletedTodo, null, 4));
    return deletedTodo.Attributes as Todo;
  } catch (error) {
    console.log("Dynamo DB Error", error);
    throw error;
  }
};

export default deleteTodo;
