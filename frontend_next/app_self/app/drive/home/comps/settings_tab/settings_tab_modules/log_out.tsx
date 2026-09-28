
import { base_fetch_url } from "@/app/config"
import { use_module_context_ } from "../settings_tab"
import { useContext, useEffect, useState } from "react"
import { Op_confirmation_tab_context_ }  from "../../../layout_contexts"


export const send_log_out = async(reload: boolean = true) => {
    const response = await fetch(base_fetch_url+'/log-out/',{
        method:'GET',
        credentials:'include',
        headers:{
            "Content-Type": "application/json",
        },
    })
    const data = await response.json()
    if(data.log_out && reload){window.location.reload()}
}



const Log_out_mod = () => {


    const use_module_context = useContext(use_module_context_)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)




    const hide_me = () => {
        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            show_confirmation_tab: false,
            unlock_container_afterwards: false
        }))
        use_module_context.set_use_module(prev=>({
            ...prev,
            log_out: false
        }))
    }


    const log_out = () => {

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            unlock_container_afterwards: false,
            content_msg: `Are you sure that you want to be loged out?`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{hide_me();send_log_out()},
            cancel_behaviour: ()=>{hide_me()}
        }))

    }


    useEffect(()=>{
        if(!use_module_context.use_module.log_out){return}
        log_out()
    },[use_module_context.use_module.log_out])


    

    return (<></>)

}



export default Log_out_mod