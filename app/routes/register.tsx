import { Form, redirect } from "remix";
import type { LoaderFunction, ActionFunction } from 'remix'
import { authenticator } from "~/services/auth.server";
import { supabase } from "~/utils/supabaseClient.server";
import { commitSession } from "~/services/session.server";

export let loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, { 
        successRedirect: '/'
    })
}

export let action: ActionFunction = async ({ request }) => {
    let form = await request.clone().formData()
    let email = form.get("email")
    let password = form.get("password")
    let { session, user, error } = await supabase
        .auth.signUp({ email, password })
    
    if(error)
        throw new Response(error.message)

    return await authenticator.authenticate("user-pass", request, {
        successRedirect: '/dicoses',
        failureRedirect: '/login'
    })
}

export default function Register() {
    return (
        <Form method="post">
            <div className="space-x-2 mt-2">
                <label htmlFor="email">Email</label>
                <input type="email" name="email"/>
            </div>
            <div className="space-x-2 mt-2">
                <label htmlFor="password">Password</label>
                <input type="password" name="password"/>
            </div>
            <div className="space-x-2 mt-2">
                <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8">Register</button>
            </div>
        </Form>
    )
}