
import { base_fetch_url } from "@/app/config"
import { use_module_context_ } from "../settings_tab"
import { useContext, useEffect, useState } from "react"
import { Op_confirmation_tab_context_ }  from "../../../layout_contexts"
import { job_info_context_ } from "../settings_tab"



const Erase_disk_mod = () => {


    const use_module_context = useContext(use_module_context_)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)
    const job_info_context = useContext(job_info_context_)



    const send_erase_disk = async() => {

        const msg = 'Erasing the entire disk job has been assigned!'

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


        const response = await fetch(base_fetch_url+'/sec/erase-disk/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
            },

        })
        const data = await response.json()
        if(data.erased){
            setTimeout(() => {
                window.location.reload()
            }, 3000);
        }
    }


    const hide_me = () => {
        
        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            show_confirmation_tab: false,
            unlock_container_afterwards: false
        }))

        use_module_context.set_use_module(prev=>({
            ...prev,
            erase_disk: false
        }))
    }


    const erase_disk = () => {

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: `Are you sure that you want to erase your whole disk data? This action is irreversible!`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{hide_me();send_erase_disk()},
            cancel_behaviour: ()=>{hide_me()}
        }))

    }


    useEffect(()=>{
        if(!use_module_context.use_module.erase_disk){return}
        erase_disk()
    },[use_module_context.use_module.erase_disk])


    

    return (<></>)

}



export default Erase_disk_mod