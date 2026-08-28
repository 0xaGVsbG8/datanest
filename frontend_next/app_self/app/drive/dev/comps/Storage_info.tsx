import { fetched_data_context_ } from "../context"
import { useContext, useEffect, useState } from "react"
import Change_limit from "./change_limit"
import '../styles/storage_info.css'

const Storage_info = () => {


    const {fetched_data} = useContext(fetched_data_context_)
    const [chart_perc, set_chart_perc] = useState<number>(0)
    const [show_change_limit, set_show_change_limit] = useState<boolean>(false)
    const [limit_what, set_limit_what] = useState<'upload' | 'account'>('upload')



    return (
        <>
            {fetched_data?.STORAGE_INFO && <div id="storage-info" className="panel-card">
                <h2 id="storage-info-title">Storage info</h2>
                <div id="storage-info-used">
                    <div id="storage-info-used-placeholder">
                        <a id="storage-info-used-title">Used by service</a>
                        <a id="storage-info-used-info">{fetched_data?.STORAGE_INFO.used_storage}</a>
                    </div>
                    <div id="storage-info-used-chart-placeholder">
                        <div id="storage-info-used-chart"><div style={{width: fetched_data.STORAGE_INFO.perc > 1 ? `${fetched_data.STORAGE_INFO.perc}%` : '1%'}}></div></div>
                    </div>
                </div>

                <div id="storage-info-avaible">
                    <a id="storage-info-avaible-title">Left storage</a>
                    <a id="storage-info-avaible-info">{fetched_data?.STORAGE_INFO.free_storage}</a>
                </div>

                <div id="storage-info-storage-acc-limit">
                    <a id="storage-info-storage-limit-title">
                        <label>Limit per account:</label> <span id="storage-info-storage-limit-info">{fetched_data?.STORAGE_INFO.max_storage_per_acc}</span>
                    </a>
                    <button id="storage-info-storage-acc-limit-btn" onClick={()=>{set_limit_what('account'); set_show_change_limit(c=>!c)}}>Change limit</button>
                </div>


                <div id="storage-info-storage-upload-limit">
                    <a id="storage-info-storage-limit-title">
                        <label>Upload size limit:</label> <span id="storage-info-storage-limit-info">{fetched_data?.STORAGE_INFO.max_upload_size}</span>
                    </a>
                    <button id="storage-info-storage-upload-limit-btn" onClick={()=>{set_limit_what('upload'); set_show_change_limit(c=>!c)}}>Change limit</button>
                </div>


                {show_change_limit && <Change_limit set_show_change_limit={set_show_change_limit} limit_what={limit_what}></Change_limit>}
            </div>}
        </>
        
    )

}

export default Storage_info