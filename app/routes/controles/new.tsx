import { Form, redirect, useLoaderData } from 'remix'
import type { ActionFunction, LoaderFunction } from 'remix'
import { supabase } from '~/utils/supabaseClient'

export let loader: LoaderFunction = async () => {
    const { data, status, error } = await supabase
        .from('potreros')
        .select()

    if(!error)
        return data

    throw new Response(error.message, { status })
}

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const fecha = form.get("fecha")
    const url = form.get("url")
    const potrero = form.get("potrero")
    const { data, error } = await supabase
        .from('controles')
        .insert([
            { fecha, url, tipo: 'control', potrero }
        ])

    if(!error)
        return redirect('/controles')
}

export default function NewControl() {
    const potreros = useLoaderData()
    return (
        <div>
            <h2 className="text-xl uppercase">Nuevo Control</h2>
            <Form method="post">
                <div className="space-x-2 mt-2"> 
                    <label>Fecha</label>
                    <input type="date" name="fecha" className=""/>
                </div>
                <div className="space-x-2 mt-2"> 
                    <label>Lecturas</label>
                    <input type="text" name="url" className=""/>
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
                <div className="mt-2">
                    <button type="submit" className="bg-blue-900 text-white rounded w-12 h-8" >Subir</button>
                </div>
            </Form>
        </div>
    )
}