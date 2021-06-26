import Todo from "./Todo";

const appsync = require("aws-appsync");
const gql = require("graphql-tag");
require("cross-fetch/polyfill");

export enum ACTIONS {
  CREATE_TODO = "CREATE_TODO",
  UPDATE_TODO = "UPDATE_TODO",
  DELETE_TODO = "DELETE_TODO",
}

const generateAction = async (todo: Todo, action: ACTIONS) => {
  const graphqlClient = new appsync.AWSAppSyncClient({
    url: process.env.APPSYNC_GRAPHQLENDPOINT as string,
    region: process.env.AWS_REGION as string,
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
      generateAction(id: $id, title: $title, done: $done, action: $action) {
        id
        title
        done
        action
      }
    }
  `;
  console.log(`Generating Action ${action} ...`, JSON.stringify(todo, null, 4));
  try {
    const response = await graphqlClient.mutate({
      mutation,
      variables: {
        ...todo,
        action,
      },
    });
    console.log(
      `GenerateAction ${action} called successfully: `,
      JSON.stringify(response, null, 4)
    );
  } catch (error) {
    console.error(`GenerateAction ${action} Error: `, error);
    throw error;
  }
};

export default generateAction;
