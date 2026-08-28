'use client'
import {base_fetch_url, test_backend__communication_each_time} from "@/app/config"
import { useEffect, useState, useRef, useCallback } from "react";

let stashed_interval: ReturnType<typeof setInterval>


export default function RootLayout({ children }: { children: React.ReactNode }) {

    if(!test_backend__communication_each_time){return(<>{children}</>)}

    const [pinged, set_pinged] = useState<boolean|string>(true)

    const ping_backend = useCallback(async()=>{
        try{
            const test_url = base_fetch_url+'/test/'
            const response =  await fetch(test_url)
            .then(response=>response.json())
            .then(data=>{
            })
        }catch(err){
            set_pinged('err')
        }
    },[])

    useEffect(()=>{
        ping_backend()
    },[])

    const reloader = (status: 'start'|'stop') => {
        if(status=='start')stashed_interval = setInterval(()=>{window.location.reload()},10000)
        else{clearInterval(stashed_interval)}
    }

    useEffect(()=>{
        if(pinged=='err'){document.body.style.backgroundColor='#121212';reloader('start')}
        else{reloader('stop')}
    },[pinged])



    return (
        <>
            {pinged==true?children:'Err when communicating with backend'}
        </>
    )


}

