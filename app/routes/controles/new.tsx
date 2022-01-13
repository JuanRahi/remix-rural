import { Form, redirect, useLoaderData, unstable_parseMultipartFormData } from 'remix'
import type { ActionFunction, LoaderFunction } from 'remix'
import { supabase } from '~/utils/supabaseClient.server'
import { parseCsvFromRequest } from '~/utils/csvHelper'

export let loader: LoaderFunction = async () => {
    const { data, status, error } = await supabase
        .from('potreros')
        .select()

    if(!error)
        return data

    throw new Response(error.message, { status })
}

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
            .from('controles')
            .upload(filename, stream, {
                cacheControl: '3600',
                upsert: false
            })

        // return fileUrl    
        const { publicURL } = await supabase
            .storage
            .from('controles')
            .getPublicUrl(filename)

        return publicURL
    }
    
    let form = await unstable_parseMultipartFormData(
        request,
        uploadHandler
    )
            
    const fecha = form.get("fecha")
    let potrero = form.get("potrero")
    potrero = potrero != "0" ? potrero : null
    let url = form.get("lecturas")

    const { data: control, error } = await supabase
        .from('controles')
        .insert(
            { fecha, url, tipo: 'control', potrero }
        )
        
    if(!error){
        let { data: propios, error: propios_error } = await supabase
            .from('vacunos')
            .select('caravana, potrero:vacunos_potrero (id)')

        if(propios_error)
            throw new Response(propios_error.message)

        // insert lecturas ==> control
        let control_lecturas = lecturas.map(caravana => ({ caravana, control: control[0].id, propio: propios?.some(x => x.caravana === caravana) }))                
        const { data, error: procesar_error } = await supabase
            .from('control_lecturas')
            .insert(control_lecturas)

        // insert faltan ==> control
        let control_faltan = propios.filter(x => x.potrero?.id == potrero && !lecturas.includes(x.caravana))
            .map(x => ({ caravana: x.caravana, control: control[0].id}))
            
        const { data: faltan, error: faltan_error } = await supabase
            .from('control_faltan')
            .insert(control_faltan)
            
        if(procesar_error)
            throw new Response(procesar_error.message)   
    }

    return redirect('/controles')
}

export default function NewControl() {
    const potreros = useLoaderData()
    return (
        <div>
            <h2 className="text-xl uppercase">Nuevo Control</h2>
            <Form method="post" encType="multipart/form-data">
                <div className="space-x-2 mt-2"> 
                    <label>Fecha</label>
                    <input type="date" name="fecha" className=""/>
                </div>
                <div className="space-x-2 mt-2">
                    <label>Potrero</label>
                    <select name="potrero">
                        <option value="0">Campo</option>
                        {
                            potreros.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="space-x-2 mt-2">
                    <input type="file" name="lecturas"/>
                </div>
                <div className="mt-2">
                    <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8" >Guardar</button>
                </div>
            </Form>
        </div>
    )
}