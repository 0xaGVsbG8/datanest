import { useContext, useEffect, useRef } from "react"
import { is_shared_filter } from "../../../comps/pull_data/pull_data"
import { base_fetch_url } from "@/app/config"
import { handle_upload_common_context } from "../handle_upload_contexts"
import { Op_confirmation_tab_context_ } from "../../../layout_contexts"

type Ask_for_upload_token_props = {
    path_token: string, 
    files: File[], 
    call_ask_for_upload_token: number
}


const Ask_for_upload_token = ({ call_ask_for_upload_token, path_token, files}:Ask_for_upload_token_props) => {
    

    const uploading_ref = useRef<boolean>(false)
    const asked_for_token = useRef<boolean>(false)

    const {set_received_token, set_call_for_begin_upload, packsize_ref} = useContext(handle_upload_common_context)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)

    const access_denied_pop_up = () => {


        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Access denied',
            show_confirmation_tab: true,
            content_msg: `You dont have access to commit changes here!`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{},
            cancel_behaviour: ()=>{},
            show_cancel_btn: false
        }))
    }


    const insufficient_space_pop_up = () => {
        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'insufficient space',
            show_confirmation_tab: true,
            content_msg: `Not enough space left on this storage!`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{},
            cancel_behaviour: ()=>{},
            show_cancel_btn: false
        }))
    }



    const send_fetch = async() => {

        if(asked_for_token.current) return
        asked_for_token.current = true

        if(uploading_ref.current){return}
        uploading_ref.current = true



        let packsize:number = 0
            

        for(const item of files){
            packsize_ref.current+=item.size
        }

        packsize = packsize_ref.current
        

        try{
            const response = await fetch(base_fetch_url+'/sec/gen-upload-token/',{
                method:'POST',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },

                body:JSON.stringify({
                    path_token: path_token,
                    packsize: packsize / (1024*1024),
                    filter_by:  is_shared_filter() ? 'shared' : 'off'
                })
            })
            const data = await response.json()
            if(!data){access_denied_pop_up(); return}
            if(data.insufficient_space){insufficient_space_pop_up(); return}
            if(!data.token){access_denied_pop_up(); return}

            const token = data.token
            set_received_token(token)
            set_call_for_begin_upload(c=>c+1)
            return token

        }finally{
            setTimeout(() => {
                asked_for_token.current = false
                uploading_ref.current = false
            }, 200);
        }

    }

    useEffect(()=>{
        send_fetch();
    },[call_ask_for_upload_token])


    return  (<></>)


}

export default Ask_for_upload_token