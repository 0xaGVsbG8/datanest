import {createContext} from 'react'

type handle_upload_common_context = {
    set_call_ask_for_upload_token: React.Dispatch<React.SetStateAction<number>>
    call_ask_for_upload_token: number

    set_received_token: React.Dispatch<React.SetStateAction<string | null>>
    received_token: string | null

    setUserFileList: React.Dispatch<React.SetStateAction<File[] | null>>
    UserFileList: File[] | null

    set_call_for_begin_upload: React.Dispatch<React.SetStateAction<number>>
    call_for_begin_upload: number

    packsize_ref: React.MutableRefObject<number>

}


export const handle_upload_common_context = createContext<handle_upload_common_context>({

    set_call_ask_for_upload_token: () => {},
    call_ask_for_upload_token: 0,

    set_received_token: () => {},
    received_token: null,

    setUserFileList: () => {},
    UserFileList: null,

    set_call_for_begin_upload: () => {},
    call_for_begin_upload: 0,

    packsize_ref: ({current:0}),


})