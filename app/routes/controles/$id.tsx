import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { supabase } from "~/utils/supabaseClient";
import { parseCsv } from '~/utils/csvHelper'


export let loader: LoaderFunction = async ({ params }) => {
    let { id } = params
    let { data, status, error } = await supabase
        .from('controles')
        .select()
        .eq('id', id)
        .maybeSingle()
    
    if(error)
        throw new Response(error.message, { status })    
    
    let lecturas = await parseCsv()    

    return { ...data, lecturas }
}

export default function Control(){
    let data = useLoaderData()
    return(
        <div>{JSON.stringify(data)}</div>
        // <div>{data.lecturas.map(lectura => (<li key={lectura}>{lectura}</li>))}</div>
    )
}