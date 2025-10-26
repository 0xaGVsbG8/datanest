import { createContext, useEffect, useState, useRef, useCallback, useContext } from "react"
import { fetched_data_context_, token_ls_context, set_repull_data_context_, block_record_selector_context } from "../layout_contexts"

type predefined_data_props = {
    token: string
    path: string
}





const Find_if_block_move_items = ({root_token}:{root_token: string}) => {

    const token_ls = useContext(token_ls_context)
    const {fetched_data} = useContext(fetched_data_context_)
    const toggling = useRef<boolean>(false)
    const checking = useRef<boolean>(false)


    const gather_items = () => {
        let token_ls_for_fetch: predefined_data_props[] = []
        const records_array = document.querySelectorAll<HTMLDivElement>('.data-section-record:not(#fake-record)')
        for(const [index, el] of records_array.entries()){
            
            el.classList.remove('data_section_record_selected');
            
            const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
            
            if(checkbox.checked) {
                const item_name = document.getElementById('data-real-name'+index)
                if(!item_name) continue
                    // console.log(item_name)
                    token_ls_for_fetch.push({"token": token_ls.current[item_name!.innerHTML].token, "path": token_ls.current[item_name!.innerHTML].path})
            }
        }
        return token_ls_for_fetch
    }


    const search_filtered = () => {

        const move_btn = document.querySelectorAll<HTMLElement>('#move-items-pd-btn, #move-items-pd-btn *')

        // console.log('no predefined data')
        const gathered_items = gather_items()
        const paths_ls = gathered_items.map(item=>item.path)

        const children:string[] = []
        const to_keep: predefined_data_props[] = []

        if(root_token!='main') to_keep.push({'path':"Home","token":'main'})

        let new_tree_ls = fetched_data?.tree_ls.filter(item=>!paths_ls.includes(item.path))
        
        for(const item of gathered_items){
            // console.log(item, 'to move')
            for(const sub_item of new_tree_ls!){
                if(item==sub_item || children.includes(sub_item.path)) continue
                // console.log(sub_item, 'possibly to move!')
                if(sub_item.path.startsWith(item.path)) {console.log('Children detected'); children.push(sub_item.path); continue}
                !to_keep.includes(sub_item) && to_keep.push(sub_item)
            }
        }


        // console.log(yoyo, 'yoyo')
        
        if(to_keep.length != 0){
            if(move_btn){
                for(const el of move_btn){
                    el.style.setProperty('pointer-events', 'auto', 'important')
                    el.style.setProperty('opacity', '1', 'important')
                }
            }
        }

        else{
            if(move_btn){
                for(const el of move_btn){
                    el.style.setProperty('pointer-events', 'none', 'important')
                    el.style.setProperty('opacity', '0.6', 'important')
                }
            } 
        }

            console.log('found length -->',to_keep , to_keep.length)


    }


    useEffect(()=>{

        const handle_move = () => {
            if(toggling.current) {
                if(checking.current) return
                checking.current = true
                search_filtered()
                // console.log('fetching')
                setTimeout(() => {
                    checking.current = false
                }, 130);
            }
        }

        const handle_press = () => {
            toggling.current = true
        }

        const handle_release = () => {
            toggling.current = false
        }

        window.addEventListener('mousemove',handle_move)
        window.addEventListener('mousedown',handle_press)
        window.addEventListener('mouseup',handle_release)


        
        
        return () => {
            window.removeEventListener('mousemove',handle_move)
            window.removeEventListener('mousedown',handle_press)
            window.removeEventListener('mouseup',handle_release)
        }

    },[])




    // return (<></>)


}

export default Find_if_block_move_items