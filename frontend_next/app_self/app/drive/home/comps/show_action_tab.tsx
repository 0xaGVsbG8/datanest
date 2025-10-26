'use client'
import { createPortal } from "react-dom"
import React, { useCallback, useEffect, useState, useRef, createContext, useContext } from "react"
import '../styles/show_action_tab.css' 
import Rename_tab from "./rename"
import '../styles/rename_tab.css'
import Move_items from "./move_items"
import Share_item_tab from "./share_item_tab"
import Remove_items from "./remove_items"

import { 
  Op_confirmation_tab_context_, 
  fetched_data_context_, 
  block_record_selector_context 
} from "../layout_contexts";
import { base_fetch_url } from "../../../config";
import nextConfig from "@/next.config"



interface show_action_tab_props{
    id: number
    isFavourite: boolean
    path: string
    name: string
    token: string
    root_token: string
    stop_ctrl_a_listener: React.MutableRefObject<boolean>
    inside_action_tab: React.MutableRefObject<boolean>
    editable: boolean
    owner: string
    me: string
    viewing_widgets: boolean
}

type if_remove_move_btn_context_props = {
    dispatcher: React.Dispatch<React.SetStateAction<boolean>>
}


export const if_remove_move_btn_context_ = createContext<if_remove_move_btn_context_props>({dispatcher:()=>{}}) 



export const inside_action_tab_context_ = createContext<React.MutableRefObject<boolean>>({current: false})


const Show_action_tab = ({
    id, 
    isFavourite, 
    path, 
    name, 
    token, 
    root_token, 
    stop_ctrl_a_listener, 
    inside_action_tab, 
    editable, 
    owner, 
    me,
    viewing_widgets
}:show_action_tab_props) => {

    const [show_action_tab, set_show_action_tab] = useState<boolean>(false)
    const [isFavourite_local, setIsFavourite_local] = useState<boolean>(isFavourite)
    const isFavourite_local_ref = useRef<boolean>(isFavourite)

    const { fetched_data , set_fetched_data } = useContext(fetched_data_context_)
    

    const mounted = useRef<boolean>(false)



    const [show_rename_tab, set_show_rename_tab] = useState<boolean>(false)
    const [show_move_tab, set_show_move_tab] = useState<boolean>(false)
    const [show_share_item_tab, set_show_share_item_tab] = useState<boolean>(false)

    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)


    const mounted_listener = useRef<boolean>(false)

    const block_record_selector = useContext(block_record_selector_context)

    const [show_this_move_btn, set_show_this_move_btn] = useState<boolean>(true)




    const Readjust =()=>{
        const show_tab_btn = document.getElementById(`action_tab_show_btn${id}`) as HTMLButtonElement


        const action_tab_content_div = document.getElementById(`action_tab_content${id}`) as HTMLDivElement

        const btn_rect = show_tab_btn.getBoundingClientRect()
        const action_tab_content_rect = action_tab_content_div.getBoundingClientRect()

        let top_pos = btn_rect.bottom + window.scrollY

        if(top_pos + action_tab_content_div.clientHeight > window.innerHeight){
            action_tab_content_div.style.bottom = `${10}px`
            
        }else{
            action_tab_content_div.style.top = `${top_pos}px`
        }

        action_tab_content_div.style.left = `${btn_rect.left - action_tab_content_rect.width + btn_rect.width}px`


    }



    useEffect(()=>{

        const on_handler = () => {
                set_show_action_tab(false)
        }

        const readjust_handler = () =>{
            setTimeout(()=>{Readjust()},3)
        }

        if(!show_action_tab){return}

        if(show_action_tab){

            setTimeout(()=>{Readjust()},3)
            window.addEventListener('mousedown',on_handler)
            window.addEventListener('resize',readjust_handler)
            return () => {window.removeEventListener('resize',readjust_handler), window.removeEventListener('mousedown',on_handler)}
        }



    },[show_action_tab])





    const rem_item = useCallback((item_name: string, func: ()=>void)=>{

        const bring_container_back = () => {
            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
        }

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: `Are you sure that you want to remove '${item_name}'?`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Remove',
            confirm_behaviour: ()=>{bring_container_back(),stop_ctrl_a_listener.current = false;inside_action_tab.current = false;block_record_selector.current = false;func()},
            cancel_behaviour: ()=>{bring_container_back(),stop_ctrl_a_listener.current = false;inside_action_tab.current = false;block_record_selector.current = false;},
        }))
        
    },[])



    const change_favourite_state = async() => {
        const response = await fetch(base_fetch_url+`/sec/change-favourite-state/?item_token=${encodeURIComponent(token)}&current_state=${encodeURIComponent(isFavourite_local_ref.current)}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
        })

        const data = await response.json()  
        if(data.changes){
            setIsFavourite_local(c=>!c);
            isFavourite_local_ref.current = !isFavourite_local_ref.current
            if(window.location.href.includes('filter_by_favs')){
                set_fetched_data(prev=>{
                    if(!prev) return prev
                    const newPrev = { ...prev }
                    newPrev.items_ls = prev?.items_ls.filter(record=>record.path_token!=token)
                    return newPrev
                })
            }
        }
    }


    useEffect(()=>{
        if(mounted_listener.current) return
        mounted_listener.current = true

        const handler = () => {
            set_show_action_tab(false)
        }

        document.getElementById('data-section-records')!.addEventListener('scroll',handler)
        return () => {document.getElementById('data-section-records')!.removeEventListener('scroll',handler)}

    },[])




        
    return (
        <div className="action_tab special-tab">
            <div className="action_tab-placeholder">
                <button className="action_tab_show_btn" id={`action_tab_show_btn${id}`} onClick={()=>{
                        set_show_action_tab(c=>!c)
                    }} aria-label="Pokaż akcje">
                <img alt="" src={`${nextConfig.assetPrefix}/assets/expand.png`} className="expand-img"></img>
                </button>
                

                    <inside_action_tab_context_.Provider value={inside_action_tab}>
                            {<Rename_tab  show_rename_tab = {show_rename_tab} name={name} token={token} set_show_rename_tab={set_show_rename_tab}></Rename_tab>}

                            <if_remove_move_btn_context_.Provider value={{dispatcher: set_show_this_move_btn}}>
                                <Move_items index={id} set_show_move_tab={set_show_move_tab} show_move_tab = {show_move_tab} path = {path} name = {name} root_token={root_token}  predefined_data={[{'token': token, path : path}]}></Move_items>
                            </if_remove_move_btn_context_.Provider>

                            <Share_item_tab token={token} set_show_share_item_tab={set_show_share_item_tab} show_share_item_tab={show_share_item_tab}></Share_item_tab>

                            <Remove_items index={id} show = {false} route_token={root_token} multiple = {true}  predefined_data={[{
                                name: name,
                                token: token,
                            }]}
                            ></Remove_items>

                    </inside_action_tab_context_.Provider>


                {show_action_tab && createPortal(
                    <div className="action_tab_content" onPointerDown={()=>{
                        set_show_action_tab(false)
                        stop_ctrl_a_listener.current = true
                        inside_action_tab.current = true
                        block_record_selector.current = true
                        
                        setTimeout(() => {
                            document.querySelectorAll('.data-section-record').forEach((e)=>{e.classList.remove('data-section-record_hover')})
                        }, 0);
                    }} 
                    id={`action_tab_content${id}`  }
                    style={{opacity: show_rename_tab ? '0':'1'}}
                    >
                        <div onPointerDown={()=>{document.getElementById(`download_btn${id}`)?.click()}}><img src={`${nextConfig.assetPrefix}/assets/download_icon.jpg`} alt=""></img><button>Download</button></div>

                        {editable  && <div onPointerDown={()=>{set_show_rename_tab(c=>!c)}}><img src={`${nextConfig.assetPrefix}/assets/edit.png`} alt=""></img><button>Rename</button></div>}



                        <div onPointerDown={()=>{change_favourite_state()}}>
                            <button>
                                ⭐&nbsp;{isFavourite_local ? 'Remove from favourites'  : 'Add to favourites'}
                            </button>
                        </div>

                        {show_this_move_btn && editable && owner==me && viewing_widgets && <div onPointerDown={()=>{set_show_move_tab(c=>!c)}} className="show-action-tab-move-btn"><img alt="" src={`${nextConfig.assetPrefix}/assets/move.png`}></img><button>Move</button></div>}



                        {editable && owner==me  && <div onPointerDown={()=>{set_show_share_item_tab(c=>!c)}}><img src={`${nextConfig.assetPrefix}/assets/share.png`} alt=""></img><button>Share</button></div>}

                        {((editable && viewing_widgets) || owner==me) &&<div onPointerDown={()=>{rem_item(name,()=>document.getElementById(`rem_btn${id}`)?.click())}}><img src={`${nextConfig.assetPrefix}/assets/trash.png`} alt=""></img><button>Remove</button></div>}

                    </div>, 
                document.body)}
            </div>
        </div>
    )

}



export default Show_action_tab