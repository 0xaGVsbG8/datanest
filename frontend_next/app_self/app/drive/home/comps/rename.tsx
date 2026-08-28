'use client'
import React, { useEffect, useRef, useCallback, useContext } from "react"
import { createPortal } from "react-dom"
import { base_fetch_url } from "@/app/config"
import { stop_ctrl_a_listener_context_, block_record_selector_context, fetched_data_context_ } from '../layout_contexts'
import { inside_action_tab_context_ } from "./show_action_tab"
import { is_shared_filter } from "./pull_data/pull_data"


interface rename_tab_props{
    name: string
    token: string
    show_rename_tab: boolean
    set_show_rename_tab: React.Dispatch<React.SetStateAction<boolean>>
}




const Rename_tab = ({name, token, show_rename_tab, set_show_rename_tab}: rename_tab_props) => {

    const input_value = useRef<string>('')

    const stop_ctrl_a_listener_context = useContext(stop_ctrl_a_listener_context_)
    const inside_action_tab_context = useContext(inside_action_tab_context_)
    const block_record_selector = useContext(block_record_selector_context)
    const {fetched_data, set_fetched_data} = useContext(fetched_data_context_)



    const rename_item = useCallback(()=>{
        if(input_value.current == ''){
            document.getElementById('rename_tab_input')?.focus()
            return
        }

        fetch(base_fetch_url+'/sec/rename-item/',{
            method:'POST',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },

            body:JSON.stringify({
                'token':token,
                "new_name": input_value.current,
                filter_by:  is_shared_filter() ? 'shared' : 'off'

            })
        })
        .then(response => {
            return response.json(); 
        })
        .then(data => {
            if(data.result && data.new_name){
                set_show_rename_tab(false)
                set_fetched_data(prev=>{
                    if(!prev) return prev
                    const newPrev = {...prev}
                    
                    newPrev.items_ls = newPrev.items_ls.filter(item=>{

                        if(item.path_token==token){
                            item.name = data.new_name
                            item.last_change = data.last_change
                        }
                        return item
                    })

                    return newPrev
                })
            }
        })

    },[])




    useEffect(()=>{
        
        if(show_rename_tab){
            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('#rename_tab, #rename_tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{
            stop_ctrl_a_listener_context.current = false
            inside_action_tab_context.current = false
            block_record_selector.current = false


            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
        }
        
    },[show_rename_tab])

    
    useEffect(()=>{
        const handler = (e: KeyboardEvent) => {
            if(e.key=='Enter'){
                document.getElementById('rename_tab_btns_placeholder_apply')?.click()
            }
        }

        const input = (document.getElementById('rename_tab_input') as HTMLInputElement)
        if(input){
            input.value = name
        }
        document.getElementById('rename_tab_input')?.focus()
        document.getElementById('rename_tab_input')?.addEventListener('keydown', handler)
        return () => document.getElementById('rename_tab_input')?.removeEventListener('keydown',handler)
    })


    return (<>
        {show_rename_tab && createPortal(
            <div className="special-tab" id="rename_tab" style={{position:'fixed',top:'50%',left:'50%'}}>
                <div id="rename_tab_title"><b>Rename:</b> <u>{name}</u></div>
                <div><input placeholder="..." id="rename_tab_input" onInput={(e: React.ChangeEvent<HTMLInputElement>)=>{input_value.current = e.target.value}}></input></div>
                <div id="rename_tab_btns_placeholder">
                    <button id="rename_tab_btns_placeholder_cancel" onClick={()=>set_show_rename_tab(c=>!c)}>Cancel</button>
                    <button id="rename_tab_btns_placeholder_apply" onClick={rename_item}>Apply</button>
                </div>
            </div>,document.body
        )}
    </>)

}


export default Rename_tab