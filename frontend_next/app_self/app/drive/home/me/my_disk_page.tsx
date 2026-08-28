'use client'
import { useParams, useRouter } from "next/navigation"
import React ,{ useEffect, createContext, useState, useRef, useContext } from "react"
import Pull_data from "../comps/pull_data/pull_data"
import Op_confirmation_tab from "../comps/op_confirmation_tab"
import { operations_tab_context_ } from '../layout_contexts' 
import { action_tab_context_props } from "../../types"
import '../styles/home-panel.css'


interface FlagsState{
    data_pull: boolean
}

interface success_flags{
    set_flags_state: React.Dispatch<React.SetStateAction<FlagsState>> 
    flags: FlagsState
}

const default_success_flags: success_flags = {
    set_flags_state: ()=>{},
    flags: {
        data_pull:false,
    }
}


interface toggled_info{
    set_toggling_mouse: React.Dispatch<React.SetStateAction<boolean>>
    toggling_mouse: boolean
}

const default_toggling_info: toggled_info = {
    set_toggling_mouse: ()=>{},
    toggling_mouse: false
}





export const success_flags = createContext<success_flags>(default_success_flags)
export const toggling_info = createContext<toggled_info>(default_toggling_info)







export const action_tab_context_ = createContext<action_tab_context_props>({
    operations_count: 0,
    set_coms: ()=>{},
    set_operations_count: ()=>{}
})



const My_disk_page = () => {

    const params = useParams()
    let token = params.token as string
    const mounted = useRef<boolean>(false)
    const operations_tab_context = useContext(operations_tab_context_)

    
    if(!token){
        token = 'main'
    }



    useEffect(()=>{
        if(mounted.current){return}
        mounted.current = true
    },[]) 


    return (
        <>

            <Op_confirmation_tab></Op_confirmation_tab>

            <div id="container" style={{
            }}>
                <input title="file-input" type="file" id="file-input" className="file-inputer" multiple style={{display:'none'}}/>
                <input title="dir-input"
                    type="file"
                    id="dir-input"
                    multiple
                    className="file-inputer"
                    style={{ display: 'none' }}
                    // @ts-ignore
                    webkitdirectory=""
                    />



                
                <action_tab_context_.Provider value={{ operations_count: operations_tab_context.operations_count, set_coms: operations_tab_context.set_coms, set_operations_count: operations_tab_context.set_operations_count }}>
                        <Pull_data  path_token={token}></Pull_data>
                </action_tab_context_.Provider>
            </div>
                
        </>
        )
    }





export default My_disk_page