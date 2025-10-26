import {base_fetch_url} from "../../../config"
import { useEffect, useRef, useState, useContext } from "react";
import Enter_passcode from "../enter_passcode/enter_passcode";
import { show_tab_context_ } from "./context";
import Show_action_tab from "../../home/comps/show_action_tab";


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type Send_keys_props = {
    setMsg: React.Dispatch<React.SetStateAction<string>>
    send_keys: number
    
}

const Send_keys = ({setMsg, send_keys}: Send_keys_props) => {

    const fetching = useRef<boolean>(false)
    const [auth_token, set_auth_token] = useState<string>('')
    const {set_show_tab, show_tab} = useContext(show_tab_context_)

    

    
    const send_fetch = async() => {

        if(fetching.current) return
        fetching.current = true
        const submit_btn = document.getElementById('submitBtn') as HTMLButtonElement
        try{
            let email_val = (document.getElementById('email-input') as HTMLInputElement)

            if(!email_val.value){
                console.log('Email input cant be empty!')
                email_val.focus()
                setMsg('<span style="color:red">Email field cant be empty!</span>')
                return
            }
        

            if(!emailRegex.test(email_val.value)){
                console.log('Incorrect email address')
                setMsg('<span style="color:red">Incorrect email address</span')
                return
            }

            // setMsg("")
            console.log('Keys are valid!',base_fetch_url+'/login/')
            


            
            console.log('fetching')

          
            if(submit_btn) submit_btn.style.opacity = '0.6'; submit_btn.style.pointerEvents = 'none'
            const response = await fetch(base_fetch_url+`/reset_password/?address=${email_val.value}`,{
                method:'GET',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },
            
            })
            const data = await response.json()
            console.log(data)
            if(data.auth_token) {set_auth_token(data.auth_token); set_show_tab('passcode'); return}
            if(!data.found_address) {
                setMsg('<span style="color:red">Account with such an address doesnt exists!</span>')
                if(submit_btn) submit_btn.style.opacity = '1'; submit_btn.style.pointerEvents = 'auto'
                return
            }



        }finally{
            setTimeout(() => {
                fetching.current = false
            }, 200);
        }

        
  


    }

    useEffect(()=>{send_fetch()},[send_keys])
     


    return (
        <>
            {auth_token != '' &&  show_tab == 'passcode' && <Enter_passcode type = "login" auth_token = {auth_token} ></Enter_passcode>}
        </>
    )


}


export default Send_keys