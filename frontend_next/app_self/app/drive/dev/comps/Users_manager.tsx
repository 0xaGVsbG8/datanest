
import { useContext, useState, useRef } from "react"
import { fetched_data_context_ } from "../context"
import Quick_action_confirmation from "./action_confirmation_tab"
import { base_fetch_url } from "@/app/config"
import '../styles/users_manager.css'


type Quick_titles = "Erase user' s files" | "Delete a user"



const Users_manager = () => {

    const {fetched_data} = useContext(fetched_data_context_)


    const [show_quick_action_confirmation_tab, set_show_quick_action_confirmation_tab] = useState<boolean>(false)
    const [quick_action_confirmation_title, set_quick_action_confirmation_title] = useState<Quick_titles>('Erase user\' s files')
    const [quick_action_confirmation_content, set_quick_action_confirmation_content] = useState<string>('')
    const [quick_action_confirmation_void, set_quick_action_confirmation_void] = useState<()=>void>(()=>{})

    const deleting_user = useRef<boolean>(false)
    const erasing_user = useRef<boolean>(false)

    


    const delete_user = async(address: string, action_type: 'delete' = 'delete') => {

        const fetch_delete_user = async() => {

            if(deleting_user.current) return
            deleting_user.current = true

            const response = await fetch(base_fetch_url+`/dev/manage-user/?address=${address}&action_type=${action_type}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
            })
            const data = await response.json()
            deleting_user.current = false
            window.location.reload()

        }

        set_quick_action_confirmation_title('Delete a user')
        set_quick_action_confirmation_content(`Are you sure that you want to delete every single file of <span style='color: green;text-decoration: underline'>${address}</span> and the account itself aswell. This action is irreversible!`)
        set_quick_action_confirmation_void(()=>fetch_delete_user)
        set_show_quick_action_confirmation_tab(true)
    }




    const erase_users_files = async(address: string, action_type: 'erase' = 'erase') => {

        const fetch_erase_user = async() => {


            if(erasing_user.current) return
            erasing_user.current = true

            const response = await fetch(base_fetch_url+`/dev/manage-user/?address=${address}&action_type=${action_type}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
            })
            const data = await response.json()
            erasing_user.current = false
            window.location.reload()
        }

        set_quick_action_confirmation_title('Erase user\' s files')
        set_quick_action_confirmation_content(`Are you sure that you want to delete every single file of <span style='color: green;text-decoration: underline'>${address}</span> ? The account itself will stay untouched. This action is irreversible!`)
        set_quick_action_confirmation_void(()=>fetch_erase_user)
        set_show_quick_action_confirmation_tab(true)
    }





    return (
        <>
            {fetched_data?.users_data && <div id="user-manager" className="panel-card">
                <h2 id="user-manager-title">Manage users</h2>
                <div id="user-manager-records">
                    <div className="user-manager-record">
                        <div className="user-manager-record-address">User</div>
                        <div className="user-manager-record-space-info">Takes</div>
                        <div className="user-manager-record-action">
                            Action
                        </div>
                    </div>

                    {fetched_data?.users_data.map((record, index)=>{
                        return (
                            <div className="user-manager-record" key={index}>
                                <div className="user-manager-record-address">
                                    <a>{record.address}</a>
                                </div>
                                <div className="user-manager-record-space-info">{record.space}</div>
                                <div className="user-manager-record-action">
                                    <div className="user-manager-record-action-drop" onClick={()=>delete_user(record.address, 'delete')}>Delete user</div>
                                    <div className="user-manager-record-action-clean" onClick={()=>erase_users_files(record.address, 'erase')}>Erase user's files</div>
                                </div>
                            </div>
                        )
                    })}


                </div>

                {show_quick_action_confirmation_tab && <Quick_action_confirmation 
                    title={quick_action_confirmation_title} 
                    content={quick_action_confirmation_content} 
                    set_show_quick_action_confirmation_tab={set_show_quick_action_confirmation_tab} 
                    confirmation_action={quick_action_confirmation_void}>
                </Quick_action_confirmation>}

                <br></br>
            </div>}
        </>
    )


}

export default Users_manager