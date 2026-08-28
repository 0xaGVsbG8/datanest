
import { base_fetch_url } from "@/app/config"
import { use_module_context_ } from "../settings_tab"
import { useContext, useEffect, useState } from "react"
import { Op_confirmation_tab_context_ }  from "../../../layout_contexts"
import { job_info_context_ } from "../settings_tab"



type Rem_dups_mod_props = {
    token: string
}

export const send_rem_dups_fetch = async(token: string) => {

    const response = await fetch(base_fetch_url+'/sec/rem-dups/',{
        method:'POST',
        credentials:'include',
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            'path_token': token
        })
    })


    const data = await response.json()
    if(data.dups){
        setTimeout(() => {
            window.location.reload()
        }, 2000);
    }

}

const Rem_dups_mod = ({token}:Rem_dups_mod_props) => {


    const use_module_context = useContext(use_module_context_)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)
    const job_info_context = useContext(job_info_context_)



    const send_rem_dups = async() => {

        const msg = 'Duplicates files removal job has been assigned!'

        job_info_context.set_job_info({
            show: true,
            msg: msg,
            opacity: 1
        })

        setTimeout(() => {
            if(job_info_context.job_info.msg != msg){return}
            job_info_context.set_job_info({
                show: false,
                msg: msg,
                opacity: 0
            })
        }, 3000);
        

        send_rem_dups_fetch(token)



    }


    const hide_me = () => {
        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            unlock_container_afterwards: false,
            show_confirmation_tab: false
        }))
        
        use_module_context.set_use_module(prev=>({
            ...prev,
            rem_dups: false
        }))
    }


    const rem_dups = () => {

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: 'Are you sure that you want to perform a duplicate files removal job on your entire disk? This action is irreversible!',
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{hide_me();send_rem_dups()},
            cancel_behaviour: ()=>{hide_me()}
        }))

    }


    useEffect(()=>{
        if(!use_module_context.use_module.rem_dups){return}
        rem_dups()
    },[use_module_context.use_module.rem_dups])


    

    return (<></>)

}



export default Rem_dups_mod