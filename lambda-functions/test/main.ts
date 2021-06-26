const appsync = require("aws-appsync");
const gql = require("graphql-tag");
require("cross-fetch/polyfill");

exports.handler = async (event: any) => {
  console.log("event:", JSON.stringify(event, null, 4));
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
    mutation Test($value: String!) {
      test(value: $value)
    }
  `;
  try {
    const response = await graphqlClient.mutate({
      mutation,
      variables: {
        value: "test",
      },
    });
    console.log("Test called successfully:", JSON.stringify(response, null, 4));
  } catch (error) {
    console.error("Test Error: ", error);
    throw error;
  }
};
