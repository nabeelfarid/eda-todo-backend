const awsmobile = {
  aws_appsync_region: process.env.AWS_REGION,
  aws_appsync_graphqlEndpoint: process.env.APPSYNC_GRAPHQLENDPOINT,
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: process.env.APPSYNC_API_KEY,
};

export default awsmobile;
