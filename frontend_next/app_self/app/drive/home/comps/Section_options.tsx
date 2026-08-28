import { useContext } from "react";
import { Section_options_context_ } from "../me/context"
import { set_repull_data_context_} from "../layout_contexts";
import { app_dir_name } from "@/app/config";
import nextConfig from "@/next.config";


const Section_options = () => {

    const {show_section, set_show_section} = useContext(Section_options_context_)
   

    return (
        <div id="section-selector">
            
            <div className={show_section=='mine' ? 'selected_section': ''} onClick={()=>{
                window.open(`/${app_dir_name}/home/me/`,'_self');set_show_section('mine')
            }}>
                <img alt="" src={`${nextConfig.assetPrefix}/assets/mine-disk.png`}></img>
                <button>&nbsp;Mine disk</button>
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

        </div>
    )
}

export default Section_options

