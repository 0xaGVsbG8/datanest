

import { useCallback } from "react"
import { base_ws_url } from "@/app/config"
import { useRouter } from "next/navigation"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { is_shared_filter } from "../pull_data"
import { app_dir_name } from "@/app/config"


type redirect_to_item_props = {
    route_token: string
    router: AppRouterInstance
    owner: string
    me: string
}


const redirect_to_item = ({route_token,router, owner, me }: redirect_to_item_props)=>{
    let reload: boolean = false

    if(owner==me){
        router.push(`/${app_dir_name}/home/browse/${route_token}`)
    }
    else{
        if(window.location.href.includes('favs')){
            reload = true
        }
        const url = `/${app_dir_name}/home/browse/${route_token}`
        if(reload) window.open(url,'_self') 
        else router.push(url)
    }

}



export default redirect_to_item