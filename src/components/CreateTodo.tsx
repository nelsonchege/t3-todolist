import { useState } from "react";
import { toast } from "react-hot-toast";
import { todoInput } from "~/types";
import { api } from "~/utils/api";

export default function CreateTodo() {
  const [newTodo, setNewTodo] = useState("");

  const trpc = api.useContext();
  const { mutate } = api.todo.createTodo.useMutation({
    onMutate: async (newTodo) => {
      // cancel any outgoing refetches to avoid overwrites
      await trpc.todo.getallTodos.cancel();
      // gets snapshot of pervios values
      const previousTodos = trpc.todo.getallTodos.getData();

      trpc.todo.getallTodos.setData(undefined, (prev) => {
        const optimisticTodo = {
          id: `optimistic-todo-${newTodo}`,
          text: newTodo,
          done: false,
        };
        if (!prev) return [optimisticTodo];
        return [...prev, optimisticTodo];
      });

      setNewTodo("");
      return { previousTodos };
    },
    onError: async (error, newTodo, context) => {
      toast.error("An error occured when creating todo");
      setNewTodo(newTodo);
      trpc.todo.getallTodos.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getallTodos.invalidate();
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const result = todoInput.safeParse(newTodo);

          if (!result.success) {
            toast.error(result.error.format()._errors.join("\n"));
            return;
          }

          // create todo mutation
          mutate(newTodo);
        }}
        className="flex gap-2"
      >
        <input
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="New Todo..."
          type="text"
          name="new-todo"
          id="new-todo"
          value={newTodo}
          onChange={(e) => {
            setNewTodo(e.target.value);
          }}
        />

        <button className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto">
          Create
        </button>
      </form>
    </div>
  );
}
