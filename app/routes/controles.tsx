import { LoaderFunction, useLoaderData, Outlet, Link } from 'remix'
import { supabase } from '~/utils/supabaseClient.server'

export let loader: LoaderFunction = async({ request }) => {
    let { data, error, status } = await supabase
        .from('controles')
        .select('id, fecha, tipo, potreros ( nombre)')

    if(!error)
        return data

    throw new Response( error.message, { status })
}

export default function Controles(){
    let data = useLoaderData()

    return (
        <div className="flex flex-col">
            <h1 className="mt-2 text-2xl uppercase">Controles</h1>
            <div className="flex space-x-5">
                <div className="flex flex-col w-1/3">
                    <table className="mt-2 table-auto w-full">
                        <thead>
                            <tr>
                                <th className="text-left uppercase">Fecha</th>
                                <th className="text-left uppercase">Tipo</th>
                                <th className="text-left uppercase">Potrero</th>
                                <th className="text-left uppercase">Ver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map(control => (
                                    <tr key={control.id}>
                                        <td>{new Date(control.fecha).toLocaleDateString()}</td>
                                        <td>{control.tipo}</td>
                                        <td>{control.potreros?.nombre || 'Campo'}</td>
                                        <td>
                                            <Link to={`/controles/${control.id}`}>Ver</Link>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <Link to="new" className="">Nuevo</Link>                
                </div>
                <div className="flex flex-1">
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}