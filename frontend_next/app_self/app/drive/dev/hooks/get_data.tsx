
import { base_fetch_url } from "@/app/config"
import { useEffect, useRef, useContext } from "react"
import { fetched_data_context_, repull_data_context_ } from "../context"



export type fetched_data_userdata = {
    'address': string,
    'space': string,
    'crt-date': string,
}

export type fetched_data_storage_info = {
    free_storage: string
    real_free_storage:number

    used_storage: string
    real_used_storage: number
    
    max_storage_per_acc: string
    max_upload_size: string

    perc: number

}


export type fetched_data_props = {
    users_data: fetched_data_userdata[]
    STORAGE_INFO: fetched_data_storage_info
    access: 'denied'
}



const Get_data = () => {

    const pulling = useRef<boolean>(false)
    const {repull_data} = useContext(repull_data_context_)
    const {set_fetched_data} = useContext(fetched_data_context_)


    const get_data = async() => {

        if(pulling.current) return
        pulling.current = true

        try{

            const response = await fetch(base_fetch_url+'/dev/get_dev_data/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
            })
            const data = await response.json() as fetched_data_props
            if(data.access == 'denied') {setTimeout(() => {
                window.open('home/me','_self')
            }, 300); ;return}
            
            set_fetched_data(data)

        }finally{
            setTimeout(() => {
                pulling.current = false
            }, 300);
        }

            
    }


    useEffect(()=>{
        get_data()
    },[repull_data])




    return(<></>)

}

export default Get_data