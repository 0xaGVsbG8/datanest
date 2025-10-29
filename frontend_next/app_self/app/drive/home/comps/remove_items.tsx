
import {useRef, useCallback, useContext, useEffect} from 'react'
import { token_ls_template } from "../../types"
import { base_fetch_url } from '@/app/config'
import {set_repull_data_context_, token_ls_context, fetched_data_context_} from '../layout_contexts'
import { untoggle_all_records } from './pull_data/pull_data_modules/item_selectorPC'
import { is_shared_filter } from './pull_data/pull_data'
import nextConfig from '@/next.config'
import are_items_selected from './pull_data/pull_data_modules/are_items_selected'



type predefined_data = {
    token: string
    name: string
}


interface remove_item_props{
    index: number
    show: boolean
    route_token: string
    multiple: boolean
    predefined_data?: predefined_data[] | null
}

type multiple_items = {
    name: string
    token: string
}


const Remove_items = ({index, show, route_token, multiple = false, predefined_data = null}: remove_item_props) => {
    
    const {fetched_data, set_fetched_data} = useContext(fetched_data_context_)
    const token_ls = useContext(token_ls_context)


    
    const make_rem_ls = useCallback(async()=>{
        
        let multiple_items:multiple_items[]= []
        
        
        if(!predefined_data && token_ls && token_ls.current){

            const records_array = document.querySelectorAll<HTMLDivElement>('.data-section-record:not(#fake-record)')
            for(const [index, el] of records_array.entries()){
                
                el.classList.remove('data_section_record_selected');
                
                const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
                
                if(checkbox.checked) {
                    const item_name = document.getElementById('data-real-name'+index)
                    if(!item_name) continue
                        multiple_items.push({
                            name: item_name!.innerHTML ,
                            token: token_ls.current[item_name!.innerHTML].token
                        })
                }
            }

        }

        else{
            if(predefined_data){
                multiple_items = predefined_data
            }
        }



        const response = await fetch(base_fetch_url+'/sec/rem-items/',{
            method:'POST',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init",
                "multiple": multiple.toString()
                
            },

            body:JSON.stringify({
                token: route_token,
                items_ls: multiple_items,
                filter_by:  is_shared_filter() ? 'shared' : 'off'

            })
        })
        const data = await response.json()
        if(data.op && data.deleted){
            untoggle_all_records()
            are_items_selected()
            
        }else{window.location.reload();return}
        const records_name = data.deleted
        set_fetched_data(prev=>{
            if(!prev) return prev

            const newPrev = {...prev}

            const filtered =newPrev.items_ls.filter(item=>{
                if(!records_name.includes(item.name)){ return item }
            })

            newPrev.items_ls = filtered

            return newPrev
        })

    


    },[fetched_data])








    return (
        <div id={`rem_btn${index}`} onClick={()=>make_rem_ls()} style={{
            visibility: show ? 'visible' : 'hidden',
            pointerEvents: show ? 'auto' : 'none',
            position: show ? 'static' : 'absolute',
            transform: 'scale(0.7)'
        }}>
            <img src={`${nextConfig.assetPrefix}/assets/trash.png`} alt="global-rem" id={`rem_btn${index}pic`}></img>
        </div>
    )

}



export default Remove_items