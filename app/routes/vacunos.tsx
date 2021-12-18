import { Outlet } from "remix";

export default function Vacunos(){
    return (
    <>
        <h1 className="mt-2 text-2xl uppercase">Vacunos</h1>
        <Outlet/>
    </>)
}