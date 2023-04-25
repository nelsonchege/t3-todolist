import {z} from  "zod"
import type { inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "./server/api/root"

type RouterPutputs = inferRouterOutputs<AppRouter>
type allTodosOutput = RouterPutputs["todo"]["getallTodos"]

export type Todo =  allTodosOutput[number]
export const todoInput =z.string({
    required_error:"Describe your todo"
}).min(1).max(50)