import { EventBridgeHandler } from "aws-lambda";
// import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import updateTodo from "./updateTodo";
import deleteTodo from "./deleteTodo";
// import getTodos from "./getTodos";
import TodoEventDetails from "./TodoEventDetails";
import generateAction, { ACTIONS } from "./generateAction";
import Todo from "./Todo";
// import TodoEvent from "./TodoEvent";

export const handler: EventBridgeHandler<string, TodoEventDetails, void> =
  async (event, context) => {
    console.log("event: ", JSON.stringify(event, null, 2));
    let todo: Todo;
    switch (event["detail-type"]) {
      case process.env.EVENT_TYPE_CREATE_TODO:
        todo = await createTodo(event.detail);
        await generateAction(todo, ACTIONS.CREATE_TODO);
        break;
      case process.env.EVENT_TYPE_UPDATE_TODO:
        todo = await updateTodo(event.detail);
        await generateAction(todo, ACTIONS.UPDATE_TODO);
        break;
      case process.env.EVENT_TYPE_DELETE_TODO:
        todo = await deleteTodo(event.detail);
        await generateAction(todo, ACTIONS.DELETE_TODO);
        break;
      default:
        throw new Error("Event Detail-Type Not Found");
    }
  };
