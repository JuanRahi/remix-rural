import { Form, ActionFunction, unstable_parseMultipartFormData } from "remix";
import { parseCsvFromRequest } from "~/utils/csvHelper";
import { getCategorias } from "~/utils/enumHelper";
import { supabase } from "~/utils/supabaseClient";
import { procesarVenta } from "../../services/ventas.service";


export let action: ActionFunction = async ({ request }) => {
    let lecturas: number[] = []
    let uploadHandler = async ({
        name,
        stream,
        filename
    }) => {
        // read caravanas --> lecturas 
        lecturas = await parseCsvFromRequest(stream)  

        // save file
        const { data, error } = await supabase
            .storage
            .from('ventas')
            .upload(filename, stream, {
                cacheControl: '3600',
                upsert: false
            })

        // return fileUrl    
        const { publicURL } = await supabase
            .storage
            .from('ventas')
            .getPublicUrl(filename)

        return publicURL
    }

    let form = await unstable_parseMultipartFormData(request, uploadHandler)
    let venta = Object.fromEntries(form.entries())
    let { data, error } = await supabase
        .from('ventas')
        .insert(venta)

    if(error)
        throw new Response(error.message)
    
    await procesarVenta(lecturas, data[0].id, venta.comprador)

    return data
}

export default function NewVenta(){
    let categorias = getCategorias()
    return (
        <div className="flex-auto">
            <h2 className="text-xl uppercase">Nueva Venta</h2>
            <Form method="post"  encType="multipart/form-data">
                <div className="space-x-2 mt-2">
                    <label>Fecha</label>
                    <input type="date" name="fecha"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Categoria</label>
                    <select name="categoria">
                        {
                            categorias.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Cantidad</label>
                    <input type="number" name="cantidad"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Peso</label>
                    <input type="number" step="0.01" name="peso"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Precio Kg</label>
                    <input type="number" step="0.01" name="precio_kg"/>
                </div>
                <div className="space-x-2 mt-2"> 
                    <label>Comision</label>
                    <input type="number" step="0.01" name="comision"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Factura</label>
                    <input type="text" name="factura"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Lecturas</label>
                    <input type="file" name="lecturas"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Comprador</label>
                    <input type="text" name="comprador"/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Ubicacion</label>
                    <input type="text" name="ubicacion"/>
                </div>
                <div className="mt-2">
                    <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8" >Guardar</button>
                </div>
            </Form>
        </div>)
}