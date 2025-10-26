

import {base_backend_url, use_ssl} from '../next.config'


const app_prefix = '' 

export const app_dir_name = 'datanest/drive' // for routing

export const doc_title: string = 'dataNest' // default doc title

const one_zip_per_conn = false // prevents frontend only


const base_fetch_url = (use_ssl ? "https" : 'http') + app_prefix + base_backend_url
const base_ws_url=  (use_ssl ? "wss" : 'ws') + app_prefix + base_backend_url



const test_backend__communication_each_time = true 




export { base_fetch_url, test_backend__communication_each_time, base_ws_url, base_backend_url, one_zip_per_conn}