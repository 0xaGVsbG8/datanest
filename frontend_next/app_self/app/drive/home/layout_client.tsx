'use client'
import {base_fetch_url, doc_title} from "../../config"
import { useEffect, useState, useRef} from "react";
import {redirect} from 'next/navigation'
import Operations_tab from "./comps/operations_tab"
import Fetching_data_animation from "./comps/fetching_data_animation";
import { Op_confirmation_tab_data_props, Op_confirmation_tab_context_props } from "../types";
import { coms_template, Set_coms, Set_operations_count, operations_tab_context_props } from "../types";
import { fetched_data } from "../types"
import { token_ls_template } from "../types"

import {
    Op_confirmation_tab_context_, 
    operations_tab_context_, 
    wait_animation_context_, 
    block_ui_parts_context_,
    block_ui_parts_props,default_block_ui_parts, 
    set_repull_data_context_, 
    fetched_data_context_, 
    block_record_selector_context, 
    token_ls_context, 
    stop_ctrl_a_listener_context_, 
    inside_preview_context_
} from "./layout_contexts";




export default function Layout_client({ children }: { children: React.ReactNode }) {    

    
    const [auth, set_auth] = useState<boolean>(false)
    const [fetched_state,set_fetched] = useState<boolean>(false)
    const fetched_ref = useRef<boolean>(false)

    const [coms, set_coms] = useState<coms_template>([])
    const [ operations_count, set_operations_count ] = useState<number>(0)

    const [play_animation, set_play_animation] = useState<boolean>(false)

    const [repull_data, set_repull_data] = useState<number>(0)
    const [hide_section, set_hide_section] = useState<boolean>(true)
    const [search_type, set_search_type] = useState<'normal' | 'whole' | 'hold'>('hold')

    const [ fetched_data , set_fetched_data ] = useState<fetched_data | null>(null)
    
    const [block_ui_parts, set_block_ui_parts] = useState<block_ui_parts_props>(default_block_ui_parts)
    const block_record_selector = useRef<boolean>(false)
    
    const token_ls = useRef<token_ls_template>({})

    const stop_ctrl_a_listener = useRef<boolean>(false)

    const [search_input, set_search_input] = useState<string>('')

    const inside_preview = useRef<boolean>(false)


    const [confirmationData, setConfirmationData] = useState<Op_confirmation_tab_data_props>({
        title: '', 
        show_confirmation_tab:false,
        content_msg: '',
        confirm_btn_className: 'op_confirmation_tab-del-btn',
        confirm_btn_content: 'Cancel',
        confirm_behaviour: ()=>{},
        cancel_behaviour: ()=>{},
        show_cancel_btn: true
    })


    
    useEffect(()=>{
        if(!fetched_ref.current){
            fetched_ref.current = true
            const url = base_fetch_url+"/auth-creds/"
            try{
                fetch(url,{
                    method:'POST',
                    credentials:'include',
                    headers:{
                        "Content-Type": "application/x-www-form-urlencoded",
                        "protocol":"init"
                    },

                    body:JSON.stringify({

                    })
                    })
                    .then(response => {
                        return response.json(); 
                    })
                    .then(data => {
                        set_fetched(true)
                        if(data){
                            set_auth(true)
                        }
                })
            }catch(err){}
        }
    },[])


    if(fetched_state){
        if(auth){
            return (
                <>
                    <inside_preview_context_.Provider value={inside_preview}>
                        <stop_ctrl_a_listener_context_.Provider value={stop_ctrl_a_listener}>
                            <token_ls_context.Provider value={token_ls}>
                                <block_record_selector_context.Provider value={block_record_selector}>
                                    <block_ui_parts_context_.Provider value={{set_block_ui_parts, block_ui_parts}}>
                                        <fetched_data_context_.Provider value={{set_fetched_data, fetched_data}}>
                                            <set_repull_data_context_.Provider value={{set_repull_data,set_hide_section,set_search_type,set_search_input, repull_data, hide_section, search_type, search_input}}>
                                                <wait_animation_context_.Provider value={{play: set_play_animation}}>

                                                    {play_animation && (<Fetching_data_animation></Fetching_data_animation>)}
                                                    <Op_confirmation_tab_context_.Provider value={{
                                                        confirmationData,
                                                        setConfirmationData
                                                    }}>

                                                            <operations_tab_context_.Provider value={{coms, set_coms, set_operations_count, operations_count}}>
                                                                <Operations_tab coms={coms} operations_count={operations_count}></Operations_tab>
                                                                    <div id="portal-root"></div>
                                                                    {children}
                                                            </operations_tab_context_.Provider>


                                                    </Op_confirmation_tab_context_.Provider>

                                                    
                                                </wait_animation_context_.Provider>
                                            </set_repull_data_context_.Provider>
                                        </fetched_data_context_.Provider>
                                    </block_ui_parts_context_.Provider>
                                </block_record_selector_context.Provider>
                            </token_ls_context.Provider>
                        </stop_ctrl_a_listener_context_.Provider>
                    </inside_preview_context_.Provider>
                </>
            );
        }
        else{
            redirect(`/drive/auth/login/`)
        }

    }

}