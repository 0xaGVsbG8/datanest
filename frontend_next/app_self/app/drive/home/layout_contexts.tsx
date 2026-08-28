'use client'
import {createContext } from "react";
import { Op_confirmation_tab_context_props } from "../types";
import { operations_tab_context_props } from "../types";
import { fetched_data } from "../types"
import { token_ls_template } from "../types"


export const Op_confirmation_tab_context_ = createContext<Op_confirmation_tab_context_props>({
    setConfirmationData: ()=>{},
    confirmationData: {
        title: '',
        show_confirmation_tab: false,
        content_msg: '',
        confirm_btn_className: 'op_confirmation_tab-del-btn',
        confirm_btn_content: 'Cancel',
        confirm_behaviour: ()=>{},
        unlock_container_afterwards: true,
        show_cancel_btn: true
    }
})



export const operations_tab_context_ = createContext<operations_tab_context_props>({
    coms: {},
    operations_count: 0,
    set_coms: ()=>{},
    set_operations_count: ()=> {}
})




type wait_animation_context_props = {
    play: React.Dispatch<React.SetStateAction<boolean>>
}
export const wait_animation_context_ = createContext<wait_animation_context_props>({play: ()=>{}})



type set_repull_data_context_props = {
    set_repull_data: React.Dispatch<React.SetStateAction<number>>
    repull_data: number

    set_hide_section: React.Dispatch<React.SetStateAction<boolean>>
    hide_section: boolean

    set_search_type: React.Dispatch<React.SetStateAction<'normal' | 'whole' | 'hold'>>
    search_type: 'normal' | 'whole' | 'hold'

    set_search_input: React.Dispatch<React.SetStateAction<string>>
    search_input: string

}

export const set_repull_data_context_ = createContext<set_repull_data_context_props>({
    set_repull_data: ()=>{},
    repull_data: 0,

    set_hide_section: ()=>{},
    hide_section:true,

    set_search_type: ()=>{},
    search_type: 'normal',

    set_search_input: ()=>{},
    search_input: ''


});



type fetched_data_context_props = {
    set_fetched_data:React.Dispatch<React.SetStateAction<fetched_data | null>>
    fetched_data: fetched_data | null 
}
export const fetched_data_context_ = createContext<fetched_data_context_props>({
    set_fetched_data:()=>{},
    fetched_data: null
})



export const default_block_ui_parts = {
    down_btn: true,
    rem_btn: true,
    mkdir_btn: true,
    upload_btn: true,
    upload_dir: true,
}

export type block_ui_parts_props = {
    down_btn: boolean
    rem_btn: boolean
    mkdir_btn: boolean
    upload_btn: boolean
    upload_dir: boolean
}

export type block_ui_parts_context_props = {
    set_block_ui_parts : React.Dispatch<React.SetStateAction<block_ui_parts_props>>
    block_ui_parts: block_ui_parts_props 
}

export const block_ui_parts_context_ = createContext<block_ui_parts_context_props>({
    set_block_ui_parts: ()=>{},
    block_ui_parts: default_block_ui_parts
})

export const block_record_selector_context = createContext<React.MutableRefObject<boolean>>({current: false})



export const token_ls_context = createContext<React.MutableRefObject<token_ls_template>>({current: {}})

export const stop_ctrl_a_listener_context_ = createContext<React.MutableRefObject<boolean>>({current: false})

export const inside_preview_context_ = createContext<React.MutableRefObject<boolean>>({current: false})
