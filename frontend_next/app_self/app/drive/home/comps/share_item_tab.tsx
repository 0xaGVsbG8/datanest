import { useEffect, useCallback, useRef, useState, useContext } from "react"
import { createPortal } from "react-dom"
import { base_fetch_url } from "@/app/config"
import '../styles/share_item_tab.css'
import { stop_ctrl_a_listener_context_,  wait_animation_context_, block_record_selector_context} from "../layout_contexts"
import nextConfig from "@/next.config"




export type addresses_dict = {
    address: string
}



type share_item_tab_props = {
    token: string
    set_show_share_item_tab: React.Dispatch<React.SetStateAction<boolean>>
    show_share_item_tab: boolean
}


type share_info = {
    'name': string
    'owner': string
    'hierarchy_type': boolean
    'members': addresses_dict[]
    'overall_access': 'restricted' | 'anyone'
    'access_type': 'browse-only' | 'editing'
    'url_token': string
    'type': 'dir' | 'file'
    'ChildrenOf': string | null
}





const Share_item_tab = ({token,   set_show_share_item_tab, show_share_item_tab}: share_item_tab_props) => {

    const [fetched_data, set_fetched_data] = useState<share_info | null>(null)
    const [msg, set_msg] = useState<string>('')

    const address_input = useRef<HTMLInputElement>(null)
    const apply_btn = useRef<HTMLButtonElement>(null)

    const [item_type, set_item_type] = useState<'dir' | 'file'>('file')

    const [ user_input, set_user_input ] = useState<string>('')
    const user_input_ref = useRef<string>('')
    const [ correct_address, set_correct_address ] = useState<boolean>(true)

    const [which_overall_access, set_which_overall_access] = useState<'anyone'|'both'|'restricted'>('restricted')
    const [which_access_type, set_which_access_type] = useState<'browse-only'|'both'|'editing'>('browse-only')


    const [which_overall_access_selected, set_which_overall_access_selected] = useState<'anyone'|'restricted'>('restricted')
    const [which_access_type_selected, set_which_access_type_selected] = useState<'browse-only'|'editing'>('browse-only')

    
    const which_overall_access_selected_ref = useRef<'anyone'|'restricted'>('restricted')
    const which_access_type_selected_ref = useRef<'browse-only'|'editing'>('browse-only')



    const stop_ctrl_a_listener_context = useContext(stop_ctrl_a_listener_context_)


    const [whitelist, set_whitelist] = useState<addresses_dict[]>([]);
    const fetch_item_info = useRef<share_info>({
        name: '',
        'owner': '',
        'hierarchy_type':false,
        'members':[{'address':''}],
        'overall_access':'restricted',
        'access_type': 'browse-only',
        'url_token':'',
        'type': 'dir',
        'ChildrenOf': null
    })

    const notify_checkbox_value = useRef<boolean>(false)
    const overwrite_rights_checkbox_value = useRef<boolean>(false)

    const wait_animation_context = useContext(wait_animation_context_)
    const block_record_selector = useContext(block_record_selector_context)



    const link_to_copy = useRef<string>('')


    const isEmail = useCallback((str: string): boolean =>{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(str.trim())
    },[])



    const get_item_info = useCallback(async()=>{
        const response = await fetch(base_fetch_url+'/sec/get-share-info/',{
            method:'POST',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },

            body:JSON.stringify({
                local_token: token
            })
        })
        const data: share_info = await response.json()
        wait_animation_context.play(false)
        set_whitelist(data.members)
        set_which_overall_access(data.overall_access)
        set_which_access_type(data.access_type)
        set_item_type(data.type)
        fetch_item_info.current = data
        set_fetched_data(data)
        const link = data.url_token 
        link_to_copy.current = link
        if(address_input.current) address_input.current.value = ''
        set_correct_address(true)
    },[])





  




    const edit_item_info = useCallback((action: 'edit' | 'erase')=>{
        if(fetch_item_info.current.members.length < 1 && fetch_item_info.current.overall_access == 'restricted'){set_msg('<span style="color:red">Current overall access settings requires to provide atleast one email address!</span>'); return}
        fetch_item_info.current.url_token = token
        fetch(base_fetch_url+'/sec/edit-share-info/',{
        method:'POST',
        credentials:'include',
        headers:{
            "Content-Type": "application/json",
            "protocol":"init"
        },

        body:JSON.stringify({
            fetch_item_info: fetch_item_info.current,
            notify_them: notify_checkbox_value.current,
            overwrite_rights: overwrite_rights_checkbox_value.current,
            action: action,
        })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if(data.shared_data_erased) {window.location.reload(); return}
            get_item_info()
            const btn = document.querySelector('.share-item-btns-apply') as HTMLButtonElement
            btn.classList.remove('apply_animation')
            void btn.offsetWidth;
            btn.classList.add('apply_animation')
        })

    },[])


    const copy_link = () => {

        const btn = document.querySelector('.share-item-btns-copy') as HTMLButtonElement
        btn.classList.remove('copy_link_animation')
        void btn.offsetWidth;
        btn.classList.add('copy_link_animation')
        const here_href = new URL(window.location.href)
        const url = here_href.host + '/datanest/drive/home/browse/' + link_to_copy.current
        navigator.clipboard.writeText(url)
    }


    const insert_into_whitelist = useCallback(()=>{


        if(!isEmail(user_input_ref.current)){
            return
        }

        set_whitelist(prev=>{
            const newPrev = [...prev]
            newPrev.push({
                "address": user_input_ref.current
            })
            return newPrev
        })
        address_input.current!.value = ''
        setTimeout(() => {
            user_input_ref.current = ''
        },0);


    },[])



    useEffect(()=>{
        if(!show_share_item_tab || !fetched_data || !address_input.current || !which_overall_access_selected_ref.current){return}
        const enter_handler = (e: KeyboardEvent) => {
            if(e.key == 'Enter'){
                insert_into_whitelist()
            }
        }

        if(which_overall_access_selected_ref.current == 'restricted'){window.addEventListener('keydown',enter_handler)}
        return () => {window.removeEventListener('keydown',enter_handler)}
        
    },[show_share_item_tab, fetched_data, address_input, which_overall_access_selected_ref])



    useEffect(()=>{
        if(!show_share_item_tab || user_input.length<1){return}
        const valid = isEmail(user_input)
        set_correct_address(valid)
        user_input_ref.current = user_input
    },[user_input, show_share_item_tab])

    useEffect(()=>{
        if(address_input){address_input.current?.focus()}
    })


     
    useEffect(()=>{
        if(!apply_btn.current){return}

        if(which_overall_access!='both'){
            set_which_overall_access_selected(which_overall_access)
            which_overall_access_selected_ref.current = which_overall_access
        }

        if(which_overall_access_selected_ref.current == 'restricted' && whitelist.length == 0){
            apply_btn.current.style.opacity = '0.6'
            apply_btn.current.style.pointerEvents = 'none'
        }else{
            apply_btn.current.style.opacity = '1'
            apply_btn.current.style.pointerEvents = 'auto'
        }

    },[which_overall_access,whitelist])
    

        
    useEffect(()=>{

        if(!show_share_item_tab){return}

        const get_share_info = async() => {
            wait_animation_context.play(true); 
            await get_item_info(); 
        }

        get_share_info()

    },[show_share_item_tab])


    useEffect(()=>{
        
        if(which_access_type!='both'){set_which_access_type_selected(which_access_type); fetch_item_info.current.access_type = which_access_type, which_access_type_selected_ref.current = which_access_type}
        if(which_overall_access!='both'){fetch_item_info.current.overall_access = which_overall_access}
        fetch_item_info.current.members = whitelist
        
    },[whitelist, which_access_type, which_overall_access])




    useEffect(()=>{
            
        if(show_share_item_tab){
            document.querySelectorAll('.container, .container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('.share-item-tab, .share-item-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{
            
            stop_ctrl_a_listener_context.current = false
            block_record_selector.current = false

            document.querySelectorAll('.container, .container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
        }
            
    },[show_share_item_tab])



    return(
        <>
            {fetched_data && show_share_item_tab && createPortal(<div className="share-item-tab special-tab">
                <div className="share-item-tab-front">
                    <div className="share-item-top-info">
                        <div className="share-item-tab-title"><b>Share</b> <div className="share-item-item-title">{fetched_data.name}</div></div>
                        <div>Type: <span style={{textDecoration:"underline"}}>{fetched_data.hierarchy_type ? 'Parent' : 'Children'} {!fetched_data.hierarchy_type ? `of ${fetched_data.ChildrenOf && fetched_data.ChildrenOf}` : null}</span></div>
                    </div>

                    <div className="share-item-top-action">
                        <button onClick={()=>set_show_share_item_tab(false)}>Close</button>
                        <button onClick={()=>edit_item_info('erase')}>Cancel sharing</button>
                    </div>

                </div>


                {which_overall_access_selected == 'restricted'? <div className="share-item-users-input">
                    <input ref={address_input} className="address_input" placeholder="Add users" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{set_user_input(e.target.value)}} style={{
                        border: correct_address == false && user_input.length>0 ? 'red 2px solid':'gray 1px solid'
                    }}></input>
                    <div className="share-item-users-input-msg" dangerouslySetInnerHTML={{__html:msg}}></div>
                </div>:null}


                {which_overall_access_selected == 'restricted'? <div className="share-item-allowed-people">
                    <div className="share-item-allowed-people-title">Members with access <u>({whitelist.length})</u> </div>
                    {whitelist.map((key, index)=>{
                        return (<div className="share-item-allowed-people-record" key={index}>
                            <div className="share-item-allowed-people-record-person">{key.address}</div>

                            {fetched_data.owner!=key.address && (

                                <button onClick={()=>{
                                    set_whitelist(prev=>{
                                    const newPrev = prev.filter(item=>item.address !== key.address)
                                    return newPrev
                                    })
                                }}>Delete</button>

                            )}
                        </div>)
                    })}
                </div>:null}


                <div className="share-item-overall-access">
                    <div className="share-item-overall-access-title"><b>Overall access</b></div>
                    <div className="share-item-overall-access-inner" style={{
                            display: which_overall_access != 'both'?'flex': 'block'
                        }}>
                        
                        {which_overall_access == 'restricted' || which_overall_access == 'both'? <div className="share-item-overall-access-type-option share-item-overall-access-type-option-restricted"
                        style={{
                            color: which_overall_access_selected=='restricted' ? 'aqua' : 'white'
                        }}
                        onClick={
                            ()=>set_which_overall_access(prev=>{
                                if(prev == 'both'){return 'restricted'}
                                return 'both'
                            })
                        }>Restricted access</div>: null}

                        {which_overall_access == 'anyone' || which_overall_access == 'both'? <div className="share-item-overall-access-type-option share-item-overall-access-type-option-anyone" 
                        style={{
                            color: which_overall_access_selected=='anyone' ? 'aqua' : 'white'
                        }}
                        onClick={
                            ()=>set_which_overall_access(prev=>{
                                if(prev == 'both'){return 'anyone'}
                                return 'both'
                            })
                        }>Anyone who possess this link</div>: null}
                        {which_overall_access != 'both' ? <a className="share-item-img-placeholder"><img src={`${nextConfig.assetPrefix}/assets/triangle.png`} alt=""></img></a>:null}

                    </div>
                </div>
                


                
                {item_type == 'dir' && <div className="share-item-access-type">
                    <div className="share-item-access-type-title"><b>Access type</b></div>

                        <div className="share-item-access-type-inner" style={{
                            display: which_access_type != 'both'?'flex': 'block'
                        }}>

                            {which_access_type == 'browse-only' || which_access_type == 'both'? <div className="share-item-overall-access-type-option" 
                            style={{
                                color: which_access_type_selected  == 'browse-only' ? 'aqua': 'white'
                            }}
                            onClick={
                                ()=>set_which_access_type(prev=>{
                                    if(prev == 'both'){return 'browse-only'}
                                    return 'both'
                                })
                            }>Browsing - only</div>: null}

                            {which_access_type == 'editing' || which_access_type == 'both' ? <div className="share-item-overall-access-type-option" 
                            style={{
                                color: which_access_type_selected == 'editing' ? 'aqua': 'white'
                            }}
                            onClick={
                                ()=>set_which_access_type(prev=>{
                                    if(prev == 'both'){return 'editing'}
                                    return 'both'
                                })
                            }>Editing</div>: null}
                            {which_access_type != 'both' ? <a className="share-item-img-placeholder"><img src={`${nextConfig.assetPrefix}/assets/triangle.png`} alt=""></img></a>:null}
                        </div>
                </div>}

                    
                {which_overall_access == 'restricted'?<div className="share-item-notifier">
                    <label><input type="checkbox" onChange={()=>{notify_checkbox_value.current = !notify_checkbox_value.current;}}></input> Notify members</label>
                </div>:null}


                {item_type == 'dir' ? <div className="share-item-overwrite">
                    <label><input type="checkbox" onChange={()=>{overwrite_rights_checkbox_value.current = !overwrite_rights_checkbox_value.current;}}></input> Overwrite rights of items inside</label>
                </div>:null}


                <div className="share-item-btns">
                    <button className="share-item-btns-copy" onClick={copy_link}>Copy link</button>
                    <button onClick={()=>{edit_item_info('edit')}} ref={apply_btn} className="share-item-btns-apply">Apply</button>
                </div>
            </div>,document.body)}
        </>
    )


}

export default Share_item_tab
