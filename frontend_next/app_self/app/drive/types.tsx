


export interface item_data {
    name: string
    editable: boolean,
    owner: string
    isFavourite: boolean
    type: string
    path: string
    path_token: string
    real_size:number
    size: string
    last_change: string
    real_last_change: number
    mimetype?: string 
    access_url: string
}


export interface coms_template { 
    [operation_count: number]: [string, ()=>void]
}




export type Set_coms = React.Dispatch<React.SetStateAction<coms_template>>
export type Set_operations_count = React.Dispatch<React.SetStateAction<number>>




export type tree_ls_props = {
    path: string
    token: string
}


export interface fetched_data{
    me: string
    Parent_editable: boolean,
    viewing_widgets: boolean,
    access: 'denied',
    owner: string
    current_dir: string
    static_url_access_token: string
    static_url: string
    tree_ls: tree_ls_props[]
    items_ls: item_data[]
    view_type: 'dir' | 'file'
} 






export interface cords_info{
    begin_posx: number
    begin_posy: number
    first_posx: number
    first_posy: number
    current_posx: number
    current_posy: number
    scroll: number
}






export type action_tab_context_props  = {
    operations_count: number,
    set_coms: Set_coms,
    set_operations_count: Set_operations_count
}




export type Op_confirmation_tab_data_props = {
    title: string
    show_confirmation_tab: boolean
    content_msg: string
    confirm_btn_className: string
    confirm_btn_content: string
    confirm_behaviour: ()=>void
    cancel_behaviour?: ()=>void
    unlock_container_afterwards?: boolean
    show_cancel_btn: boolean
}


export type Op_confirmation_tab_context_props = {
    setConfirmationData: React.Dispatch<React.SetStateAction<Op_confirmation_tab_data_props>>
    confirmationData: Op_confirmation_tab_data_props
}


export type operations_tab_context_props = {
    coms: coms_template,
    operations_count: number
    set_coms: Set_coms,
    set_operations_count: Set_operations_count
}


export interface operations_tab_props {
    coms: coms_template
    operations_count: number

}



export type token_ls_template = {
    [name: string]: {token: string, path: string} 
}


