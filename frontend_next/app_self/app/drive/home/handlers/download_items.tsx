
import React, { useCallback, useRef, useContext} from "react"
import { base_fetch_url, base_ws_url, one_zip_per_conn } from "@/app/config"
import { operations_tab_context_, token_ls_context } from '../layout_contexts' 
import { is_shared_filter } from "../comps/pull_data/pull_data"
import { untoggle_all_records } from "../comps/pull_data/pull_data_modules/item_selectorMobile"
import are_items_selected from "../comps/pull_data/pull_data_modules/are_items_selected"




type predefined_data_props = {
    name: string,
    token: string
} 


interface download_dir_props{
    id: number
    owner: string
    route_token: string
    multiple: boolean
    predefined_data?: predefined_data_props | null
}

type progress_data = {
    progress: number,
    index: number,
    total_count: number
    zip_url: string
    zip_name: string
}

type multiple_items = {
    name: string
    token: string
}



const Download_item = ({id, owner, route_token, multiple = false, predefined_data = null}: download_dir_props) => {

    const connection_established = useRef<boolean>(false)
    const operations_tab_context = useContext(operations_tab_context_)
    const ws_ls = useRef<WebSocket[]>([])
    const downloading_ref = useRef<boolean>(false)

    const token_ls = useContext(token_ls_context)



    const gen_access_token = useCallback(() => {
        
        
        let multiple_items: multiple_items[] = []



        if(downloading_ref.current){return}
        downloading_ref.current = true


        setTimeout(() => {
            downloading_ref.current = false
        }, 10);


        
        if(multiple){
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
            if(predefined_data === null) {return}
            multiple_items.push({
                name: predefined_data?.name,
                token: predefined_data?.token 
            })
        }

        

 
        fetch(base_fetch_url+'/sec/gen-zip-dir-token/',{
            method:'POST',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init",
                "multiple": true.toString()
                
            },

            body:JSON.stringify({
                token: route_token,
                items_ls: multiple_items,
                filter_by:  is_shared_filter() ? 'shared' : 'off'
            })
        })
        .then(response => {
            return response.json(); 
        })
        .then(data => {
            const selected_records_counter = document.getElementById('data-select-option-special-selected-count') as HTMLDivElement
            selected_records_counter.innerHTML = String(0)
            if(data.url_token) open_ws_conn(data.url_token)
        })

        untoggle_all_records(); are_items_selected()

    },[])



    const react_on_reply = useCallback((id: number, ws: WebSocket)=>{
        ws.onmessage = (e: MessageEvent) => {

            const data = JSON.parse(e.data) as progress_data

            let perc: string = ''
            if(data.progress){

                perc = String(data.progress)

                if(data.progress==100){perc='100.00'; }

                const msg = `Zipping ${data.index} item/s out of ${data.total_count} | ${perc}%`
                
                operations_tab_context.set_coms(prev=>({
                    ...prev,
                    [id]:[String(msg), ()=>{ws.close()}],
                }))

            
            }
            
            if(data.zip_url){
                const zip_arc_url = base_fetch_url + data.zip_url
                const a = document.createElement('a')
                a.href = zip_arc_url
                a.download = data.zip_name
                document.body.appendChild(a)
                a.click()
                a.remove()
                ws.close()
            }
        }

    

    },[])










    const open_ws_conn = useCallback((token: string) => {
        const ws = new WebSocket(base_ws_url+`/track-zipping-progress/?access_token=${token}`)
        if(ws_ls.current.length!=0){
            if(one_zip_per_conn){
                ws.close()
                ws_ls.current = []
            }

        }
        ws.onopen = async () =>{
            ws_ls.current.push(ws)
            connection_established.current = true
            operations_tab_context.set_operations_count(c=>{
                c+=1
                react_on_reply(c, ws)
                return c
            })
        }

    },[])




    return (<button style={{visibility:'hidden',position:'absolute'}}  id={`download_btn${id}`} onClick={()=>gen_access_token()}>⬇️</button>)
}


export default Download_item