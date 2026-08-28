import {base_fetch_url} from "../../../config"
import { useEffect, useRef, useState, useContext } from "react";
import Enter_passcode from "../enter_passcode/enter_passcode";
import { manage_register_widgets_context_ } from "./context";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


type Send_keys_props = {
    setMsg: React.Dispatch<React.SetStateAction<string>>
    send_keys: number
    fetching: React.MutableRefObject<boolean>
}


const Send_keys = ({setMsg, send_keys, fetching}:Send_keys_props) =>{


    const [auth_token, set_auth_token] = useState<string>('')
    const {set_show_manage_register_widgets, show_manage_register_widgets} = useContext(manage_register_widgets_context_)



    const send_fetch = () => {

        let email_val = (document.getElementById('email-input') as HTMLInputElement)
        let passwd_field1 = (document.getElementById('password-input1') as HTMLInputElement)
        let passwd_field2= (document.getElementById('password-input2') as HTMLInputElement)

    

        if(!email_val.value){
            email_val.focus()
            setMsg('<span style="color:red">Email field cant be empty!</span>')
            return
        }
     

        if(!emailRegex.test(email_val.value)){
            setMsg('<span style="color:red">Incorrect email address</span>')
            return
        }   


        if(passwd_field1.value == '')  {passwd_field1.focus(); setMsg('<span style="color:red">Password field cant be empty!</span>'); return}
        if(passwd_field2.value == '')  {passwd_field2.focus(); setMsg('<span style="color:red">Password field cant be empty!</span>'); return}
        
        if(passwd_field1.value != passwd_field2.value) {setMsg('<span style="color:red">Passwords dont match!</span>'); return}

        setMsg("")

        if(fetching.current) return
        fetching.current = true
        const submit_btn = document.getElementById('submitBtn') as HTMLButtonElement
        try{
            if(submit_btn) {submit_btn.style.opacity = '0.6'; submit_btn.style.pointerEvents = 'none'}
            fetch(base_fetch_url+'/register/',{
                method:'POST',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },

                body:JSON.stringify({
                    'email':email_val.value,
                    'password':passwd_field1.value
                })
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                let result=data
                if(result.already_exists){
                    setMsg("<span style='color:red'>E-mail address is already taken!</span>")
                    if(submit_btn) submit_btn.style.opacity = '1'; submit_btn.style.pointerEvents = 'auto'
                }
                if(result.auth_token) set_show_manage_register_widgets('hide whole widget'); set_auth_token(result.auth_token)
            
            })

        }finally{
            setTimeout(() => {
                fetching.current = false
            }, 200);
        }

    }


    useEffect(()=>{send_fetch()},[send_keys])
    

    return (
        <>
            {auth_token != '' &&  show_manage_register_widgets === 'hide whole widget' && <Enter_passcode type = "register" auth_token = {auth_token}></Enter_passcode>}
        </>
    )

}


export default Send_keys