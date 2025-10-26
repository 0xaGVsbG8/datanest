'use client'
import { useRouter } from "next/navigation"
import { useEffect, useState, useContext, useRef, createContext } from "react"
import Open_preview from "../../comps/open_preview"
import { download_preview_file } from "../../comps/open_preview"
import Download_item from "../../../home/handlers/download_items"
import Show_action_tab, { inside_action_tab_context_ } from "../../../home/comps/show_action_tab"
import Quick_path from "../../comps/quick_path"
import Mk_dir from "../../comps/mk_dir"
import { tree_ls_props} from "../../../types"
import '../../../home/styles/pull_data.css'
import are_items_selected from "./pull_data_modules/are_items_selected"
import { send_rem_dups_fetch } from "../settings_tab/settings_tab_modules/rem_dups"
import { default as item_selectorPC_hook, untoggle_all_records } from "./pull_data_modules/item_selectorPC"
import { default as item_selectorMobile_hook } from "./pull_data_modules/item_selectorMobile"
import { default as pull_data_hook } from "./pull_data_modules/pull_data"
import useIsMobile from "./pull_data_modules/set_mobile_bool"
import ctrl_a_listener from "./pull_data_modules/listen_for_ctrl_a"
import untoggle_record from "./pull_data_modules/untoggle_record"
import Move_items from "../move_items"
import nextConfig from "@/next.config"

import { 
  Op_confirmation_tab_context_,
  set_repull_data_context_,
  fetched_data_context_,
  block_record_selector_context,
  stop_ctrl_a_listener_context_,
  token_ls_context,
  wait_animation_context_
} from "../../layout_contexts"

import Handle_upload_comp from "../../handlers/handle_upload/handle_upload"
import Remove_items from "../../comps/remove_items"




interface pull_data_props{
    path_token: string
}




type tree_ls_context_props = {
    tree_ls: tree_ls_props[] | null
}


export const tree_ls_context_ = createContext<tree_ls_context_props>({
    tree_ls: [
        {path: '',
        token: ''}
    ]
})




export const is_favourite_filter = () => {
    const result = window.location.href.includes('filter_by_favs') ? true : false;
    return result
}


export const is_shared_filter = () => {
    const result = window.location.href.includes('filter_by_shared') ? true : false;
    return result
}




const handleResizeForUserAction = () => {


    const user_info_panel_actions_content = document.getElementById('user-info-panel-actions-controls')
    const user_info_panel_actions = document.getElementById('user-info-panel-actions')

    const user_info_panel_actions_rect = user_info_panel_actions?.getBoundingClientRect()
    if(!user_info_panel_actions_content) return

    const diff = window.innerWidth - user_info_panel_actions_rect!.right


    user_info_panel_actions_content.style.top = `${user_info_panel_actions?.getBoundingClientRect().bottom}px`
    user_info_panel_actions_content.style.right = `${diff}px`
}




const Pull_data = ({ path_token}: pull_data_props) => {

    const router = useRouter();


    const data_pulled = useRef<boolean>(false)
    const wait_animation_context = useContext(wait_animation_context_)


    const ctrl_a_pressed = useRef<boolean>(false)
    const ctrl_pressed = useRef<boolean>(false)

    const sortby_size = useRef<boolean>(false)
    const sortby_change = useRef<boolean>(false)
    const sortby_name = useRef<boolean>(false)

    const {repull_data, set_hide_section, hide_section, search_type, search_input} = useContext(set_repull_data_context_)


  
    

    const item_selector_prior = useRef<boolean>(false)

    const { fetched_data , set_fetched_data } = useContext(fetched_data_context_)

    const [ show_preview_of, set_show_preview_of ] = useState<number>(-1)
    const inside_data_records = useRef<boolean>(false)

    const toggling_mouse_ref = useRef<boolean>(false)

    const records_ref = useRef<HTMLDivElement | null> (null)


    const isMobile = useIsMobile()
                                            
    const block_record_selector = useContext(block_record_selector_context)

    const OverallCheckboxRef = useRef<HTMLInputElement | null> (null)

    const stop_ctrl_a_listener = useContext(stop_ctrl_a_listener_context_)

    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)

    const [show_move_tab, set_show_move_tab] = useState<boolean>(false)


    const [show_controls, set_show_controls] = useState<boolean>(false)
    const inside_preview = useContext(inside_action_tab_context_)

    
    const clicked_overall_checkbox = useRef<{
        clicked: boolean
        timeout_id: ReturnType<typeof setTimeout> | null 
    }>({clicked: false, timeout_id: null})


    const inside_action_tab = useRef<boolean>(false)

    const inside_user_controls = useRef<boolean>(false)

    const token_ls = useContext(token_ls_context)



    const pull_data = async(filter_by_received: 'fav' | 'off' | 'shared' , search_type_: 'normal' | 'whole' | 'hold' = search_type, search_input_: string = search_input, repull_no: number= repull_data) => {await pull_data_hook({
        token: path_token, 
        filter_by : filter_by_received,
        set_fetched_data, 
        data_pulled,token_ls, 
        search_type_, 
        set_hide_section, 
        search_input_ 
    })}
    
    const item_selectorPC = () => {return item_selectorPC_hook({inside_preview, ctrl_a_pressed, ctrl_pressed,  toggling_mouse_ref,clicked_overall_checkbox, block_record_selector})}
    const item_selectorMobile = () =>  {return item_selectorMobile_hook({ctrl_a_pressed, ctrl_pressed,  toggling_mouse_ref,clicked_overall_checkbox, block_record_selector})}

    
    const redirect_to_item = (route_token: string, owner: string, me:string)=>{
        let reload: boolean = false
        let use_router_to_head: boolean = false
        let url: string = ''

        if(owner==me){
            use_router_to_head = true
            url =`/drive/home/browse/${route_token}`
        }
        else{
            if(window.location.href.includes('favs')){
                reload = true
            }
            url = `/drive/home/browse/${route_token}`
            if(reload) window.open(url,'_self') 
        }
        router.push(url)

    }


    //---------------------------
    //---------------------------
    //SINGLE FILE BEHAVIOUR
    //---------------------------
    //---------------------------
    useEffect(()=>{
        if(!fetched_data) return
        if(fetched_data.view_type == 'file'){
            const shared_file = document.querySelector('#record0 .data-item-name-item') as HTMLDivElement
            const bg = document.querySelector('.item-displayer') as HTMLDivElement

            if(!bg || !shared_file) return

            bg.style.background = '#121212'
            shared_file.click()

        }
    },[fetched_data])




    //---------------------------
    //---------------------------
    //FETCHING DATA BEHAVIOUR
    //---------------------------
    //---------------------------
    useEffect(()=>{
        if(repull_data===0) return
        const searchParams = new URLSearchParams(window.location.search);
        const Perform_pulling = async() => {
            const fetching = async() => {
                wait_animation_context.play(true)
                if(is_favourite_filter()) {await pull_data('fav')}
                else if (is_shared_filter())  {await pull_data( 'shared')}
                else{await pull_data('off')}
                wait_animation_context.play(false)
            }

            if(data_pulled.current){return}


            setTimeout(() => {
                fetching()
            }, 100);

        }

        Perform_pulling()
    },[repull_data])




    //SETTING width of user panel in items list
    useEffect(()=>{

        if(!fetched_data) return

        const SetFakeRecordWith = (e:Event | null = null, now: boolean = false) => {
            setTimeout(() => {
                const fake_record = document.getElementById('fake-record')
                const first_record = document.getElementById('record0')
                const first_record_rect = first_record?.getBoundingClientRect()
                if(!fake_record || !first_record_rect) return
                fake_record.style.width = `${first_record_rect.width}px`
            }, now ? 0 : 300);
        }

        SetFakeRecordWith(null, true)

        window.addEventListener('resize',SetFakeRecordWith)
        return () => window.removeEventListener('resize',SetFakeRecordWith)

    },[fetched_data])




    //setting up the pc item selector
    useEffect(()=>{
        if(!records_ref.current){return}
        if(isMobile){return}
        let CleanItem_selectorPC: (()=>void) | null = null
        CleanItem_selectorPC = item_selectorPC()
        
        return () => {CleanItem_selectorPC()}
        
    },[fetched_data?.items_ls, isMobile])


    
    //setting up the mobile item selector
    useEffect(()=>{
        if(!records_ref.current){return}
        if(!isMobile){return}
        item_selectorMobile()
    },[fetched_data?.items_ls, isMobile])


    useEffect(()=>{

        const handler = (event? :Event | null, now:boolean = false) => {

            if(!fetched_data) return

            setTimeout(() => {
                const data_section_records = document.getElementById('data-section-records') as HTMLDivElement
                const data_section_records_rect = data_section_records.getBoundingClientRect()

                const section_selector = document.getElementById('section-selector') as HTMLDivElement
                if(!section_selector) return
                const section_selector_rect = section_selector.getBoundingClientRect()

                let diff = section_selector_rect.top - data_section_records_rect.top
                if(window.innerWidth < 968) {}
                else{diff = window.innerHeight - data_section_records_rect.top - 20}

                data_section_records.style.setProperty('height', `${diff}px`, 'important');
            

            }, now ? 0 : 200 );


        }
        handler(null, true)
        
        window.addEventListener('resize', handler)
        
        return () => {window.removeEventListener('resize', handler)}
        
    },[fetched_data])




    const sort_by_size = () => {
        if(!fetched_data){return}
        set_fetched_data(prev=>{
            if(!prev) return null
            const newPrev = {...prev}
            newPrev.items_ls.sort((a,b)=>{
                if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
                if(sortby_size.current) return (b.real_size ?? 0) - ( a.real_size ?? 0)
                else{ return ( a.real_size ?? 0) - (b.real_size ?? 0) }
            })
            return newPrev
        })
    }



    const sort_by_last_change = () => {
        if(!fetched_data){return}
        set_fetched_data(prev=>{
            if(!prev) return null
            const newPrev = {...prev}
            newPrev.items_ls.sort((a,b)=>{
                if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
                if(sortby_change.current) return (b.real_last_change ?? 0) - ( a.real_last_change ?? 0)
                else{ return ( a.real_last_change ?? 0) - (b.real_last_change ?? 0) }
            })
            return newPrev
        })
    }


    const sort_by_name = () => {
        if(!fetched_data){return}
        set_fetched_data(prev=>{
            if(!prev) return null

            const newPrev = {...prev}

            newPrev.items_ls.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return sortby_name.current
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            });


            return newPrev
        })
    }



    //Function to pop up a clean dups dialog
    const clean_dups_up_here = () => {

        const hide_me = () => {
            op_confirmation_tab_context.setConfirmationData(prev=>({
                ...prev,
                show_confirmation_tab: false
            }))
        }

        console.log('cleaning dups here!')

        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: 'Are you sure that you want to perform a duplicate files removal job in this location? This action is irreversible!',
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            confirm_behaviour: ()=>{
                hide_me();send_rem_dups_fetch(path_token);
                setTimeout(() => {
                    window.location.reload()
                }, 200);
            },
            cancel_behaviour: ()=>{hide_me()}
        }))

    }   

    

    //Untoggling record using ctrl and click
    useEffect(()=>{
        if(!fetched_data || !stop_ctrl_a_listener){return}


        let CleanUpuntoggle_record: (()=>void) | null = null
        let CleanCtrl_a_lister: (()=>void) | null = null



        if(!isMobile) { 
            CleanUpuntoggle_record =  untoggle_record(ctrl_pressed)
            CleanCtrl_a_lister = ctrl_a_listener(ctrl_a_pressed, stop_ctrl_a_listener)
        }
        
        const del_handler = (e: KeyboardEvent) => {
            if(e.key == 'Delete'){
                document.getElementById('rem_btn-1')?.click()
            }
        }

        window.addEventListener('keydown',del_handler)
        
        return () => {
            window.removeEventListener('keydown',del_handler)
            CleanUpuntoggle_record && CleanUpuntoggle_record()
            CleanCtrl_a_lister && CleanCtrl_a_lister()
        }

    },[fetched_data, stop_ctrl_a_listener])




    useEffect(()=>{

        if(!fetched_data) return

        const local_handler = () => {
            if(inside_user_controls.current) return
            set_show_controls(false)
        }

        handleResizeForUserAction()
        window.addEventListener('resize',handleResizeForUserAction)
        window.addEventListener('mousedown',local_handler)

        return () => {
            window.removeEventListener('resize',handleResizeForUserAction)
            window.removeEventListener('mousedown',local_handler)
        }



    },[fetched_data])




    return(<>

            {fetched_data && (
            <tree_ls_context_.Provider value={{tree_ls: fetched_data?.tree_ls ? fetched_data.tree_ls : null }}>
                <>
                <div id="data-section"  style={{
                    opacity: hide_section ? '0' : '1',
                    visibility: hide_section ? 'hidden' : 'visible'
                }}>
                    <Handle_upload_comp path_token={path_token}></Handle_upload_comp>

                    <div id="user-info-placeholder">

                        <div id="user-info">
                            {!window.location.href.includes('filter_by_favs') && !window.location.href.includes('filter_by_shared') && !window.location.href.includes('filter_by_whole_disk') ? (<Quick_path special_id={1}></Quick_path>) : null}
                            <div id="user-info-panel" onClick={()=>{
                            }}>
                                
                           

                                {!window.location.href.includes('filter_by_favs') && 
                                ((window.location.href.includes('filter_by_shared') ?  
                                (fetched_data?.viewing_widgets ? true: false) : true) 
                                && fetched_data.Parent_editable) ? (
                                    <>
                                        <div id="user-info-panel-actions">
                                            <div onPointerDown={()=>{
                                                set_show_controls(prev=>!prev);  

                                                inside_user_controls.current = true; 
                                                setTimeout(() => {
                                                    inside_user_controls.current = false
                                                }, 200);
                                            }

                                            } id='user-info-panel-actions-btn'>
                                                <img alt="" src={`${nextConfig.assetPrefix}/assets/new-btn.png`} id="new-btn"></img>
                                                <a>New</a>
                                            </div>

                                            <div id="user-info-panel-actions-controls" style={{
                                                display: show_controls ? 'flex' : 'none',
                                                height: show_controls ? '100%' : '0%'
                                            }} onPointerDown={()=>{
                                                
                                                inside_user_controls.current = true; 

                                            }}>
                                                <div onClick={()=>set_show_controls(false)} id="mkdir-placeholder"><Mk_dir token = {path_token}></Mk_dir></div>
                                                <div onClick={()=>{document.getElementById('file-input')?.click();inside_user_controls.current = false; set_show_controls(false)}} id="upload_file_btn">
                                                    <img alt="" src={`${nextConfig.assetPrefix}/assets/upload-file.png`}></img>
                                                    <a>Upload a file</a>
                                                </div>
                                                <div onClick={()=>{document.getElementById('dir-input')?.click();inside_user_controls.current = false; set_show_controls(false)}} id="upload_dir_btn">
                                                    <img alt="" src={`${nextConfig.assetPrefix}/assets/upload-dir.png`}></img>
                                                    <a>Upload a folder</a>
                                                </div>
                                                <div onClick={()=>{clean_dups_up_here();inside_user_controls.current = false; set_show_controls(false)}}  id="rem-dups">
                                                    <img alt="" src={`${nextConfig.assetPrefix}/assets/clean-up.png`}></img>
                                                    <a>Remove duplicate files</a>
                                                </div>
                                            </div>

                                        </div>
                                    </> 
                                ):  null} 




                                {!window.location.href.includes('filter_by_shared') && !window.location.href.includes('filter_by_favs') && fetched_data.owner==fetched_data.me && (
                                    <>
                                        <div id="move-items-pd-btn" onClick={()=>{set_show_move_tab(c=>!c)}}>
                                            <img alt="" src={`${nextConfig.assetPrefix}/assets/move.png`}></img>Move
                                        </div>
                                        <Move_items index={-2} set_show_move_tab={set_show_move_tab} show_move_tab = {show_move_tab} path={path_token} name = {'global'} predefined_data={null} root_token={path_token} ></Move_items>
                                    </>
                                )}

                                    
                                <button style={{fontSize:'120%',margin:'0.5%',zIndex:'99999999'}} onClick={()=>{untoggle_all_records();are_items_selected()}}>⭕</button>
                                <div id="special_download_btn" onClick={()=>document.getElementById(`download_btn${-1}`)?.click()}><img src={`${nextConfig.assetPrefix}/assets/download_icon.jpg`} alt=""></img></div>
                                <Download_item id={-1} owner={''} route_token = {path_token} multiple = {true} ></Download_item>
                                {fetched_data.Parent_editable && <Remove_items index = {-1} show = {true} route_token = {path_token} multiple = {true} predefined_data={null}></Remove_items>}
                                

                                

                            </div>
                        </div>

                        <div className="data-section-record" id="fake-record"  ref={records_ref}>
                            <div className="data-item-name" style={{justifyContent:'flex-start'}} id="data-item-name-fake">
                                <div className="data-item-name-item">
                                <input title="All checkbox"  ref={OverallCheckboxRef} id="data-select-option-special-checkbox" className="data-select-option-checkbox"  type="checkbox" onClick={(e)=>{

                                    const checked  = OverallCheckboxRef.current!.checked
                                    clicked_overall_checkbox.current.clicked = true

                                    if(clicked_overall_checkbox.current.timeout_id)clearTimeout(clicked_overall_checkbox.current.timeout_id)

                                    const el_array = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]
                                        for(const [index, el] of el_array.entries()){

                                            const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)

                                            if(checked){
                                                el.classList.add('data_section_record_selected');
                                                checkbox!.checked = true
                                            }
                                            else{
                                                el.classList.remove('data_section_record_selected');
                                                checkbox!.checked = false
                                            }   
                                            are_items_selected()
                                    }

                                    clicked_overall_checkbox.current.timeout_id = setTimeout(() => {
                                        clicked_overall_checkbox.current.clicked = false
                                    }, 200)

                                }}></input>


                                <label className="data-select-option-special" onClick={()=>{
                                    sortby_name.current =! sortby_name.current
                                    sort_by_name()
                                }}>&nbsp; <span style={{textDecoration:'underline'}}>Name</span> ({fetched_data?.items_ls.length ? fetched_data?.items_ls.length : 0})</label>&nbsp; <span style={{cursor:'auto'}}>| Selected: <span style={{textDecoration:'underline'}} id="data-select-option-special-selected-count">0</span></span>

                            </div></div>


                            <div className="data-section-owner data-select-option-special" >Owner</div>
                            <div className="data-last-changes data-select-option-special" style={{justifyContent:'center'}} onClick={()=>{sortby_change.current=!sortby_change.current; sort_by_last_change()}}>Last changes</div>
                            <div className="data-size data-select-option-special"  style={{justifyContent:'center'}} onClick={()=>{sortby_size.current=!sortby_size.current;sort_by_size()}}>Size</div>
                            <div className="data-action" style={{justifyContent:'center'}}>Action</div>
                        </div>

                </div>


                <div id="data-section-records" 
                    onTouchStart={()=>{inside_data_records.current = true; }}
                    onMouseEnter={()=>{inside_data_records.current = true; }} 

                    onTouchEnd={()=>{inside_data_records.current = false}}
                    onMouseLeave={()=>{inside_data_records.current = false}}>


                    {fetched_data?.items_ls.length==0 && (
                        <div id="no-items-div">

                            <h1>
                                {!is_favourite_filter() && !is_shared_filter() && !window.location.href.includes('filter_by_whole_disk=02') && 'Drop files here'}
                                {is_shared_filter() && 'No shared items yet'}
                                {is_favourite_filter() && 'No favourited items yet'}
                                {window.location.href.includes('filter_by_whole_disk=02') && 'Type a query'}
                            </h1>

                            <h2>{!is_favourite_filter() && !is_shared_filter() && !window.location.href.includes('filter_by_whole_disk=02') && 'Or click button "New"'}</h2>

                        </div>
                    )}


                    {repull_data != 0 && fetched_data?.items_ls.map((item, index)=>{
                        
                        return (<div key={index} id={'record'+index} className="data-section-record"
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>)=>{
                                if(inside_action_tab.current){return}
                                const el = e.currentTarget
                                if(!toggling_mouse_ref.current){el.classList.add('data-section-record_hover')}
                                else{el.classList.remove('data-section-record_hover')}
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>)=>{
                                const el = e.currentTarget
                                el.classList.remove('data-section-record_hover')
                            }}

                        >
                            <label className="data-select-option"><input className="data-select-option-checkbox" type="checkbox" onClick={()=>{

                                if(isMobile){
                                    item_selector_prior.current = true
                                    setTimeout(() => {
                                        item_selector_prior.current = false
                                    }, 120);
                                } 
                            
                                const checkbox = document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement
                                const this_record = document.querySelector(`#record${index}`) as HTMLDivElement
                                if(checkbox.checked){this_record.classList.add(('data_section_record_selected'))}
                                else{this_record.classList.remove(('data_section_record_selected'))}
                            }}></input><a style={{display:'none'}}>_</a></label>
                            {item.type == 'dir' && <div className="data-item-name"><div><div className="data-item-name-item" onClick={()=>item.path_token && redirect_to_item(item.path_token, fetched_data.me,item.owner)}>📁{item.name}</div></div></div>}
                            {item.type == 'file' && <div className="data-item-name">
                                
                                <div>
                                    <Open_preview 
                                        record_id={index} 
                                        name = {item.name} 
                                        real_size = {item.real_size}
                                        mimetype={item.mimetype?item.mimetype:'N/A'} 
                                        access_url={item.access_url}
                                        dispatch={set_show_preview_of} 
                                        dispatched={show_preview_of}
                                        ls_length = {fetched_data.items_ls.length}
                                        show_close_btn = {fetched_data.view_type == 'file' ? false : true}
                                    ></Open_preview>
                                </div>


                            </div>}
                            <div className="data-section-owner">{item.owner.trim() == fetched_data.me.trim() ? 'Me' : item.owner}</div>
                            
                            <div className="data-last-changes">{item.last_change}</div>
                            <div className="data-size">{item.size}</div>
                            <div className="data-action">
                            
                                {item.type=='file' && <button type="button"  id={`download_btn${index}`} style={{visibility:'hidden',position:'absolute'}} onClick={()=>{
                                {download_preview_file({name : item.name, access_url : item.access_url})}
                                }}>⭕</button>}
                                {item.type == 'dir' && <Download_item id={index} owner = {item.owner} route_token = {item.path_token} multiple = {false} predefined_data = {{name: item.name, token: item.path_token}}></Download_item>}
                                

                                <Show_action_tab 
                                    id={index} 
                                    isFavourite = {item.isFavourite}  
                                    path = {item.path} 
                                    name={item.name} 
                                    token = {item.path_token} 
                                    root_token={path_token} 
                                    stop_ctrl_a_listener={stop_ctrl_a_listener} 
                                    inside_action_tab={inside_action_tab} 
                                    editable={item.editable} 
                                    owner={item.owner} 
                                    me={fetched_data.me}
                                    viewing_widgets={fetched_data.viewing_widgets}
                                ></Show_action_tab>


                            
                            </div>
                            <div className="data-real-name" id={'data-real-name'+index} style={{display:'none'}}>{item.name}</div>
                        </div>)
                    })}</div>

                </div> </></tree_ls_context_.Provider>
                    
            )
                    
            
            }
       
    </>)





}

export default Pull_data    