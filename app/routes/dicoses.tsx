import { Form, useLoaderData, redirect, useActionData } from "remix"
import type { LoaderFunction, ActionFunction } from "remix"
import { authenticator } from "~/services/auth.server"
import { supabase } from "~/utils/supabaseClient.server"


export let loader: LoaderFunction = async ({ request }) => {
    let user = await authenticator.isAuthenticated(request)
    if(!user)
        return redirect('/login')

    let { data, error } = await supabase
        .from('user_dicose')
        .select('dicoses')
        .eq('user_id', user.id)
        .maybeSingle()
    
    if(error)
        throw new Response(error.message)
    
    return { dicoses: data?.dicoses || []}
}

export let action: ActionFunction = async({request}) => {
    let form = await request.clone().formData()
    let dicose = form.get('dicose')

    let user = await authenticator.isAuthenticated(request, {
        failureRedirect: '/login'
    })
    
    let { data, error } = await supabase
        .from('user_dicose')
        .select('dicoses')
        .eq('user_id', user.id)
        .maybeSingle()
            
    if(!data && !data?.dicoses){
        console.log('insert')
        let { data: inserted_dicose, error: error_insert } = await supabase
            .from('user_dicose')
            .insert({ user_id: user.id, dicoses: [ dicose] })
        
        if(error_insert)
            throw new Response(error_insert.message)
        
        return inserted_dicose
    } else {
        console.log('update')
        let { data: updated_dicose, error: error_update } = await supabase
            .from('user_dicose')
            .update({ user_id: user.id, dicoses: [ ...data.dicoses, dicose] })
            .eq('user_id', user.id)
        
        if(error_update)
            throw new Response(error_update.message)
        
        return updated_dicose
    }
}

export default function Dicoses(){
    let { dicoses } = useLoaderData()
    return (
        <>
            <div>Dicoses: 
                {
                    dicoses.map(x => (<p key={x}>{x}</p>))
                }
            </div>
            <Form method="post">
                <div className="space-x-2 mt-2">
                    <label htmlFor="dicose">Dicose</label>
                    <input type="text" name="dicose"></input>
                </div>
                <div className="space-x-2 mt-2">
                    <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8">Agregar</button>
                </div>
            </Form>
        </>
    )
}