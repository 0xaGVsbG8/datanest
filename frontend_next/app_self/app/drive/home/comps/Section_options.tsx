import { useContext, useEffect, useState } from "react";
import { Section_options_context_ } from "../me/context"
import { set_repull_data_context_} from "../layout_contexts";
import { app_dir_name, base_fetch_url } from "@/app/config";
import nextConfig from "@/next.config";


type storage_info = {
    used_storage: string
    max_storage_per_account: string
    usage_perc: number | string
}

const Sidebar_storage = () => {
    const [storage, set_storage] = useState<storage_info | null>(null)

    useEffect(()=>{
        const load = async () => {
            const response = await fetch(base_fetch_url+'/sec/get_user_info_for_settings/', {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()
            set_storage({
                used_storage: data.used_storage,
                max_storage_per_account: data.max_storage_per_account,
                usage_perc: data.usage_perc,
            })
        }
        load()
        window.addEventListener('datanest-storage-changed', load)
        return () => window.removeEventListener('datanest-storage-changed', load)
    },[])

    if(!storage) return null

    const perc = typeof storage.usage_perc === 'number' && storage.usage_perc <= 1
        ? storage.usage_perc * 100
        : Number(storage.usage_perc) || 0

    return (
        <div className="sidebar-storage">
            <div className="sidebar-storage-title">Storage</div>
            <div className="sidebar-storage-data">{storage.used_storage} out of {storage.max_storage_per_account} | {Math.round(perc)}%</div>
            <div className="sidebar-storage-chart">
                <div className="sidebar-storage-chart-filling" style={{width: `${Math.min(perc, 100)}%`}}></div>
            </div>
        </div>
    )
}

const Section_options = () => {

    const {show_section, set_show_section} = useContext(Section_options_context_)
   

    return (
        <div id="section-selector">
            
            <div className={show_section=='mine' ? 'selected_section': ''} onClick={()=>{
                window.open(`/${app_dir_name}/home/me/`,'_self');set_show_section('mine')
            }}>
                <img alt="" src={`${nextConfig.assetPrefix}/assets/mine-disk.png`}></img>
                <button>&nbsp;My disk</button>
            </div>

            <div className={show_section=='fav' ? 'selected_section': ''} onClick={()=>{

                window.open(`/${app_dir_name}/home/me/?filter_by_favs=o2`,'_self');
            }}>
                <img alt="" src={`${nextConfig.assetPrefix}/assets/favourited-icon.png`}></img>
                <button>&nbsp;Favourites</button>
            </div>

            <div className={show_section=='shared' ? 'selected_section': ''} onClick={()=>{
                window.open(`/${app_dir_name}/home/me/?filter_by_shared=o2`,'_self');
            }}>
                <img alt="" src={`${nextConfig.assetPrefix}/assets/shared-icon.png`}></img>
                <button>&nbsp;Shared</button>
            </div>
            
            <div className={show_section=='scan-disk' ? 'selected_section': ''} onClick={()=>{
                    window.open(`/${app_dir_name}/home/me/?filter_by_whole_disk=02`,'_self')
            }}>
                <img alt="" src={`${nextConfig.assetPrefix}/assets/look-for-icon.png`}></img>
                <button>&nbsp;Look for</button>
            </div>

            <Sidebar_storage></Sidebar_storage>

        </div>
    )
}

export default Section_options

