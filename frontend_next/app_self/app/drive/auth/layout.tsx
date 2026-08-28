'use client'
import {base_fetch_url} from "../../config"
import { useEffect, useState, useRef } from "react";
import {redirect} from 'next/navigation'
import {app_dir_name} from '../../config'
import { home_path } from "@/app/not-found";

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const [authed, set_authed] = useState<boolean>(false)
    const [fetched_state,set_fetched] = useState<boolean>(false)
    const fetched_ref = useRef<boolean>(false)
    
    useEffect(()=>{

        if(!fetched_ref.current){
            fetched_ref.current = true
            fetch(base_fetch_url+"/auth-creds/",{
                method:'POST',
                credentials:'include',
                headers:{
                    "Content-Type": "application/json",
                    "protocol":"init"
                },

                body:JSON.stringify({

                })
                })
                .then(response => {
                    return response.json(); 
                })
                .then(data => {
                    set_fetched(true)
                    if(data){
                        set_authed(true)
                    }
            })
        }
    },[])

    if(fetched_state){
        if(!authed){
            return (
                <>
                    {children}
                </>
            );
        }else{
            redirect(home_path)
        }

    }

}