import React, { useContext } from "react";
import { Todo, TodoValues, ITodoService, User } from "./interfaces";
import { useQuery } from "react-query";

const serviceContext = React.createContext({ token: "" });

const apiUrl = process.env.REACT_APP_NETLIFY ?
  `${window.location.origin}/.netlify/functions/index` :
  process.env.REACT_APP_API_ORIGIN;

const urls = {
  todos: `${apiUrl}/todos`,
  todo: (id: string) => `${apiUrl}/todos/${id}`,
  user: (id: string) => `${apiUrl}/users/${id}`,
};

export const useTodoService: () => ITodoService = () => {
  const { token } = useContext(serviceContext);
  const headers: Headers = new Headers();

  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const listTodos = async (): Promise<Todo[]> => {
    const response = await fetch(urls.todos, { headers: headers });
    return await jsonOrError(response);
  };

  const createTodo = async (todo: TodoValues): Promise<Todo> => {
    const response = await fetch(urls.todos, {
      method: "POST",
      headers,
      body: JSON.stringify(todo),
    });
    return await jsonOrError(response);
  };

  const saveTodo = async (id: string, values: TodoValues): Promise<Todo[]> => {
    const response = await fetch(urls.todo(id), {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(values),
    });
    return await jsonOrError(response);
  };

  const deleteTodo: (todo: Todo) => Promise<void | Response> = async (todo) => {
    const response: Response = await fetch(urls.todo(todo.ID), {
      method: "DELETE",
      body: JSON.stringify(todo),
      headers: headers,
    });
    if (response.status !== 200) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  };

  const getUser: (userId: string) => Promise<User> = async (userId) => {
    const response = await fetch(urls.user(userId), { headers: headers });
    return await jsonOrError(response);
  };

  return {
    listTodos,
    createTodo,
    saveTodo,
    deleteTodo,
    getUser,
  };
};

export const useUser: (userId: string) => User = (userId: string) => {
  const { getUser } = useTodoService();
  const response = useQuery(['User', userId], () => {
    return getUser(userId);
  });
  return response.data as User;
};

const jsonOrError = async (response: Response): Promise<any> => {
  if (response.status === 200) {
    return await response.json();
  }

  throw new Error(`${response.status}: ${response.statusText}`);
};

export type ServiceProps = {
  token: string;
};

const TodoService: React.FC<React.PropsWithChildren<ServiceProps>> = ({
  children,
  token,
}) => {
  return (
    <serviceContext.Provider value={{ token }}>
      {children}
    </serviceContext.Provider>
  );
};

export default TodoService;
