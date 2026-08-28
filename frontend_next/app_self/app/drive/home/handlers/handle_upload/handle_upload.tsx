import { useEffect, useState, useRef, } from "react"
import { handle_upload_common_context } from "./handle_upload_contexts"
import Ask_for_upload_token from "./comps/ask_for_upload_token"
import Begin_upload from "./comps/WS_UPLOAD_MANAGERworker"

export const FILE_INPUTS_CLASSNAME = '.file-inputer'
export const CHUNK_SIZE = 15 * (1024*1024) //MBs

export const BLANK_FILE_NAME  = 'BLANK_1x3100012131312311sd112nnnnnnx'


type Handle_upload_comp_props = {
    path_token: string
}

 
const Handle_upload_comp = ({path_token}:Handle_upload_comp_props) => {

    const [call_ask_for_upload_token, set_call_ask_for_upload_token] = useState<number>(0)
    const [received_token, set_received_token] = useState<string | null>(null)
    const [UserFileList, setUserFileList ] = useState<File[] | null>(null)
    const [call_for_begin_upload, set_call_for_begin_upload] = useState<number>(0)
    const asked_for_token = useRef<boolean>(false)
    const packsize_ref = useRef<number>(0)


    const handle_upload_from_inputs = (e:Event) => {

        if(asked_for_token.current) return
        setTimeout(() => {
            asked_for_token.current = false
        }, 200);

        asked_for_token.current = true
        const target = e.target as HTMLInputElement;
        
        if(!target.files) return

        setUserFileList(Array.from(target.files))

        set_call_ask_for_upload_token(c=>c+1)




    }




    const CollectedFilesDragover = useRef<{path: string, file: File}[]>([])





    const traverseFileTree = async (item: any, path = ""): Promise<void> => {
        if (item.isFile) {
            const file: File = await new Promise(resolve => item.file(resolve));
            CollectedFilesDragover.current.push({ path: path + file.name, file });
        } else if (item.isDirectory) {

            
            const dirPath = path + item.name + "/";
            const blankFile = new File([], path + item.name + '/' + BLANK_FILE_NAME);
            CollectedFilesDragover.current.push({path: path + item.name + '/' + BLANK_FILE_NAME,  file: blankFile})


            const dirReader = item.createReader();
            const entries: any[] = await new Promise(resolve => dirReader.readEntries(resolve));
            for (const entry of entries) {
            await traverseFileTree(entry, dirPath);
            }
        }
    }
    





    const handle_upload_from_drag_over = async (e: DragEvent) => {
        if (asked_for_token.current) return;
        asked_for_token.current = true;

        const dt = e.dataTransfer;
        if (!dt?.items || dt.items.length === 0) return;

        const entries: any[] = Array.from(dt.items)
            .map(item => item.webkitGetAsEntry?.())
            .filter(Boolean);

        await Promise.all(entries.map(entry => traverseFileTree(entry)));

        const Filtered_FileLS: File[] = CollectedFilesDragover.current.map(item => {
            return new File([item.file], item.path, {
                type: item.file.type,
                lastModified: item.file.lastModified
            });
        });

        setUserFileList(Filtered_FileLS);
        set_call_ask_for_upload_token(c => c + 1);

        setTimeout(() => {
            asked_for_token.current = false;
            CollectedFilesDragover.current = [];
        }, 200);
    };






    useEffect(()=>{

        const handleDrop = (e:DragEvent) => {
            e.preventDefault()
            handle_upload_from_drag_over(e)
        }

        const handle_dragOver = (e:DragEvent) => {
            e.preventDefault()
        }

        window.addEventListener('drop',handleDrop)
        window.addEventListener('dragover',handle_dragOver)



        return () => {
            window.removeEventListener('drop',handleDrop)
            window.removeEventListener('dragover',handle_dragOver)
        }


    },[])





    useEffect(()=>{



        const file_inputs = document.querySelectorAll<HTMLInputElement>(`.file-inputer`)
        for(const el of file_inputs){
            el.addEventListener('change',handle_upload_from_inputs)
        }

        return () => {
            for(const el of file_inputs){
                el.removeEventListener('change',handle_upload_from_inputs)
            }
        }

    },[])


    return (
        <>
            <handle_upload_common_context.Provider value={{
                call_ask_for_upload_token,
                set_call_ask_for_upload_token,

                received_token,
                set_received_token,

                UserFileList: UserFileList ?? null,
                setUserFileList,

                call_for_begin_upload,
                set_call_for_begin_upload,

                packsize_ref
            }}>

                {call_ask_for_upload_token != 0 && UserFileList && <Ask_for_upload_token call_ask_for_upload_token={call_ask_for_upload_token} files={UserFileList} path_token={path_token}></Ask_for_upload_token>}
                {received_token !== null && <Begin_upload upload_token = {received_token} call_for_begin_upload={call_ask_for_upload_token}></Begin_upload>}
            
            </handle_upload_common_context.Provider>
        </>
    )


}



export default Handle_upload_comp