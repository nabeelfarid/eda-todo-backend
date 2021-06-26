import * as AWS from "aws-sdk";
import TodoEvent from "./TodoEvent";
const eventBridge = new AWS.EventBridge();

const generateTodoEvent = async (
  eventDetailType?: string,
  eventDetail?: string
): Promise<TodoEvent> => {
  try {
    var params: AWS.EventBridge.PutEventsRequest = {
      Entries: [
        /* required */
        {
          EventBusName: process.env.EVENT_BUS_NAME as string,
          Source: process.env.EVENT_SOURCE as string,
          DetailType: eventDetailType,
          Detail: eventDetail,
        },
        /* more items */
      ],
    };

    console.log(
      `Generating TodoEvent [${eventDetailType}]...`,
      JSON.stringify(params, null, 4)
    );

    const response = await eventBridge.putEvents(params).promise();

    if (response.FailedEntryCount === 0 && response.Entries?.length === 1) {
      console.log(
        `TodoEvent [${eventDetailType}] generated:`,
        JSON.stringify(response, null, 4)
      );

      return { id: response.Entries[0].EventId as string };
    } else {
      throw response;
    }
  } catch (error) {
    console.error(`Error generating Event [${eventDetailType}]`, error);
    throw error;
  }
};

export default generateTodoEvent;
