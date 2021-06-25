/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodo = /* GraphQL */ `
  mutation CreateTodo($title: String!) {
    createTodo(title: $title) {
      id
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo($id: ID!, $done: Boolean!) {
    updateTodo(id: $id, done: $done) {
      id
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;
export const generateAction = /* GraphQL */ `
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
