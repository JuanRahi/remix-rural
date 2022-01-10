import { LoaderFunction, ActionFunction, NavLink, Outlet, useActionData } from "remix";
import { useLoaderData, Form, redirect } from "remix";
import { supabase } from "~/utils/supabaseClient";
import { parseCsv } from '~/utils/csvHelper'

type LoaderData = {
    id: number,
    fecha: Date,
    potrero: {
        nombre: string
    },
    url: string,
    propios: any[],
    faltan: number[],
    ajenos: any[],
    total: number,
    potreros: [{
        id: number,
        nombre: string
    }]
}

export let loader: LoaderFunction = async ({ params }) => {
    let { id } = params
    let { data: control, status, error } = await supabase
        .from('controles')
        .select('id, fecha, potrero:potreros (id, nombre), url')
        .eq('id', id)
        .maybeSingle()
        
    let { data: potreros } = await supabase
        .from('potreros')
        .select('id, nombre')

    let { data: lecturas, error: error_lecturas } = await supabase
        .from('control_lecturas')
        .select('caravana, propio')
        .eq('control', id)

    let vacunos_query =  supabase
        .from('vacunos_potrero')
        .select('caravana')
        .lt('desde', control.fecha)
        .or(`hasta.gte.${control.fecha},hasta.is.null`)
    
    if(control?.potrero?.id)
        vacunos_query = vacunos_query.eq('potrero', control?.potrero?.id)
    else
        vacunos_query = vacunos_query.is('potrero', null)

    let { data: vacunos, error: error_vacunos } = await vacunos_query    
    if(error_vacunos)
        console.log(error_vacunos)

    let propios = lecturas?.filter(x => x.propio)
    let ajenos = lecturas?.filter(x => !x.propio)
    let faltan = vacunos?.filter(x => !lecturas?.some(l => l.caravana === x.caravana)).map(f => f.caravana)
    let total = lecturas?.length
    
    if(error)
        throw new Response(error.message, { status })    
     
    return { ...control, propios, faltan, ajenos, total, potreros }
}

export let action: ActionFunction = async ({ request, params }) => {
    let { id } = params
    let { data: control, status, error } = await supabase
        .from('controles')
        .select('id, fecha, potrero:potreros (id), url')
        .eq('id', id)
        .maybeSingle()

    const form = await request.formData()
    const action = form.get("_action")

    let lecturas: number[] = await parseCsv(control.url?.toString() || '')    
    
    switch(action){
        case "mover": {
            let { potrero: {id}, fecha: desde } = control

            // get vacunos to update hasta
            let { data: update, error: error_update } = await supabase
                .from('vacunos_potrero')
                .select()
                .eq('potrero', id)
                .is('hasta', null)

            if(update && update.length > 0) {
                update = update.map(u => ({ ...u, hasta: desde }))
                const { data: update_result, error: update_error } = await supabase
                .from('vacunos_potrero')
                .upsert(update)
            }

            // insert new set vacunos_potrero from control.desde
            let vacunos_potrero = lecturas.map(caravana => ({ caravana, potrero: id, desde }))
            const { data: result, error } = await supabase
                .from('vacunos_potrero')
                .insert(vacunos_potrero)
        
            if(error)
                throw new Response(error.message)    
            
            break;
        }
        case "procesar": {
            let { data: propios, error: propios_error } = await supabase
                .from('vacunos')
                .select('caravana')

            if(propios_error)
                throw new Response(propios_error.message)

            let control_lecturas = lecturas.map(caravana => ({ caravana, control: id, propio: propios?.some(x => x.caravana === caravana) }))                
            const { data, error: procesar_error } = await supabase
                .from('control_lecturas')
                .insert(control_lecturas)
            
            if(procesar_error)
                throw new Response(procesar_error.message)   
            
            return { ...data }
        }
    }
    return redirect('/controles')
}

export default function Control(){
    let control = useLoaderData<LoaderData>()
    let control_procesado = useActionData()
    return(
        <div className="flex flex-col">
            <h1>Fecha {new Date(control.fecha).toLocaleDateString()}</h1>
            <h2>Potrero {control.potrero?.nombre || 'Campo'}</h2>
            <div className="flex space-x-4">
                <NavLink to="lecturas"><p>Lecturas {control.total}</p></NavLink>
                <NavLink to="propios"><p>Propios {control.propios.length}</p></NavLink>
                <NavLink to="faltan"><p>Faltan {control.faltan.length}</p></NavLink>
                <NavLink to="ajenos"><p>Ajenos {control.ajenos.length}</p></NavLink>
                {/* <div>{control.ajenos.map(x => (<p>{x.caravana}</p>))}</div> */}
            </div>
            <Outlet/>
            <div className="mt-2 flex">
                <Form method="post" className="">
                    <input type="hidden" name="_action" value="mover"/>
                    <button type="submit"  className="bg-blue-900 text-white rounded w-40 h-8" >Mover ganado</button>
                </Form>
                <Form method="post" className="ml-2">
                    <input type="hidden" name="_action" value="procesar"/>
                    <button type="submit" className="bg-blue-900 text-white rounded w-40 h-8" >Procesar lecturas</button>
                </Form>
            </div>
        </div>
    )
}