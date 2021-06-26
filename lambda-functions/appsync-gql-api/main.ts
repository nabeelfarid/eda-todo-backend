import { AppSyncResolverHandler } from "aws-lambda";
import AppSyncEventArguments from "./AppSyncEventArguments";
import Todo from "./Todo";
import TodoEvent from "./TodoEvent";
import getTodos from "./getTodos";
import generateTodoEvent from "./generateTodoEvent";

export const handler: AppSyncResolverHandler<
  AppSyncEventArguments,
  Todo | TodoEvent
> = async (event) => {
  console.log("operation: ", event.info.fieldName);
  console.log("identity: ", JSON.stringify(event.identity, null, 2));
  console.log("event: ", JSON.stringify(event, null, 2));

  const username = event.identity?.username as string;

  switch (event.info.fieldName) {
    case process.env.GQL_OPERATION_GET_TODOS:
      return await getTodos(username);
    case process.env.GQL_OPERATION_CREATE_TODO:
      return await generateTodoEvent(
        process.env.EVENT_TYPE_CREATE_TODO,
        JSON.stringify({ ...event.arguments, username }, null, 2)
      );
    case process.env.GQL_OPERATION_UPDATE_TODO:
      return await generateTodoEvent(
        process.env.EVENT_TYPE_UPDATE_TODO,
        JSON.stringify({ ...event.arguments, username }, null, 2)
      );
    case process.env.GQL_OPERATION_DELETE_TODO:
      return await generateTodoEvent(
        process.env.EVENT_TYPE_DELETE_TODO,
        JSON.stringify({ ...event.arguments, username }, null, 2)
      );
    default:
      throw new Error("Query/Mutation/Subscription Not Found");
  }
};
