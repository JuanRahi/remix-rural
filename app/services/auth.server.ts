import { Authenticator } from "remix-auth";
import { sessionStorage } from './session.server'
import { FormStrategy } from "remix-auth-form";
import { supabase } from "~/utils/supabaseClient.server";

export let authenticator = new Authenticator(sessionStorage)

authenticator.use(
    new FormStrategy(async ({form}) => {
        let email = form.get("email")
        let password = form.get("password")
        let { user, error } = await supabase
            .auth.signIn({ email, password })
        
        if(error) {
            console.log('--------auth error-----------')
            console.log(error)
            throw error
        }

        return user
    }), "user-pass"
)