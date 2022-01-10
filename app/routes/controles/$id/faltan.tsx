import { useLoaderData } from "remix"
export default function Faltan(){
    let data = useLoaderData()
    console.log(data)
    return (<div>Faltan {JSON.stringify(data)}</div>)
}