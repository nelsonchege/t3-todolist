import {api} from "../utils/api"
import Todo from "./Todo"

export default function Todos(){
    const {data:todos, isLoading,isError} = api.todo.getallTodos.useQuery()

    if (isLoading) return <div>Loading......</div>
    if (isError) return <div>Error fetching todos</div>
    return (
        <>
        {todos.length ? todos.map(todo =>(
            <Todo key={todo.id} todo={todo}/>
        )):'Create Your first Todo'}
        </>
    )
}