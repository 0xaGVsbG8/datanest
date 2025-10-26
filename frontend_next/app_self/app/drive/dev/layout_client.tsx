'use client'
import { useState, useEffect, useRef, createContext } from "react"
import { fetched_data_props } from "./hooks/get_data"
import { fetched_data_context_, repull_data_context_ } from "./context"

export default function RootLayout({ children }: { children: React.ReactNode }) {    


    const [repull_data, set_repull_data] = useState<number>(0)
    const [fetched_data, set_fetched_data] = useState<fetched_data_props | null>(null)



    
    return (
        <>
            <fetched_data_context_.Provider value={{fetched_data, set_fetched_data}}>
                <repull_data_context_.Provider value={{repull_data, set_repull_data}}>
                    <div id="portal-root"></div>
                    {children}
                </repull_data_context_.Provider>
            </fetched_data_context_.Provider>

        </>
    )
 

}