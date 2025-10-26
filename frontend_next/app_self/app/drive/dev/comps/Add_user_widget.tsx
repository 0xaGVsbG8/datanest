
import { useEffect, useRef, useState } from "react"
import '../styles/add_users_widget.css'
import { base_fetch_url } from "@/app/config"
import { createPortal } from "react-dom"


type Add_user_widget_props = {
    set_show_add_user_widget: React.Dispatch<React.SetStateAction<boolean>>
}

const Add_user_widget = ({set_show_add_user_widget}: Add_user_widget_props) => {

    const address_val = useRef<string>('')
    const address_el = useRef<HTMLInputElement | null>(null)


    const passwd1 = useRef<string>('')
    const passwd1_el = useRef<HTMLInputElement | null>(null)

    
    const passwd2 = useRef<string>('')
    const passwd2_el = useRef<HTMLInputElement | null>(null)


    const [msg,set_msg] = useState<string>('')


    const fetching = useRef<boolean>(false)


    const mounted = useRef<boolean>(false)



    const [portal_root, set_portal_root] = useState<HTMLDivElement | null>(null)



    useEffect(()=>{
        const root = document.getElementById('portal-root') as HTMLDivElement
        if(!root) return
        set_portal_root(root)
        setTimeout(() => {
            if(address_el.current) address_el.current!.focus()
        }, 100);
    },[])





    useEffect(()=>{


        const block_cont = () => {
            const container = document.getElementById('container') as HTMLDivElement
            container.style.opacity = '0.6'  
            container.style.pointerEvents = 'none'  
            container.style.userSelect = 'none'  

        }

        const unblock_cont = () => {
            const container = document.getElementById('container') as HTMLDivElement
            container.style.opacity = '1'  
            container.style.pointerEvents = 'auto' 
            container.style.userSelect = 'auto'  
        }

        block_cont()

        return () => {
            if(mounted.current) {unblock_cont()}
            else mounted.current = true
        }


    },[])



    const isEmailCorrect = (email: string) => {
        const emailRegex = /^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    }



    const add_user = async() => {

        if(address_val.current == ''){
            set_msg('<span style="color:red">Address field cant be empty!</span>')
            address_el.current!.focus()
            return
        }

        if(passwd1.current == '') {
            set_msg('<span style="color:red">Password field cant be empty!</span>')
            passwd1_el.current!.focus()
            return
        }

        if(passwd2.current == '') {
            set_msg('<span style="color:red">Retype password field cant be empty!</span>')
            passwd2_el.current!.focus()
            return
        }

        if(passwd1.current!=passwd2.current){
            set_msg('<span style="color:red">Password values are diffrent!</span>')
            passwd2_el.current!.focus()
            return
        }
        

        if(!isEmailCorrect(address_val.current)){
            set_msg('<span style="color:red">Email address is invalid!</span>')
            address_el.current!.focus()
            return
        }



        fetching.current = true
        const response = await fetch(base_fetch_url+`/dev/add-user/?address=${address_val.current}&passwd=${passwd1.current}&isDev=${true}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        const data = await response.json()

        if(data.exists){
            set_msg('<span style="color:red">User with such an address already exists!</span>')
            return
        }

        if(data.invalid_email) {
            set_msg('<span style="color:red">Email address is invalid!</span>')
            address_el.current!.focus()
            return
        }

        if(data.result) set_show_add_user_widget(false); window.location.reload() 

        fetching.current= false



    }


    useEffect(()=>{

        const erase_msg = () => {
            set_msg('')
        }


        const inputs_array = document.querySelectorAll<HTMLInputElement>('#add-user-widget input:not(#dev-priv-input)')
        if(!inputs_array) return

        for(const item of inputs_array){
            item.addEventListener('keydown',erase_msg)
        }

        const address_el_handler = (e: KeyboardEvent) => {
            if(e.key == 'Enter') passwd1_el.current!.focus()
        }


        const passwd1_el_handler = (e: KeyboardEvent) => {
            if(e.key == 'Enter') passwd2_el.current!.focus()
        }

        const passwd2_el_handler = (e: KeyboardEvent) => {
            if(e.key == 'Enter')  add_user()
        }



        address_el.current?.addEventListener('keydown', address_el_handler)
        passwd1_el.current?.addEventListener('keydown', passwd1_el_handler)
        passwd2_el.current?.addEventListener('keydown', passwd2_el_handler)



        return () => {
            for(const item of inputs_array){
                item.removeEventListener('keydown',erase_msg)
            }

            address_el.current?.removeEventListener('keydown', address_el_handler)
            passwd1_el.current?.removeEventListener('keydown', passwd1_el_handler)
            passwd2_el.current?.removeEventListener('keydown', passwd2_el_handler)
        }




    },[])


    
    return (
        <>
            {portal_root && createPortal(<div id="add-user-widget" className="panel-card">
                <h2 id="add-user-widget-title">Add a user</h2>
                <label>User's address<input type="text" ref={address_el}  onChange={(e)=>{address_val.current = e.target.value}} /></label>

                <label>User's password<input type="password"  ref={passwd1_el} onChange={(e)=>{passwd1.current = e.target.value}}/></label>
            
                <label>Retype user's password<input type="password"  ref={passwd2_el} onChange={(e)=>passwd2.current = e.target.value} /></label>
                
                <label id="dev-priv-label"><input type="checkbox" id="dev-priv-input"></input><a>Dev priviliges</a></label>
                
                <div id="add-user-add-btn-placeholder">
                    <div dangerouslySetInnerHTML={{__html: msg}}></div>
                    <div id="add-user-add-btn-placeholder-btn">
                        <button onClick={()=>{set_show_add_user_widget(false)}} id="add-user-add-btn-placeholder-btn-cancel">Cancel</button>
                        <button onClick={()=>{add_user()}}>Add</button>
                    </div>
                </div>

            </div>,portal_root)}
        </>
    )


}

export default Add_user_widget