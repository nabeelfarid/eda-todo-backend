/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TodoEvent = {
  __typename: "TodoEvent",
  id: string,
};

export enum ACTIONS {
  CREATE_TODO = "CREATE_TODO",
  UPDATE_TODO = "UPDATE_TODO",
  DELETE_TODO = "DELETE_TODO",
}


export type GenerateActionOutput = {
  __typename: "GenerateActionOutput",
  id: string,
  title: string,
  done: boolean,
  action: ACTIONS,
};

export type Todo = {
  __typename: "Todo",
  id: string,
  title: string,
  done: boolean,
};

export type CreateTodoMutationVariables = {
  title: string,
};

export type CreateTodoMutation = {
  createTodo:  {
    __typename: "TodoEvent",
    id: string,
  },
};

export type UpdateTodoMutationVariables = {
  id: string,
  done: boolean,
};

export type UpdateTodoMutation = {
  updateTodo:  {
    __typename: "TodoEvent",
    id: string,
  },
};

export type DeleteTodoMutationVariables = {
  id: string,
};

export type DeleteTodoMutation = {
  deleteTodo:  {
    __typename: "TodoEvent",
    id: string,
  },
};

export type GenerateActionMutationVariables = {
  id: string,
  title: string,
  done: boolean,
  action: ACTIONS,
};

export type GenerateActionMutation = {
  generateAction:  {
    __typename: "GenerateActionOutput",
    id: string,
    title: string,
    done: boolean,
    action: ACTIONS,
  },
};

export type GetTodosQuery = {
  getTodos:  Array< {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  } >,
};

export type OnGenerateActionSubscription = {
  onGenerateAction:  {
    __typename: "GenerateActionOutput",
    id: string,
    title: string,
    done: boolean,
    action: ACTIONS,
  },
};
