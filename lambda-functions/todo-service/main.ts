import { EventBridgeHandler } from "aws-lambda";
// import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import updateTodo from "./updateTodo";
import deleteTodo from "./deleteTodo";
// import getTodos from "./getTodos";
import TodoEventDetails from "./TodoEventDetails";
// import TodoEvent from "./TodoEvent";

export const handler: EventBridgeHandler<string, TodoEventDetails, void> =
  async (event, context) => {
    console.log("event: ", JSON.stringify(event, null, 2));

    switch (event["detail-type"]) {
      // case process.env.EVENT_TYPE_GET_TODOS:
      //   console.log("getting Todos...");
      //   return await getTodos(username);
      case process.env.EVENT_TYPE_CREATE_TODO:
        console.log("creating Todo...");
        await createTodo(event.detail);
        break;
      case process.env.EVENT_TYPE_UPDATE_TODO:
        console.log("updating Todo...");
        await updateTodo(event.detail);
        break;
      case process.env.EVENT_TYPE_DELETE_TODO:
        console.log("deleting Todo...");
        await deleteTodo(event.detail);
        break;
      default:
        throw new Error("Event Detail-Type Not Found");
    }
  };
