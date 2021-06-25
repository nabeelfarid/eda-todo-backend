import { AppSyncResolverHandler } from "aws-lambda";
import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import deleteTodo from "./deleteTodo";
import getTodos from "./getTodos";
import Todo from "./Todo";
import TodoEvent from "./TodoEvent";
import updateTodo from "./updateTodo";

export const handler: AppSyncResolverHandler<
  AppSyncEventArguments,
  Todo | TodoEvent
> = async (event) => {
  console.log("event: ", JSON.stringify(event.identity, null, 2));
  console.log("operation name: ", event.info.fieldName);
  const username = event.identity?.username as string;
  switch (event.info.fieldName) {
    case process.env.GQL_OPERATION_GET_TODOS:
      console.log("getting Todos...");
      return await getTodos(username);
    case process.env.GQL_OPERATION_CREATE_TODO:
      console.log("creating Todo Event...");
      return await createTodo(event.arguments.title, username);
    case process.env.GQL_OPERATION_UPDATE_TODO:
      console.log("updating Todo...");
      return await updateTodo(
        event.arguments.id,
        event.arguments.done,
        username
      );
    case process.env.GQL_OPERATION_DELETE_TODO:
      console.log("deleting Todo...");
      return await deleteTodo(event.arguments.id, username);
    default:
      throw new Error("Query/Mutation/Subscription Not Found");
  }
};
