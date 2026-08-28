'use client'
import { createContext } from "react"


export type show_tab_props = 'main' | 'change_password_view' | 'passcode' | null

export type show_tab_context_props = {
    set_show_tab: React.Dispatch<React.SetStateAction<show_tab_props>>
    show_tab: show_tab_props
}


export type user_data_props = {
    set_user_data: React.Dispatch<React.SetStateAction<{passcode: string,auth_token: string}>>
    user_data: {passcode: string,auth_token: string} | null
}



export const show_tab_context_ = createContext<show_tab_context_props>({set_show_tab: ()=>{},show_tab:'main'})
export const user_data_context_ = createContext<user_data_props>({set_user_data:()=>{}, user_data: {passcode:'',auth_token:''}})

