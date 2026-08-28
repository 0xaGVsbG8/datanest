'use client'
import { createContext } from "react"


export type show_section_props = 'mine'|'fav'|'shared'|'scan-disk' | 'none' | 'hold'
export type Section_options_context_props = {
    show_section: show_section_props
    set_show_section: React.Dispatch<React.SetStateAction<show_section_props>>

}
export const Section_options_context_ = createContext<Section_options_context_props>({show_section: 'mine', set_show_section: ()=>{}})


