
import { createPortal } from "react-dom"
import { base_fetch_url } from "@/app/config"
import '../../styles/settings_tab.css'
import { createContext, useContext, useEffect, useRef, useState } from "react"
import Log_out_mod from "./settings_tab_modules/log_out"
import Erase_disk_mod from "./settings_tab_modules/erase_disk"
import Delete_account_mod from "./settings_tab_modules/delete_account"
import Rem_dups_mod from "./settings_tab_modules/rem_dups"
import { block_record_selector_context } from "../../layout_contexts"


type settings_tab_props = {
    set_show_settings_tab: React.Dispatch<React.SetStateAction<boolean>>
    show_settings_tab: boolean
}


type fetched_data_props = {
    user: string,

    isDev: boolean,
    
    real_used_storage: number,
    real_max_storage_per_account: number,

    used_storage: string,
    max_storage_per_account: string

    statistics: {
        dcount: number
        fcount: number
    }

    usage_perc: number
}







export type use_module_dispatcher_props = {
    log_out: boolean
    erase_disk: boolean
    delete_account: boolean
    rem_dups: boolean
}


export type use_module_context_props = {
    set_use_module: React.Dispatch<React.SetStateAction<use_module_dispatcher_props>>
    use_module: use_module_dispatcher_props
}



export const use_module_context_ = createContext<use_module_context_props>({
    set_use_module: ()=>{},
    use_module: {
        log_out: false,
        erase_disk: false,
        delete_account: false,
        rem_dups: false,
    }
})




export type job_info_props = {
    show: boolean
    opacity: number
    msg: string
}


export type job_info_context_props = {
    set_job_info: React.Dispatch<React.SetStateAction<job_info_props>>
    job_info: job_info_props
}


export const job_info_context_ = createContext<job_info_context_props>({
    set_job_info: ()=>{},
    job_info:{show: false, msg: '', opacity: 0}
})



const Settings_tab = ({set_show_settings_tab, show_settings_tab}:settings_tab_props) => {




    const pulling_data = useRef<boolean>(false)

    const [fetched_data, set_fetched_data] = useState<fetched_data_props | null>(null)
    const block_record_selector = useContext(block_record_selector_context)


    const [job_info, set_job_info] = useState<job_info_props>({
        show: false,
        msg: 'Duplicates files removal job has been assigned!',
        opacity: 0,
    })



    const [use_module, set_use_module] = useState<use_module_dispatcher_props>({
        log_out: false,
        erase_disk: false,
        delete_account: false,
        rem_dups: false,
    })



    const get_user_info = async() => {

        if(pulling_data.current){return}
        pulling_data.current = true

        const response = await fetch(base_fetch_url+'/sec/get_user_info_for_settings/',{

            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
            },
        })

        const data = await response.json() as fetched_data_props
        await set_fetched_data(data)

        console.log(data)

        pulling_data.current = false
        
    }






    useEffect(()=>{
        get_user_info()
        const refresh = () => { pulling_data.current = false; get_user_info() }
        window.addEventListener('datanest-storage-changed', refresh)
        return () => window.removeEventListener('datanest-storage-changed', refresh)
    },[])


    useEffect(()=>{
        
        if(show_settings_tab){
            block_record_selector.current = true
            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('#settings-tab, #settings-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{
            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
            block_record_selector.current = false
        }

    },[show_settings_tab])



    const show_log_out = () => {
        set_use_module(prev=>({
            ...prev,
            log_out: true
        }))
    }


    const show_erase_disk = () => {
        set_use_module(prev=>({
            ...prev,
            erase_disk: true
        }))
    }


    const show_delete_account = () => {
        set_use_module(prev=>({
            ...prev,
            delete_account: true
        }))
    }


    const show_rem_dups = () => {

        set_use_module(prev=>({
            ...prev,
            rem_dups: true
        }))

    }



 

    return (
        <>
            <job_info_context_.Provider value={{set_job_info, job_info}}>
                <use_module_context_.Provider value={{set_use_module, use_module}}>
                    <Log_out_mod></Log_out_mod>
                    <Erase_disk_mod></Erase_disk_mod>
                    <Delete_account_mod></Delete_account_mod>
                    <Rem_dups_mod token={'main'} ></Rem_dups_mod>
                </use_module_context_.Provider>
            </job_info_context_.Provider>


            {show_settings_tab && fetched_data && createPortal(
                <div id="settings-tab" className="special-tab">
                    <div id="user-address-panel">
                        <div id="user-address-panel-address">
                            <div id="user-address-panel-address-placeholder">User:</div>
                            <div id="user-address-panel-address-user">{fetched_data.user}</div>
                        </div>
                        <div id="user-address-panel-close" onClick={()=>{
                            set_show_settings_tab(false);
                        }}>Close</div>
                    </div>

                    <div className="settings-tab-separator"><div></div></div>

                    <div id="settings-tab-space-info">
                            <div id='settings-tab-space-info-title'>Storage</div>
                            <div id="settings-tab-space-info-space">

                                <div id="settings-tab-space-info-space-data">{fetched_data.used_storage} out of {fetched_data.max_storage_per_account} | {`${fetched_data.usage_perc}%`}</div>
                                
                                <div id="settings-tab-space-info-space-chart">
                                    <div id="settings-tab-space-info-space-chart-filling" style={{
                                        width: `${fetched_data.usage_perc}%`
                                    }}></div>
                                </div>

                                <div className="settings-tab-separator"><div></div></div>


                                <div id="settings-tab-space-info-space-info">
                                    <div id="settings-tab-space-info-space-info-stats">
                                        <div id="settings-tab-space-info-space-info-stats-title">Statistics:</div>
                                        <div id="settings-tab-space-info-space-info-stats-info">
                                            {fetched_data.statistics.dcount} directory/ies, {fetched_data.statistics.fcount} file/s
                                        </div>
                                    </div>
                                </div>

                            </div>
                    </div>


                    <div className="settings-tab-separator"><div></div></div>
                    
                        
                    <div id="settings-tab-actions">
                        <div id="settings-tab-actions-title">Account actions</div>
                        <div id="settings-tab-actions-dups" className="settings-tab-actions-opt"><button onClick={()=>show_rem_dups()}>Get rid of duplicates</button></div>
                        <div id="settings-tab-actions-clean-up" className="settings-tab-actions-opt"><button onClick={()=>{show_erase_disk()}}>Erase disk</button></div>
                        <div id="settings-tab-actions-delete-account" className="settings-tab-actions-opt"><button onClick={()=>{show_delete_account()}}>Delete account</button></div>
                        <div id="settings-tab-actions-log-out" className="settings-tab-actions-opt"><button onClick={()=>{show_log_out()}}>Log out</button></div>
                        {fetched_data.isDev && <div id="settings-tab-actions-go-dev"><button onClick={()=>window.open('/datanest/drive/dev','_self')}>Go dev</button></div>}

                    </div>
                    
                    <div className="settings-tab-separator"><div></div></div>

                    <div id='settings-tab-assigned-job'>
                        <div 
                            className={job_info.opacity == 1 ? 'settings-tab-assigned-job_show' : 'settings-tab-assigned-job_hide' }
                            style={{
                                width: job_info.show ? '100%' : '0%',
                            }}>
                            {job_info.msg}
                        </div>
                    </div>


                </div>,document.body
            )}
        </>
    )


}

export default Settings_tab