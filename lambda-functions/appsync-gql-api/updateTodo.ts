import * as AWS from "aws-sdk";
import TodoEvent from "./TodoEvent";
const eventBridge = new AWS.EventBridge();

const updateTodo = async (
  id: string,
  done: boolean,
  username: string
): Promise<TodoEvent> => {
  try {
    var params = {
      Entries: [
        /* required */
        {
          EventBusName: process.env.EVENT_BUS_NAME as string,
          Source: process.env.EVENT_SOURCE as string,
          DetailType: process.env.EVENT_TYPE_UPDATE_TODO,
          Detail: JSON.stringify({ id, done, username }, null, 2),
        },
        /* more items */
      ],
    };
    console.log(
      "Creating UpdateTodo Event...",
      JSON.stringify(params, null, 4)
    );
    const response = await eventBridge.putEvents(params).promise();
    console.log("UpdateTodo Event created:", JSON.stringify(response, null, 4));
    if (response.FailedEntryCount === 0 && response.Entries?.length === 1) {
      return { id: response.Entries[0].EventId as string };
    } else {
      throw response;
    }
  } catch (error) {
    console.error("EventBridge Error", error);
    throw error;
  }
};

export default updateTodo;
