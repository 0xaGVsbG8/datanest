'use client'
import { useEffect, useState, useContext} from "react"
import My_disk_page from "./my_disk_page"
import { useRouter, useParams } from "next/navigation"
import { fetched_data_context_, set_repull_data_context_ } from "../layout_contexts"
import Finder from "../comps/finder"
import Settings_tab from "../comps/settings_tab/settings_tab"
import '../styles/page.css'
import { createPortal } from "react-dom"
import { is_favourite_filter, is_shared_filter } from "../comps/pull_data/pull_data"
import Section_options from "../comps/Section_options"
import { show_section_props, Section_options_context_ } from "./context"
import nextConfig from "@/next.config"
import { home_path } from "@/app/not-found"


const is_whole_disk_filter = () => {
    if(window.location.href.includes('filter_by_whole_disk')){return true}
    return false
}




const View = () => {


    const [show_section, set_show_section] = useState<show_section_props>(
        'hold'
    )

    
    const router = useRouter()
    const {set_repull_data, hide_section, set_search_type, search_type} = useContext(set_repull_data_context_)
    const [show_settings_tab, set_show_settings_tab] = useState<boolean>(false)


    const [mounted, setMounted] = useState<boolean>(false)
    const [WindowInnerWidth, setWindowInnerWidth] = useState<number>(0)

    const params = useParams()
    let token = params.token as string

    const [AllParent, setAllParent] = useState<HTMLDivElement | null>(null)

    const {fetched_data} = useContext(fetched_data_context_)

    if(!token){
        token = 'main'
    }


    
    useEffect(()=>{
        set_show_section(is_favourite_filter() ? 'fav' : is_shared_filter() ? 'shared' : is_whole_disk_filter() ? 'scan-disk' : window.location.href.includes('home/me') ? 'mine' : 'none')
    },[])


  

    const repull = () => {
        set_repull_data(c=>c+1)
    }


    useEffect(()=>{
        repull()
    },[show_section])


    useEffect(()=>{
        if(['mine','fav','shared', 'none'].includes(show_section)){
            set_search_type('normal')
        }
        if(show_section=='scan-disk'){
            set_search_type('whole')
            setTimeout(() => {
            repull()
            }, 3000);
        }
    },[show_section])




    useEffect(()=>{

        setMounted(true)


        const all_parent = document.getElementById('all-parent') as HTMLDivElement
        if(all_parent) setAllParent(all_parent)

        const Handler = () => {
            setWindowInnerWidth(window.innerWidth)
        }

        window.addEventListener('resize',Handler)
        return () => window.removeEventListener('resize',Handler)

    },[])


    

    return (
        <div id="all-parent" className={`special-tab ${hide_section ? 'hide_page': 'show_page'}`}>
            <div id="div-canvas"></div>

            <Settings_tab  set_show_settings_tab={set_show_settings_tab}  show_settings_tab={show_settings_tab} ></Settings_tab>
                <div id="home-panel" className="special-tab">
                <div  onClick = {()=>{window.open('/datanest/drive/home/me','_self')}} id="disk-cloud-btn"> <img alt="" className="site-icon-pic" src={`${nextConfig.assetPrefix}/assets/site-icon.png`}></img> <a id="home-sub"></a></div>

                <Finder type = {search_type}></Finder>
                <div id="settings-btn" onClick={()=>set_show_settings_tab(true)}>
                    <img alt="" id="settings-img" src={`${nextConfig.assetPrefix}/assets/settings.png`}></img>
                </div>
            </div>

            <div id="selection-panel">

                <Section_options_context_.Provider value={{set_show_section, show_section}}>
                    {window.innerWidth > 968 ? <Section_options></Section_options>: 
                    mounted && AllParent && createPortal (
                       <Section_options></Section_options>
                       , AllParent
                    )}
                </Section_options_context_.Provider>

                <div id="user-content">{(show_section) && (<My_disk_page></My_disk_page>)}</div>


            </div>


        </div>
    )

}

export default View