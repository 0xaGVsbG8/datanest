
import { useEffect, useRef, useContext } from "react"
import { base_fetch_url } from "@/app/config"

import { show_tab_props } from '../remind_password/context'
import { show_tab_context_, user_data_context_} from "../remind_password/context"
import { manage_register_widgets_context_ } from "../register/context"

type Send_keys_props = {
    auth_token: string
    passcode: string
    call_me: number
    set_msg: React.Dispatch<React.SetStateAction<string>>
}


const Send_keys = ({passcode, auth_token, call_me, set_msg}:Send_keys_props) => {

    const pulling = useRef<boolean>(false)
    const {set_show_tab} = useContext(show_tab_context_)
    const {set_user_data} = useContext(user_data_context_)
    const {set_show_manage_register_widgets, set_register_msg} = useContext(manage_register_widgets_context_)
    

    const send_fetch = async() => {
        
        if(passcode.length!=6){set_msg('<span style="color:red">Passcode should be 6 characters!</span>'); return}
        if(pulling.current) return
        const submit_btn = document.getElementById('submitBtn') as HTMLButtonElement

        try{
            if(submit_btn) {submit_btn.style.opacity = '0.6'; submit_btn.style.pointerEvents = 'none'}
            pulling.current = true
            const response = await fetch(base_fetch_url+`/verify_op/?auth_token=${auth_token}&passcode=${passcode}`,{
                method:'GET',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },
            
            })
            const data = await response.json()
            if(data.passcode_incorrect){
                set_msg('<span style="color:red">Incorrect passcode!</span>')
                if(submit_btn) {submit_btn.style.opacity = '1'; submit_btn.style.pointerEvents = 'auto'}
                return
            }
            if(data.reset_password_procced){
                set_user_data({passcode:passcode,auth_token:auth_token});
                set_show_tab &&  set_show_tab('change_password_view')
            }
            if(data.loged_in)window.location.reload()
            if(data.user_created){
                console.log('user created');
                set_show_manage_register_widgets('show partial'); 
                set_register_msg('<span style="color:green">Account was created you can now log in!</span>')
            }

            //only prints in dev
            console.log(data)

        }finally{
            setTimeout(() => {
                pulling.current = false
            }, 200);
        }
    }

    useEffect(()=>{send_fetch()},[call_me])

    return (<></>)

}


export default Send_keys