import { Link, Form, useLoaderData, useSearchParams } from "remix"
import type { LoaderFunction } from "remix"
import { supabase } from "../../utils/supabaseClient"

export let loader: LoaderFunction = async ({ request }) => {
    let url = new URL(request.url)
    let page = url.searchParams.get('page') || 1
    let caravana = url.searchParams.get('caravana')
    if(caravana) {
        let { data, error, status } = await supabase
        .from('vacunos')
        .select()
        .eq('caravana', caravana)

        if(!error)
            return data

        throw new Response( error.message, { status })
    }

    let pageSize = 20
    let from = (+page - 1) * pageSize
    let to = from + pageSize
    let { data, error, status } = await supabase
        .from('vacunos')
        .select()
        .range(from , to)

    if(!error)
        return data

    throw new Response( error.message, { status })
}

export default function Vacunos(){
    let data = useLoaderData()
    let [searchParams] = useSearchParams()
    let page = searchParams.get('page') || 1    
    return (
    <div className="flex flex-col">
        <Form method="get" className="my-2 space-x-2">
            <label>Caravana</label>
            <input className="px-1" type="text" name="caravana"/>
        </Form>
        <table className="table-auto w-full">
            <thead>
                <tr>
                    <th className="text-left uppercase">Caravana</th>
                    <th className="text-left uppercase">Raza</th>
                    <th className="text-left uppercase">Cruza</th>
                    <th className="text-left uppercase">Sexo</th>
                    <th className="text-left uppercase">Status</th>
                    <th className="text-left uppercase">Nacimiento</th>
                    <th className="text-left uppercase">Propietario</th>
                    <th className="text-left uppercase">Fecha Ingreso</th>
                </tr>
            </thead>
            <tbody>
                { data.map(vacuno => (
                    <tr key={vacuno.caravana}>
                        <td>{vacuno.caravana}</td>
                        <td>{vacuno.raza}</td>
                        <td>{vacuno.cruza}</td>
                        <td>{vacuno.sexo}</td>
                        <td>{vacuno.status}</td>
                        <td>{vacuno.nacimiento}</td>
                        <td>{vacuno.propietario}</td>
                        <td>{vacuno.fecha_ingreso}</td>
                    </tr>
                    ))}
            </tbody>
        </table>
        <div className="mt-5 space-x-4">
            <Link to={`/vacunos?page=${+page-1}`}>Previous</Link>
            <Link to={`/vacunos?page=${+page+1}`}>Next</Link>
        </div>
    </div>)
}