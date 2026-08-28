'use client'

import { fetched_data_props } from "./hooks/get_data"
import {createContext } from "react";



export const repull_data_context_ = createContext<{repull_data: number, set_repull_data: React.Dispatch<React.SetStateAction<number>>}>({repull_data: 0, set_repull_data:()=>{}})


export type fetched_data_context_props = {
    set_fetched_data: React.Dispatch<React.SetStateAction<fetched_data_props | null>>
    fetched_data: fetched_data_props | null
}

export const fetched_data_context_ = createContext<fetched_data_context_props>({set_fetched_data: ()=>{},fetched_data: null})


