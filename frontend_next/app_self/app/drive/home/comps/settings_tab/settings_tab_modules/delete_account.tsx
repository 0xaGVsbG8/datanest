
import { base_fetch_url } from "@/app/config"
import { use_module_context_ } from "../settings_tab"
import { useContext, useEffect} from "react"
import { Op_confirmation_tab_context_ }  from "../../../layout_contexts"
import { send_log_out } from "./log_out"

const Delete_account_mod = () => {


    const use_module_context = useContext(use_module_context_)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)


    const send_delete_account = async() => {
        const response = await fetch(base_fetch_url+'/sec/delete-account/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
            },
        })
        const data = await response.json()
        await send_log_out(false)
        if(data.deleted){window.location.reload()}
    }


    const hide_me = () => {
        use_module_context.set_use_module(prev=>({
            ...prev,
            delete_account: false
        }))
    }


    const delete_account = () => {

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: `Are you sure that you want to delete your account? This includes all your files and directories. This action is irreversible!`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{hide_me();send_delete_account()},
            cancel_behaviour: ()=>{hide_me()}
        }))

    }


    useEffect(()=>{
        if(!use_module_context.use_module.delete_account){return}
        delete_account()
    },[use_module_context.use_module.delete_account])


    

    return (<></>)

}



export default Delete_account_mod