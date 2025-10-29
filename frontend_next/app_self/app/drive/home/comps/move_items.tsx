
import { createPortal } from "react-dom"
import { createContext, useEffect, useState, useRef, useCallback, useContext } from "react"
import { base_fetch_url } from "../../../config"
import "../styles/move_item_tab.css"
import { if_remove_move_btn_context_ } from "./show_action_tab"
import { inside_action_tab_context_ } from "./show_action_tab"
import {tree_ls_props } from "../../types"
import { fetched_data_context_, token_ls_context, set_repull_data_context_, block_record_selector_context, stop_ctrl_a_listener_context_ } from "../layout_contexts"
import { untoggle_all_records } from "./pull_data/pull_data_modules/item_selectorMobile"


type predefined_data_props = {
    token: string
    path: string
}

type move_items_props = {
    index: number
    set_show_move_tab: React.Dispatch<React.SetStateAction<boolean>>
    show_move_tab: boolean
    path: string
    name: string
    root_token: string
    // parent: string | null
    predefined_data: predefined_data_props[] | null
}

type token_choice_context_props = {
    // token: string
    set_selected_Token: React.Dispatch<React.SetStateAction<string>>
}

export const token_choice_context_ = createContext<token_choice_context_props>({set_selected_Token:()=>{}})


const Move_items = ({
    set_show_move_tab, 
    show_move_tab, 
    path, 
    name, 
    root_token,
    predefined_data = null
}: move_items_props) => {


    const [selected_token, set_selected_Token] = useState<string | null>(null)
    const [filtered_tree_ls, set_filtered_tree_ls] = useState<tree_ls_props[]>([])
    const [is_token_selected, set_is_token_selected] = useState<boolean>(false)

    const [selected_records_count, set_selected_records_count] = useState<number>(0)

    const move_btn_ref = useRef<HTMLButtonElement>(null)


    const if_remove_move_btn_context  = useContext(if_remove_move_btn_context_)

    const {fetched_data} = useContext(fetched_data_context_)


    const {set_repull_data} = useContext(set_repull_data_context_)

    
    const stop_ctrl_a_listener_context = useContext(stop_ctrl_a_listener_context_)



    const token_ls = useContext(token_ls_context)

    const selected_token_ref = useRef<string | null>(null)


    const block_record_selector = useContext(block_record_selector_context)


    const [selected_items, set_selected_items] = useState<predefined_data_props[]>()


    
    const gather_items = ():predefined_data_props[] => {


        let token_ls_for_fetch: predefined_data_props[] = []
        set_selected_records_count(c=>0)
        

        if(!predefined_data && token_ls && token_ls.current){
            


            const records_array = document.querySelectorAll<HTMLDivElement>('.data-section-record:not(#fake-record)')
            for(const [index, el] of records_array.entries()){
                
                el.classList.remove('data_section_record_selected');
                
                const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
                
                if(checkbox.checked) {
                    const item_name = document.getElementById('data-real-name'+index)
                    if(!item_name) continue
                        token_ls_for_fetch.push({"token": token_ls.current[item_name!.innerHTML].token, "path": token_ls.current[item_name!.innerHTML].path})
                        set_selected_records_count(c=>c+1)
                }
            }



        }
        else{
            if(predefined_data){
                token_ls_for_fetch = predefined_data
                set_selected_records_count(c=>c=predefined_data.length)
            }
        }

        set_selected_items(token_ls_for_fetch)
        return token_ls_for_fetch

    }

    


    const sendMoveFetch = useCallback(()=>{

        if(selected_token_ref.current===null){return}


        let token_ls_for_fetch:predefined_data_props[] = []

        if(!selected_items){
            token_ls_for_fetch = gather_items()
        }
        else{
            token_ls_for_fetch = selected_items
        }
        

        
        move_btn_ref.current!.disabled = true
        move_btn_ref.current!.style.opacity = '0.6'
        
        fetch(base_fetch_url+'/sec/move-item/',{
            method:'POST',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },

            body:JSON.stringify({
                'token_ls': token_ls_for_fetch,
                'dst_token': selected_token_ref.current
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if(data.result){
                set_repull_data(c=>c+1)
                set_show_move_tab(false)
            }
            untoggle_all_records()
            const all_checkbox = document.getElementById('data-select-option-special-checkbox') as HTMLInputElement
            if(all_checkbox) all_checkbox.checked =false
        })



    },[selected_token_ref.current])





    useEffect(()=>{
        

        if(show_move_tab){
            stop_ctrl_a_listener_context.current = true
            block_record_selector.current = true

            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('#move-items, #move-items *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{

            block_record_selector.current = false
            stop_ctrl_a_listener_context.current = false




            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
        }


    },[show_move_tab])




    //FILTERS IF GIVEN ITEM CAN BE MOVED TO A CERTAIN LOCATION (For instance PREVENTS USER FROM ASKING TO MOVE PARENT INTO A CHILDREN)
    useEffect(()=>{
        if(predefined_data && fetched_data){

            let new_tree_ls:tree_ls_props[] = []

            if(root_token!='main') new_tree_ls.push({'path':"Home","token":'main'})

            new_tree_ls = [...new_tree_ls, ...fetched_data.tree_ls]


            new_tree_ls = new_tree_ls.filter(item=>{
                if(item.path==fetched_data.current_dir+'/') return false
                if(item.path!=path && !item.path.startsWith(path)) return true
                else return  false
            })
            if(new_tree_ls.length==0){
                if_remove_move_btn_context.dispatcher(false)
            }
            set_filtered_tree_ls(new_tree_ls)
        }

        if(!show_move_tab) return
        if(!predefined_data){
            const gathered_items = gather_items()
            const paths_ls = gathered_items.map(item=>item.path)

            const children:string[] = []
            const to_keep: predefined_data_props[] = []

            if(root_token!='main') to_keep.push({'path':"Home","token":'main'})

            let new_tree_ls = fetched_data?.tree_ls.filter(item=>!paths_ls.includes(item.path))
            
            for(const item of gathered_items){
                for(const sub_item of new_tree_ls!){
                    if(item==sub_item || children.includes(sub_item.path)) continue
                    if(sub_item.path.startsWith(item.path)) {children.push(sub_item.path); continue}
                    !to_keep.includes(sub_item) && to_keep.push(sub_item)
                }
            }


            set_filtered_tree_ls(to_keep)
        }


    },[show_move_tab, fetched_data])




    return(
        <>
            {fetched_data && show_move_tab && filtered_tree_ls && createPortal(<div id="move-items" className="special-tab">
                
                <div id="move-items-placeholder">
                    <div id="move-items-title-placeholder">
                        <div id="move-items-title"><b>Move</b>&nbsp;<div>{predefined_data ? <span style={{textDecoration:"underline"}}> {name} </span> :  (<span><span style={{textDecoration:"underline"}}>{selected_records_count}</span> items</span>)  }</div> <div>&nbsp;to</div></div>
                    </div>
                    <div id="move-items-ls">
                        {filtered_tree_ls!.map((record, index)=>{
                            return (
                                <div className="move-items-ls-record" key={index} onClick={()=>{set_selected_Token(record.token);selected_token_ref.current = record.token}} style={{
                                    background: selected_token == record.token ? 'blue' : ''
                                }}>
                                    {record.path}
                                </div>
                            )
                        })}
                        {filtered_tree_ls.length == 0 && <div className="move-items-ls-record">No possible move options!</div>}
                    </div>
                </div>

                <div id="move-items-btns">
                    <button onClick={()=>set_show_move_tab(c=>!c)} id="move-items-btns-cancel">Cancel</button>
                    <button ref={move_btn_ref} id="move-items-btns-apply" style={{
                        pointerEvents: is_token_selected?'auto':'none',
                        opacity: is_token_selected?'1':'0.6',
                    }} onClick={()=>sendMoveFetch()}>Move</button>
                </div>
            </div>, document.body)}
        </>
    )

}

export default Move_items