import { useLoaderData, Link, Outlet } from "remix";
import type { LoaderFunction } from "remix";
import { supabase } from "~/utils/supabaseClient.server";


export let loader: LoaderFunction = async () => {
    let { data: ventas, error: error_ventas } = await supabase
        .from('ventas')
        .select()

    if(error_ventas)
        throw new Response(error_ventas.message)

    return ventas
}

export default function Ventas(){
    const ventas = useLoaderData()
    return (
        <div className="flex flex-col">
        <h1 className="mt-2 text-2xl uppercase">Ventas</h1>
        <div className="flex space-x-5">
            <div className="flex flex-col w-1/2">
                <table className="mt-2 table-auto w-full">
                    <thead>
                        <tr>
                            <th className="text-left uppercase">Fecha</th>
                            <th className="text-left uppercase">Categoria</th>
                            <th className="text-left uppercase">Cantidad</th>
                            <th className="text-left uppercase">Peso</th>
                            <th className="text-left uppercase">Precio Kg</th>
                            <th className="text-left uppercase">Comprador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            ventas && ventas.map(venta => (
                                <tr key={venta.id}>
                                    <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                                    <td>{venta.categoria}</td>
                                    <td>{venta.cantidad}</td>
                                    <td>{venta.peso}</td>
                                    <td>{venta.precio_kg}</td>
                                    <td>{venta.comprador}</td>
                                    <td>
                                        <Link to={`/ventas/${venta.id}`}>Ver</Link>
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