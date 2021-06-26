import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as appsync from "@aws-cdk/aws-appsync";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";

export class EdaTodoBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, `${id}_userpool`, {
      userPoolName: `${id}_userpool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInCaseSensitive: true,
      // signInAliases: { email: true },
      userVerification: {
        emailSubject: "Todo App: Verify your email",
        // emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        // smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      `${id}_userpool_client`,
      {
        userPoolClientName: `${id}_userpool_client`,
        userPool,
      }
    );

    const appsyncApi = new appsync.GraphqlApi(
      this,
      `${id}_appsync_graphql_api`,
      {
        name: `${id}_appsync_graphql_api`,
        schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
          additionalAuthorizationModes: [
            {
              authorizationType: appsync.AuthorizationType.API_KEY,
              apiKeyConfig: {
                expires: cdk.Expiration.after(cdk.Duration.days(365)),
              },
            },
          ],
        },
        // xrayEnabled: true,
      }
    );

    const ddbTableTodos = new ddb.Table(this, `${id}_dynamoDb_table`, {
      tableName: `${id}_Todos`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "username",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const indexName = `${id}_Todos_Index_Local_Created`;
    ddbTableTodos.addLocalSecondaryIndex({
      indexName: indexName,
      sortKey: {
        name: "created",
        type: ddb.AttributeType.NUMBER,
      },
      projectionType: ddb.ProjectionType.ALL,
    });

    const bus = new events.EventBus(this, `${id}_eventbus`, {
      eventBusName: `${id}_eventbus`,
    });

    const gqlOperationGetTodos = "getTodos";
    const gqlOperationCreateTodo = "createTodo";
    const gqlOperationUpdateTodo = "updateTodo";
    const gqlOperationDeleteTodo = "deleteTodo";

    const eventSourceTodosGqlApi = "todos.graphql.api";

    const eventTypeCreateTodo = "CreateTodo";
    const eventTypeUpdateTodo = "UpdateTodo";
    const eventTypeDeleteTodo = "DeleteTodo";

    const lambdaGqlApi = new lambda.Function(
      this,
      `${id}_lambda_for_appsync_graphql_api`,
      {
        functionName: `${id}_lambda_for_appsync_graphql_api`,
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda-functions/appsync-gql-api"),
        handler: "main.handler",
        environment: {
          GQL_OPERATION_GET_TODOS: gqlOperationGetTodos,
          GQL_OPERATION_CREATE_TODO: gqlOperationCreateTodo,
          GQL_OPERATION_UPDATE_TODO: gqlOperationUpdateTodo,
          GQL_OPERATION_DELETE_TODO: gqlOperationDeleteTodo,
          EVENT_BUS_NAME: bus.eventBusName,
          EVENT_SOURCE: eventSourceTodosGqlApi,
          EVENT_TYPE_CREATE_TODO: eventTypeCreateTodo,
          EVENT_TYPE_UPDATE_TODO: eventTypeUpdateTodo,
          EVENT_TYPE_DELETE_TODO: eventTypeDeleteTodo,
          TODOS_TABLE: ddbTableTodos.tableName,
          TODOS_TABLE_LOCAL_INDEX_CREATED: indexName,
        },
      }
    );

    const lambdaTodosDataSource = appsyncApi.addLambdaDataSource(
      `${id}_lambda_datasource_for_appsync_graphql_api`,
      lambdaGqlApi
    );

    lambdaTodosDataSource.createResolver({
      fieldName: gqlOperationGetTodos,
      typeName: "Query",
    });

    lambdaTodosDataSource.createResolver({
      fieldName: gqlOperationCreateTodo,
      typeName: "Mutation",
    });

    lambdaTodosDataSource.createResolver({
      fieldName: gqlOperationUpdateTodo,
      typeName: "Mutation",
    });

    lambdaTodosDataSource.createResolver({
      fieldName: gqlOperationDeleteTodo,
      typeName: "Mutation",
    });

    //No DataSource for Mutation for notifying subscribers
    const appsyncNoDS = appsyncApi.addNoneDataSource("noDataSource", {
      name: "noDataSource",
      description: "Does not save incoming data anywhere",
    });

    /* Mutation for notifying Subscription */
    appsyncNoDS.createResolver({
      typeName: "Mutation",
      fieldName: "generateAction",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`{
        "version" : "2017-02-28",
        "payload": $util.toJson($context.arguments)
        }`),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });

    events.EventBus.grantAllPutEvents(lambdaGqlApi);

    const rule = new events.Rule(this, `${id}_todos_eventbus_rule`, {
      ruleName: `${id}_todos_eventbus_rule`,
      eventPattern: {
        source: [eventSourceTodosGqlApi],
        detailType: [
          eventTypeCreateTodo,
          eventTypeUpdateTodo,
          eventTypeDeleteTodo,
        ],
      },
      eventBus: bus,
    });

    const lambdaTodoService = new lambda.Function(
      this,
      `${id}_lambda_todo_service`,
      {
        functionName: `${id}_lambda_todo_service`,
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda-functions/todo-service"),
        handler: "main.handler",
        environment: {
          EVENT_TYPE_CREATE_TODO: eventTypeCreateTodo,
          EVENT_TYPE_UPDATE_TODO: eventTypeUpdateTodo,
          EVENT_TYPE_DELETE_TODO: eventTypeDeleteTodo,
          TODOS_TABLE: ddbTableTodos.tableName,
          TODOS_TABLE_LOCAL_INDEX_CREATED: indexName,
          // AWS_REGION: "us-east-2",
          APPSYNC_GRAPHQLENDPOINT: appsyncApi.graphqlUrl,
          APPSYNC_API_KEY: appsyncApi.apiKey as string,
        },
      }
    );

    rule.addTarget(new targets.LambdaFunction(lambdaTodoService));

    ddbTableTodos.grantFullAccess(lambdaGqlApi);
    ddbTableTodos.grantFullAccess(lambdaTodoService);

    const outputAppsyncUrl = new cdk.CfnOutput(this, "AppSyncUrl", {
      value: appsyncApi.graphqlUrl,
    });

    const outputAppsyncApiKey = new cdk.CfnOutput(this, "AppSyncApiKey", {
      value: appsyncApi.apiKey as string,
    });

    const outputUserPoolId = new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    const outputUserPoolClient = new cdk.CfnOutput(this, "UserPoolClient", {
      value: userPoolClient.userPoolClientId,
    });

    const outputTable = new cdk.CfnOutput(this, "Table", {
      value: ddbTableTodos.tableName,
    });

    const outputIndex = new cdk.CfnOutput(this, "LocalSecondaryIndex", {
      value: indexName,
    });

    const eventBus = new cdk.CfnOutput(this, "EventBus", {
      value: bus.eventBusName,
    });
  }
}
