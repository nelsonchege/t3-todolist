import { api } from "../utils/api";
import type { Todo } from "../types";
import toast from "react-hot-toast";

type TodoProps = {
  todo: Todo;
};
export default function Todo({ todo }: TodoProps) {
  const { id, text, done } = todo;
  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggle.useMutation({
    onMutate: async ({ id, done }) => {
      await trpc.todo.getallTodos.cancel();
      const previousTodos = trpc.todo.getallTodos.getData();

      trpc.todo.getallTodos.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.map((t) => {
          if (t.id == id) {
            return { ...t, done };
          }
          return t;
        });
      });
      return { previousTodos };
    },
    onSuccess: (error, { done }) => {
      if (done) {
        toast.success("Todo Completed");
      }
    },
    onError: async (error, newTodo, context) => {
      toast.error(
        `An error occured when setting todo to ${done ? "done" : "undone"}`
      );
      trpc.todo.getallTodos.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getallTodos.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.deleteTodo.useMutation({
    onMutate: async (deleteID) => {
      // cancel any outgoing refetches to avoid overwrites
      await trpc.todo.getallTodos.cancel();
      // gets snapshot of pervios values
      const previousTodos = trpc.todo.getallTodos.getData();

      trpc.todo.getallTodos.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.filter((t) => t.id !== deleteID);
      });
      return { previousTodos };
    },
    onError: async (error, newTodo, context) => {
      toast.error("An error occured when deleting todo");
      trpc.todo.getallTodos.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getallTodos.invalidate();
    },
  });
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            className="focus:ring-3 focus:ring-blue-30 h-4 w-4 cursor-pointer rounded border border-gray-300 bg-gray-50"
            type="checkbox"
            name="done"
            id={id}
            checked={done}
            onChange={(e) => {
              doneMutation({ id, done: e.target.checked });
            }}
          />
          <label
            htmlFor={id}
            className={`cursor-pointer ${done ? "line-through" : ""}`}
          >
            {text}
          </label>
        </div>
        <button
          className="w-full rounded-lg bg-blue-700 px-2 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
          onClick={() => {
            deleteMutation(id);
          }}
        >
          Delete
        </button>
      </div>
    </>
  );
}
