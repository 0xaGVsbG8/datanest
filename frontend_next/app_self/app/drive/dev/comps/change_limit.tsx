'use client'
import '../styles/change_limit.css'

import { useEffect, useRef, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { base_fetch_url } from '@/app/config'
import { repull_data_context_ } from '../context'


type Change_limit_props = {
    set_show_change_limit: React.Dispatch<React.SetStateAction<boolean>>
    limit_what: 'upload' | 'account'
}


const Change_limit = ({set_show_change_limit, limit_what}: Change_limit_props) => {

    const mounted = useRef<boolean>(false)
    const fetching = useRef<boolean>(false)
    const user_value = useRef<number>(0)
    const {set_repull_data} = useContext(repull_data_context_)
    const [portal_root, set_portal_root] = useState<HTMLDivElement | null>(null)
    


    const send_update_limit_fetch = async() => {

        if(fetching.current || user_value.current <= 0) return
        
        fetching.current = true
        const response = await fetch(base_fetch_url+`/dev/update_acc_limit/?limit=${user_value.current}&set_what=${limit_what}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        const data = await response.json()
        if(data.result) set_show_change_limit(false);set_repull_data(c=>c+1)
        fetching.current= false
            

    }


    useEffect(()=>{
        const root = document.getElementById('portal-root') as HTMLDivElement
        if(!root) return
        set_portal_root(root)
        setTimeout(() => {
            document.getElementById('change-limit-tab-input')!.focus()
        }, 120);
    },[])



    useEffect(()=>{

        const block_cont = () => {
            const container = document.getElementById('container') as HTMLDivElement
            container.style.opacity = '0.6'  
            container.style.pointerEvents = 'none'  
            container.style.userSelect = 'none'  

        }

        const unblock_cont = () => {
            const container = document.getElementById('container') as HTMLDivElement
            container.style.opacity = '1'  
            container.style.pointerEvents = 'auto' 
            container.style.userSelect = 'auto'  
        }

        block_cont()

        return () => {
            if(mounted.current) {unblock_cont()}
            else mounted.current = true
        }

    },[])




    return (
        <>
            {portal_root && createPortal(<div id="change-limit-tab">
                <div id="change-limit-tab-title"><h2>Set a new account limit (GB)</h2></div>
                <div id="change-limit-tab-input">
                    <input placeholder="_" type='number' id='change-limit-tab-input-input' onChange={(e)=>user_value.current = parseFloat(e.target.value)}></input>
                </div>
                <div id="change-limit-tab-btn-placeholder">
                    <button id='change-limit-tab-btn-placeholder-cancel' onClick={()=>set_show_change_limit(c=>!c)}>Cancel</button>
                    <button id='change-limit-tab-btn-placeholder-apply' onClick={send_update_limit_fetch}>Apply</button>
                </div>
            </div>, portal_root)}
        </>
    )

}

export default Change_limit