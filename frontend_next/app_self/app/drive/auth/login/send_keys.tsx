import {base_fetch_url} from "../../../config"
import { useEffect, useRef, useState } from "react";
import Enter_passcode from "../enter_passcode/enter_passcode";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type Send_keys_props = {
    setMsg: React.Dispatch<React.SetStateAction<string>>
    call_send_keys: React.Dispatch<React.SetStateAction<number>>
    call_me: number
    fetching: React.MutableRefObject<boolean>
}

const Send_keys = ({setMsg, call_send_keys, call_me, fetching}: Send_keys_props) => {

    const [auth_token, set_auth_token] = useState<string>('')
    

    
    const send_fetch = () => {


        let email_val = (document.getElementById('email-input') as HTMLInputElement)
        let passwd_val = (document.getElementById('password-input') as HTMLInputElement)

        if(!email_val.value){
            email_val.focus()
            setMsg('<span style="color:red">Email field cant be empty!</span>')
            return
        }
        if(!passwd_val.value){
            passwd_val.focus()
            setMsg('<span style="color:red">Password field cant be empty!</span')
            return
        }

        if(!emailRegex.test(email_val.value)){
            setMsg('<span style="color:red">Incorrect email address</span')
            return
        }

        setMsg("")
        const submit_btn = document.getElementById('submitBtn') as HTMLButtonElement
        console.log(submit_btn)

        if(fetching.current) return
        fetching.current = true

        try{
            if(submit_btn) submit_btn.style.opacity = '0.6'; submit_btn.style.pointerEvents = 'none'
            fetch(base_fetch_url+'/login/',{
                method:'POST',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },

                body:JSON.stringify({
                    'email':email_val.value,
                    'password':passwd_val.value
                })
                })
                .then(response => {
                    return response.json(); 
                })
                .then(data => {
                    let result=data

                    if(result.creds=='incorrect'){
                        setMsg("<span style='color:red'>Incorrect credentials!</span>")
                        if(submit_btn) submit_btn.style.opacity = '1'; submit_btn.style.pointerEvents = 'auto'
                    }
                    if(result.auth_token){
                        set_auth_token(result.auth_token)
                        call_send_keys(c=>-1)
                    }
            })
        }finally{
            setTimeout(() => {
                fetching.current = false
            }, 200);
        }



    }

    useEffect(()=>{send_fetch()},[call_me])
     


    return (
        <>
            {auth_token != '' && <Enter_passcode type = "login" auth_token = {auth_token}></Enter_passcode>}
        </>
    )


}


export default Send_keys