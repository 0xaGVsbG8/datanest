import "../styles/op_confirmation_tab.css"
import "../styles/Quick_action_confirmation.css"
import { createPortal } from "react-dom"
import { useEffect, useState, useContext } from "react"
import { Op_confirmation_tab_context_ }  from "../layout_contexts"
import nextConfig from "@/next.config"



const Op_confirmation_tab = () => {

    const op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)
    const portal_root = document.getElementById('portal-root')

    useEffect(()=>{
        if(op_confirmation_tab_context.confirmationData.show_confirmation_tab){
            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })
            document.querySelectorAll('#op_confirmation_tab, #op_confirmation_tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })

        }else{
            if(op_confirmation_tab_context.confirmationData.unlock_container_afterwards !== false){
                document.querySelectorAll(' .special-tab, .special-tab *').forEach((e)=>{
                        const el = e as HTMLElement
                        el.style.opacity = '1'
                        el.style.pointerEvents = 'auto'
                        el.style.userSelect = 'auto'
                })
            }else{
                document.querySelectorAll('#settings-tab ,#settings-tab *').forEach((e)=>{
                    const el = e as HTMLElement
                    el.style.opacity = '1'
                    el.style.pointerEvents = 'auto'
                    el.style.userSelect = 'auto'
                })
                

            }
    
        }

    },[op_confirmation_tab_context.confirmationData.show_confirmation_tab])


    useEffect(()=>{
    },[op_confirmation_tab_context])



    return (
        <>
            {op_confirmation_tab_context.confirmationData.show_confirmation_tab && portal_root && createPortal(<div id="quick_action_confirmation">
                <div id="quick_action_confirmation-title">{op_confirmation_tab_context.confirmationData.title}</div>
                <div id="quick_action_confirmation-content">
                    <div id='quick_action_confirmation-content-pic'><img alt='' src={`${nextConfig.assetPrefix}/assets/attention.png`}></img></div>
                    <div id='quick_action_confirmation-content-text-placeholder'><div id='quick_action_confirmation-content-text' dangerouslySetInnerHTML={{__html: op_confirmation_tab_context.confirmationData.content_msg}}></div></div>
                </div>
                <div id='quick_action_confirmation-bts-placeholder'>
                    <div id='quick_action_confirmation-bts'>
                        
                        {op_confirmation_tab_context.confirmationData.show_cancel_btn && <button id='quick_action_confirmation-bts-cancel' onClick={()=>{

                            op_confirmation_tab_context.setConfirmationData(prev=>({
                                ...prev,
                                show_confirmation_tab: false,
                                show_cancel_btn: true
                            }))

                            op_confirmation_tab_context.confirmationData.cancel_behaviour && op_confirmation_tab_context.confirmationData.cancel_behaviour()}

                        }>Cancel</button>}

                        <button id='quick_action_confirmation-bts-confirm' onClick={()=>{
                            op_confirmation_tab_context.setConfirmationData(prev=>({
                                ...prev,
                                show_confirmation_tab: false
                            }))
                            op_confirmation_tab_context.confirmationData.confirm_behaviour()
                        }}> {op_confirmation_tab_context.confirmationData.show_cancel_btn ? 'Confirm' : 'Ok'}  </button>
                    </div>
                </div>
            </div>, portal_root)}

        </>
    )

}


export default Op_confirmation_tab