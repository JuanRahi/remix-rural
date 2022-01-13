import { useLoaderData, Form } from "remix"
import type { LoaderFunction, ActionFunction } from 'remix'
import { supabase } from "~/utils/supabaseClient.server"
import { reProcesarVenta } from "../../services/ventas.service"

export let loader: LoaderFunction = async ({ params }) => {
    const { id } = params
    const { data: venta, error} = await supabase
        .from('ventas')
        .select()
        .eq('id', id)
        .maybeSingle()
    
    if(error)
        throw new Response(error.message)
    
    return venta
}

export let action: ActionFunction = async ({ request, params }) => {
    const { id } = params
    const { data: venta, error} = await supabase
    .from('ventas')
    .select()
    .eq('id', id)
    .maybeSingle()

    const { lecturas: url, comprador} = venta
    await reProcesarVenta(url, id, comprador)

}

export default function Venta(){
    const venta = useLoaderData()
    return (
        <div>
            <h1 className="text-xl">Fecha {new Date(venta.fecha).toLocaleDateString()}</h1>
            <div className="flex space-x-2">
                <label className="font-medium">Categoria</label>
                <p>{venta.categoria}</p>
            </div>
            <div className="flex space-x-2">
                <label className="font-medium">Cantidad</label>
                <p>{venta.cantidad}</p>
            </div>
            <div className="flex space-x-2">
                <label className="font-medium">Peso</label>
                <p>{venta.peso}</p>
            </div>
            <div className="flex space-x-2">
                <label className="font-medium">Precio Kg</label>
                <p>{venta.precio_kg}</p>
            </div>
            <div className="flex space-x-2">
                <label className="font-medium">Comprador</label>
                <p>{venta.comprador}</p>
            </div>
            <div className="flex space-x-2">
                <Form method="post">
                    <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8">Procesar</button>
                </Form>
            </div>                        
        </div>
    )

}