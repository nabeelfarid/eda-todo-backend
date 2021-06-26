import { EventBridgeHandler } from "aws-lambda";
// import AppSyncEventArguments from "./AppSyncEventArguments";
import createTodo from "./createTodo";
import updateTodo from "./updateTodo";
import deleteTodo from "./deleteTodo";
// import getTodos from "./getTodos";
import TodoEventDetails from "./TodoEventDetails";
// import TodoEvent from "./TodoEvent";
const appsync = require("aws-appsync");
const gql = require("graphql-tag");
require("cross-fetch/polyfill");

export const handler: EventBridgeHandler<string, TodoEventDetails, void> =
  async (event, context) => {
    console.log("event: ", JSON.stringify(event, null, 2));

    switch (event["detail-type"]) {
      // case process.env.EVENT_TYPE_GET_TODOS:
      //   console.log("getting Todos...");
      //   return await getTodos(username);
      case process.env.EVENT_TYPE_CREATE_TODO:
        console.log("creating Todo...");
        const todo = await createTodo(event.detail);

        const graphqlClient = new appsync.AWSAppSyncClient({
          url: process.env.APPSYNC_GRAPHQLENDPOINT as string,
          region: "us-east-2", //process.env.AWS_REGION as string,
          auth: {
            type: appsync.AUTH_TYPE.API_KEY,
            apiKey: process.env.APPSYNC_API_KEY as string,
          },
          disableOffline: true,
        });

        const mutation = gql`
          mutation GenerateAction(
            $id: ID!
            $title: String!
            $done: Boolean!
            $action: ACTIONS!
          ) {
            generateAction(
              id: $id
              title: $title
              done: $done
              action: $action
            ) {
              id
              title
              done
              action
            }
          }
        `;

        try {
          const response = await graphqlClient.mutate({
            mutation,
            variables: {
              ...todo,
              action: "CREATE_TODO",
            },
          });
          console.log(
            "GenerateAction CREATE_TODO called successfully:",
            JSON.stringify(response, null, 4)
          );
        } catch (error) {
          console.error("GenerateAction CREATE_TODO Error: ", error);
          throw error;
        }
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
