


import { base_fetch_url } from "@/app/config"
import { token_ls_template } from "../../../../types"
import {fetched_data} from "../../../../types"
import { is_shared_filter, is_favourite_filter } from "../pull_data"
import { home_path } from "@/app/not-found"


type pull_data_props = {
    token: string
    filter_by: 'fav' | 'off' | 'shared'
    set_fetched_data: React.Dispatch<React.SetStateAction<fetched_data | null>> 
    data_pulled: React.MutableRefObject<boolean>
    token_ls:  React.MutableRefObject<token_ls_template>
    search_type_: 'normal' | 'whole' | 'hold'
    search_input_: string
    set_hide_section: React.Dispatch<React.SetStateAction<boolean>> 
}


let pulling = false
let puller: number = 0

const pull_data = async({token, filter_by, set_fetched_data,  data_pulled, token_ls, search_type_ = 'hold', set_hide_section , search_input_ = '',}:pull_data_props) => {


    if(search_type_ == 'hold') return
   

    if(pulling){return}
    pulling = true


    if(search_type_=='whole'){
        setTimeout(() => {
            pulling = false
        }, 2000);
        
    }else{
        setTimeout(() => {
            pulling = false
        }, 10);
    }

    
     

    set_fetched_data(prev=>{
        if(!prev) return prev
        const newPrev = {...prev}
        newPrev.items_ls = []
        return newPrev
    })


    puller+=1
    if(puller==1 && search_input_ == '') search_input_ = '`_'

    if(search_type_ == 'whole' && search_input_ == '') return


    const response = await fetch( base_fetch_url +'/sec/get_items/',{
        method:'POST',
        credentials:'include',
        headers:{
            "Content-Type": "application/json",
            "protocol":"init"
        },

        body:JSON.stringify({
            'path_token': token,
            'filter_by': filter_by,
            'search_type': search_type_,
            'search_input':search_input_,
        })
    })

    const received_data = await response.json() as fetched_data
    if(response.status==429){
        document.write('too many request sent from this device!')
        return
    }

    console.log(received_data)

    
    if(received_data.access == 'denied' || response.status === 404){
        setTimeout(() => {
            window.open(`${home_path}`,'_self')
        }, 300);
        return
    }

    const data = received_data
    if(!data.items_ls) return

    set_hide_section(false)

    
    data.items_ls.sort((a,b)=>{
        const aIsBinary = a.mimetype?.includes('application') ? 1 : 0;
        const bIsBinary = b.mimetype?.includes('application') ? 1 : 0;
        return aIsBinary - bIsBinary;
    })
    if(is_favourite_filter() || is_shared_filter()){
        data.items_ls.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            if (a.owner === data.me && b.owner !== data.me) return -1; 
            if (a.owner !== data.me && b.owner === data.me) return 1;  
            return 0;
        });
    }


    

    set_fetched_data(data)
    
    for(const item of data.items_ls){
        token_ls.current[item.name] = {token: item.path_token, path: item.path}
    }

    data_pulled.current = false
    
    return 

}



export default pull_data