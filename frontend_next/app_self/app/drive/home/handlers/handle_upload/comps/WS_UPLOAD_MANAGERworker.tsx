
import { 
  fetched_data_context_,
  Op_confirmation_tab_context_,
  operations_tab_context_,
  token_ls_context
} from "../../../layout_contexts";

import { base_ws_url } from "@/app/config"
import { item_data } from "../../../../types";
import { useEffect, useContext, useRef } from "react";
import { handle_upload_common_context } from "../handle_upload_contexts";
import { FILE_INPUTS_CLASSNAME, CHUNK_SIZE } from "../handle_upload";


type upload_result = {
    received_saved_progress: number
    received_data: safety_lock_data
}


type safety_lock_data = {
    this: item_data | null
    parent: item_data | null
}


type Begin_upload_props = {
    upload_token: string
    call_for_begin_upload: number
}


const max_name_length = 20


const Begin_upload = ({upload_token, call_for_begin_upload}:Begin_upload_props) => {

    const {set_coms, set_operations_count, operations_count} = useContext(operations_tab_context_)
    const operations_tab_context = useContext(operations_tab_context_)
    const {set_fetched_data} = useContext(fetched_data_context_)
    const token_ls = useContext(token_ls_context)
    const {UserFileList, packsize_ref} = useContext(handle_upload_common_context)
    const Op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)
    const connected = useRef<boolean>(false)
    const saved_progress = useRef<number>(0)
    const uploading_ref = useRef<boolean>(false)
    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)
    const ws_ref = useRef<WebSocket | null>(null)

    const begin_upload_timeout = useRef<boolean>(false)


    const connection_lost_pop_up = () => {
        op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Connection lost',
            show_confirmation_tab: true,
            content_msg: `Connection with server has been lost while uploading! Remaining files to upload are either corrupted or deleted!`,
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Confirm',
            show_cancel_btn: false,
            confirm_behaviour: ()=>{window.location.reload()},
        }))
        uploading_ref.current = false
    }



    class WS_UPLOAD_MANAGER_worker{
        ws: WebSocket

        constructor(
            ws: WebSocket,
        ){  
            this.ws = ws
        }
        

        async waitForOpen() {

            return new Promise<void>((resolve)=>{
                this.ws.onclose = () => {
                    this.ws.send(JSON.stringify({'handle_disconnect':true}))
                    if(uploading_ref.current){
                        connection_lost_pop_up()
                        this.ws.close()
                    }
                }
                this.ws.onopen = () => resolve()
            })
        }




        async register_file(bare_name: string,rel_name: string, filesize: number, rel_included : boolean){
            this.ws.send(JSON.stringify({'registeration': true,'bare_name':bare_name, 'rel_name':rel_name,'rel_included':rel_included , 'filesize':filesize}))
            return new Promise<boolean>((resolve)=>{
                const handler = (e:MessageEvent) => {
                    if(JSON.parse(e.data).registered){
                        this.ws.removeEventListener('message',handler)
                        resolve(true)
                    }
                }
            this.ws.addEventListener('message',handler)
            })

        }









        async take_off_safety_lock(){
            this.ws.send(JSON.stringify({'safety_lock':false}))
            return new Promise<safety_lock_data>((resolve)=>{
                const handler = (e: MessageEvent) => {
                    const data = JSON.parse(e.data)
                    if(data.safety_lock_took_off){
                        const item_data:safety_lock_data = {
                            this: data.itemdata,
                            parent: data.itemdata_parent
                        }
                        this.ws.removeEventListener('message',handler)
                        resolve(item_data)
                    }
                }
                this.ws.addEventListener('message',handler)
            })
        }



        async waitForReply(){
            return new Promise<boolean>((resolve)=>{
                const handler = (e: MessageEvent) => {
                    if(JSON.parse(e.data).received){
                        this.ws.removeEventListener('message',handler)
                        resolve(true)
                    }
                }
                this.ws.addEventListener('message',handler)
            })
        }



        async upload_file(
            target: File, 
            id: number, 
            amount: number, 
            saved_progress: React.MutableRefObject<number>, 
            total_size:number, 
        ): Promise<upload_result>{
            let offset = 0
            let perc: number|string = 0
            let update_ui: boolean = true


            const cancel_upload = () => {
                this.ws.send(JSON.stringify({'erase_upload':true}))
                set_coms(prev=>{
                    const newComs = {...prev}
                    delete newComs[operations_count]
                    return newComs
                })
                set_operations_count(c=>c-1)
                this.ws.close()
                const file_inputs = document.querySelectorAll(FILE_INPUTS_CLASSNAME)
                for(const e of file_inputs){
                    const el = e as HTMLInputElement
                    el.value = ''
                }
                uploading_ref.current = false
                update_ui = false
                window.location.reload()   

            }



            const cancel_func = () => {
                Op_confirmation_tab_context.setConfirmationData(prev=>({
                    ...prev,
                    title: 'Confirmation',
                    show_confirmation_tab: true,
                    content_msg: 'Are you sure that you want to cancel an upload?',
                    confirm_btn_className: 'op_confirmation_tab-del-btn',
                    confirm_btn_content: 'Cancel',
                    confirm_behaviour: ()=>cancel_upload(),
                }))
            }





            while(offset<target.size){
                let chunk = target.slice( offset, offset + CHUNK_SIZE)
                this.ws.send(chunk)

                
                offset += CHUNK_SIZE
                saved_progress.current += chunk.size
                perc = ((saved_progress.current / total_size) * 100).toFixed(2)

                const item_name = target.name.length > max_name_length ? target.name.slice(0, max_name_length) + '...' : target.name

                const msg = `Uploading: ${item_name} | ${id} item out of ${amount} | ${perc}%`


                if(update_ui){
                    update_ui = false
                    set_coms(prev=>({
                        ...prev,
                        [operations_count]:[msg as string, ()=>{
                            cancel_func()
                        }],
                    }))
                }

                const ops_array = document.querySelectorAll<HTMLDivElement>('.Operations_tab_record_msg')
                setTimeout(() => {
                    if(ops_array[operations_count]){
                        const msg_block = ops_array[operations_count]
                        msg_block.innerHTML = msg
                    }
                }, 50);
            
                
                await this.waitForReply()


            }


            const itemdata = await this.take_off_safety_lock()
            return {received_saved_progress: saved_progress.current, received_data: itemdata}




        }


    }



    const start_upload =  async() =>{

        if(connected.current || !UserFileList) return 
        uploading_ref.current = true



        setTimeout(() => {
            connected.current = false
        }, 120);

        connected.current = true
        const ws_url = base_ws_url+`/handle_upload/?access_token=${upload_token}`
        ws_ref.current = new WebSocket(ws_url)
        const UPLOADER_Worker_inst = new WS_UPLOAD_MANAGER_worker(ws_ref.current)
        await  UPLOADER_Worker_inst.waitForOpen()



        const files = Array.from(UserFileList)

        const file_inputs = document.querySelectorAll<HTMLInputElement>(FILE_INPUTS_CLASSNAME)
        for(const el of file_inputs){
            el.value = ''
        }

        
        if(files) set_operations_count(c=>c+1)

        const here_packsize: number =  packsize_ref.current

        for(const [id, item] of files.entries()){
            const bare_name: string = item.name
            const rel_name: string = bare_name.includes('/') ? bare_name : item.webkitRelativePath

            const filtered_bare_name: string = bare_name.includes('/') ? bare_name.split('/')[bare_name.split('/').length-1] : bare_name

            const rel_included: boolean = !!rel_name



            await UPLOADER_Worker_inst.register_file(filtered_bare_name,rel_name, item.size, rel_included)
            const {received_saved_progress, received_data} = await UPLOADER_Worker_inst.upload_file(item, id+1, files.length, saved_progress, here_packsize)
            saved_progress.current = received_saved_progress




            set_fetched_data(prev=>{
                if(!prev) return prev
                const newPrev = {...prev}
                if(received_data.this){
                    newPrev.items_ls = newPrev.items_ls.filter(item=>item.path_token !== received_data.this?.path_token)
                    newPrev.items_ls.push(received_data.this)
                }

                if(received_data.parent){
                    newPrev.items_ls = newPrev.items_ls.filter(item=>item.path_token !== received_data.parent?.path_token)
                    newPrev.items_ls.push(received_data.parent)
                }
                


                token_ls.current = {}

                for(const item of newPrev.items_ls){
                    token_ls.current[item.name] = {token: item.path_token, path: item.path}
                }
                
                newPrev.items_ls.sort((a,b)=>{
                    if(a.type=== b.type) return 0
                    if(a.type === 'dir') return -1
                    return 1
                })

                return newPrev
            })


          

            

        }


        const item_name = files[files.length-1].name.length > max_name_length ? files[files.length-1].name.slice(0, max_name_length) + '...' : files[files.length-1].name
        const msg = `Uploading: ${item_name} | ${files.length} item out of ${files.length} | ${'100.00'}%`
        
        setTimeout(() => {
            operations_tab_context.set_coms(prev=>({
                ...prev,
                [operations_tab_context.operations_count]:[msg as string, ()=>{
                }],
            }))
        }, 150);

        

        uploading_ref.current = false
        UPLOADER_Worker_inst.ws.close()
        ws_ref.current.close()
        const file_inputsx = document.querySelectorAll(FILE_INPUTS_CLASSNAME)
        for(const e of file_inputsx){
            const el = e as HTMLInputElement
            el.value = ''
        }
    
    
    }   


    useEffect(()=>{


        const ExitHandler = (e: BeforeUnloadEvent) => {
            if(uploading_ref.current){
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload',ExitHandler)
        return () => {window.removeEventListener('beforeunload', ExitHandler)}

    },[])



    useEffect(()=>{
        if(begin_upload_timeout.current) return
        begin_upload_timeout.current = true
        setTimeout(() => {
            begin_upload_timeout.current = false
        }, 150);
        start_upload()
    },[call_for_begin_upload])



    return (<></>)

}

export default Begin_upload