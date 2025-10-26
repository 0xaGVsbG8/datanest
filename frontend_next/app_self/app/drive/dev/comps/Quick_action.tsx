
import { base_fetch_url } from "@/app/config"
import { useEffect, useRef, useContext, useState } from "react"
import Quick_action_confirmation from "./action_confirmation_tab"
import Add_user_widget from "./Add_user_widget"
import '../styles/Quick_actions.css'


type Quick_titles = 'Format the whole disk' | 'Delete every user' | 'Restart the service'


const Storage_quick_action = () => {


    const restarting_service = useRef<boolean>(false)
    const formating_disk = useRef<boolean>(false)
    const deleting_every_user = useRef<boolean>(false)
    const [show_quick_action_confirmation_tab, set_show_quick_action_confirmation_tab] = useState<boolean>(false)


    const [quick_action_confirmation_title, set_quick_action_confirmation_title] = useState<Quick_titles>('Format the whole disk')
    const [quick_action_confirmation_content, set_quick_action_confirmation_content] = useState<string>('')
    const [quick_action_confirmation_void, set_quick_action_confirmation_void] = useState<()=>void>(()=>{})


    const [show_add_user_widget, set_show_add_user_widget] = useState<boolean>(false)
    


    const restart_service  = async() => {

        if(restarting_service.current) return
        restarting_service.current = true

        const response = await fetch(base_fetch_url+'/dev/restart-service/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        const data = await response.json()
        window.location.reload()
        restarting_service.current = false
    }


    const format_disk = async() => {
        if(formating_disk.current) return
        formating_disk.current = true

        const response = await fetch(base_fetch_url+'/dev/format-disk/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        const data = await response.json()
        formating_disk.current = false
        window.location.reload()
    }


    const delete_every_user = async() => {
        
        if(deleting_every_user.current) return
        deleting_every_user.current = true
        const response = await fetch(base_fetch_url+'/dev/delete-every-user/',{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        const data = await response.json()
        deleting_every_user.current = false
        window.location.reload()

    }



    return (
        <div id="storage-quick-actions" className="panel-card">
            <h2 id="quick-actions-title">Quick actions</h2>
            <div id="quick-actions-format-disk" className="quick-actions-action" onClick={()=>{
                set_quick_action_confirmation_void(()=>format_disk)
                set_quick_action_confirmation_title('Format the whole disk')
                set_quick_action_confirmation_content('<a>Are you sure that you want to format the whole disk? This action is irreversible! It will cause to <a style="color:red">delete</a> every single record from database refering to files and files itself from a drive (Including  the devs)</a>')
                set_show_quick_action_confirmation_tab(true)
            }}>Format the whole disk</div>

            <div id="quick-actions-drop-users" className="quick-actions-action" onClick={()=>{
                set_quick_action_confirmation_void(()=>delete_every_user)
                set_quick_action_confirmation_title('Delete every user')
                set_quick_action_confirmation_content('<a>Are you sure that you want to delete every user (not including devs)? This action is irreversible! It will cause to <a style="color:red">delete</a> every single record from database refering to files and files itself of regular users!</a>')
                set_show_quick_action_confirmation_tab(true)
            }}>Delete every user</div>

            <div id="quick-actions-restart-service" className="quick-actions-action" onClick={()=>{
                set_quick_action_confirmation_void(()=>restart_service)
                set_quick_action_confirmation_title('Restart the service')
                set_quick_action_confirmation_content('<a>Are you sure that you want to restart the serivce? This will cause all the connection to <span style="color:red">stop</span></a> such as uploading, downloading, etc... The service may not be able to come back by itself and may need a manual reboot!')
                set_show_quick_action_confirmation_tab(true)
            }}>Restart service</div>


            <div id="quick-actions-restart-service" className="quick-actions-action" onClick={()=>{
              set_show_add_user_widget(c=>!c)
            }}>Add a user</div>

            
            {show_quick_action_confirmation_tab && <Quick_action_confirmation 
                title={quick_action_confirmation_title} 
                content={quick_action_confirmation_content} 
                set_show_quick_action_confirmation_tab={set_show_quick_action_confirmation_tab} 
                confirmation_action={quick_action_confirmation_void}>
            </Quick_action_confirmation>}


            {show_add_user_widget && <Add_user_widget set_show_add_user_widget={set_show_add_user_widget}></Add_user_widget>}
            
        </div>
    )

}

export default Storage_quick_action