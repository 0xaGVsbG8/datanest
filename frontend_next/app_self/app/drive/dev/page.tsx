'use client'
import { useState, useEffect, useRef, createContext, useContext } from "react"
import './styles/page.css'
import Storage_info from "./comps/Storage_info"
import Storage_quick_action from "./comps/Quick_action"
import Add_user_widget from "./comps/Add_user_widget"
import Users_manager from "./comps/Users_manager"
import Get_data from "./hooks/get_data"
import { fetched_data_context_ } from "./context"
import { app_dir_name } from "@/app/config"
import { home_path } from "@/app/not-found"






const View = () => {




    const {fetched_data} = useContext(fetched_data_context_)

    return (

            <div id="container" style={{visibility: fetched_data?.STORAGE_INFO ? 'visible' : 'hidden'}}>
                <div id="dev-dashboard-top-placeholder">
                    <div id="dev-dashboard-top">
                        <div id="dev-dashboard-title">
                            <a>Dev Dashboard</a>
                            <span>Dev's view - managing storage and users...</span>
                        </div>
                        <button id="dev-dashboard-home-btn" onClick={()=>window.open('/datanest/drive/home/me','_self')}>Go back to home</button>
                    </div>
                </div>

                <div id="container-panels">
                    <div id="container-left-panel">
                        <Storage_info></Storage_info>
                        <Storage_quick_action></Storage_quick_action>
                    </div>

                    <div id="container-right-panel">
                        <Users_manager></Users_manager>
                    </div>
                </div>

                <Get_data></Get_data>
                <br></br>


            </div>
            
    )
}

export default View
