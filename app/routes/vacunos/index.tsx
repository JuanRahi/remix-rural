import { Link, useLoaderData } from "remix"
import type { LoaderFunction } from "remix"
import { supabase } from "../../utils/supabaseClient"

export let loader: LoaderFunction = async () => {
    let { data, error, status } = await supabase
        .from('vacunos')
        .select()

    console.log(data)
    console.log(error)
    console.log(status)

    if(!error)
        return data

    throw new Response( error.message, { status })
}

export default function Vacunos(){
    let data = useLoaderData()
    console.log(data)
    return (
    <div>        
        <ul>
            {data.map(vacuno => (
                <li key={vacuno.caravana}>
                    <Link to="/" prefetch="intent">
                        {vacuno.caravana}
                    </Link>
                </li>
                ))}
        </ul>            

    </div>)
}