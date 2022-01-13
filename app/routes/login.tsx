import { Form } from "remix";
import type { LoaderFunction, ActionFunction } from 'remix'
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        successRedirect: '/'
    })
}

export let action: ActionFunction = async ({request}) => {
    return await authenticator.authenticate("user-pass", request, {
        successRedirect: "/",
        failureRedirect: "/login"
    })
}

export default function Login(){
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
                <button type="submit" className="bg-blue-900 text-white rounded w-16 h-8">Login</button>
            </div>
        </Form>
    )
}