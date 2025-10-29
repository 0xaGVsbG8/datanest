'use client'
import { useEffect, useState, useRef, useCallback, useContext } from "react"
import { createPortal } from "react-dom"
import { app_dir_name, base_fetch_url } from "@/app/config"
import { useRouter } from "next/navigation"
import { set_repull_data_context_, block_record_selector_context } from "../layout_contexts"
import '../styles/mkdir_tab.css'
import { is_shared_filter } from "./pull_data/pull_data"
import nextConfig from "@/next.config"


interface mk_dir_props{
    token: string
}


export const send_mkdir_fetch = async(
    token:string, 
    dirname:string,
    redirect_after_mking_dir: boolean = false
  ) => {

    const response = await fetch(base_fetch_url + '/sec/mkdir/',{
        method:'POST',
        credentials:'include',
        headers:{
            "Content-Type": "application/json",
            "protocol":"init"
        },

        body:JSON.stringify({
            token: token,
            dirname: dirname,
            filter_by:  is_shared_filter() ? 'shared' : 'off'
        })
        })

        const data = await response.json()
       
        if(!data.url){return}
        if(redirect_after_mking_dir){window.open(`/${app_dir_name}/home/browse/${data.url}/`, '_self')}

}



const Mk_dir = ({token}: mk_dir_props) => {


    const [ show_mkdir_tab, set_show_mkdir_tab ] = useState<boolean>(false)
    const redirect_after_mking_dir = useRef<boolean>(true)
    const dirname_input = useRef<string>('')
    const {set_repull_data} = useContext(set_repull_data_context_)
    const block_record_selector = useContext(block_record_selector_context)
    

    const MKDIR = useCallback(async()=>{

        if(dirname_input.current == ''){
            document.getElementById('mkdir-tab-input')?.focus()
            return
        }

        const response = await send_mkdir_fetch(token, dirname_input.current, redirect_after_mking_dir.current)
        if(redirect_after_mking_dir.current === false) set_show_mkdir_tab(false);set_repull_data(c=>c+1)


    },[])


    useEffect(()=>{
        if(show_mkdir_tab){
            block_record_selector.current = true
            document.querySelectorAll('#container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('#mkdir-tab, #mkdir-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{
            document.querySelectorAll('#container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
            block_record_selector.current = false

        }
        
    },[show_mkdir_tab])




    useEffect(()=>{
        const handler = (e:KeyboardEvent) => {
            if(e.key=='Enter'){
                document.getElementById('mkdir-tab-btns-placeholder-create')?.click()
            }
        }
        
        document.getElementById('mkdir-tab-input')?.focus()
        document.getElementById('mkdir-tab-input')?.addEventListener('keydown',(e)=>handler(e))
        return () => {
            document.getElementById('mkdir-tab-input')?.removeEventListener('keydown',(e)=>handler(e))
        }

    })


    return (
        <>
            <div id="mkdir_btn" onClick={()=>set_show_mkdir_tab(c=>!c)} style={{
                opacity: show_mkdir_tab?'0.6':'1',
                pointerEvents:show_mkdir_tab?'none':"auto"
            }}>
                <img alt='' src={`${nextConfig.assetPrefix}/assets/mkdir.png`}></img>
                <a>Make a folder</a>
            </div>

            {show_mkdir_tab && createPortal(
                <div id="mkdir-tab" className="special-tab">
                    <div id="mkdir-tab-title"><b>New directory</b></div>
                    <input title="folder name" id="mkdir-tab-input" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {dirname_input.current = e.target.value}}></input>
                    <div id="mkdir-tab-btns-placeholder">
                        <label><input type='checkbox' defaultChecked onChange={(e: React.ChangeEvent<HTMLInputElement>)=>redirect_after_mking_dir.current = e.target.checked}></input>Take me there</label>
                        <div>
                            <button id="mkdir-tab-btns-placeholder-cancel" onClick={()=>set_show_mkdir_tab(false)}>Cancel</button>
                            <button id="mkdir-tab-btns-placeholder-create" onClick={MKDIR}>Create</button>
                        </div>
                    </div>
                </div>,document.body)
            }
        </>
    )


}


export default Mk_dir