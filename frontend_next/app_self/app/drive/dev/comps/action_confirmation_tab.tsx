import '../styles/Quick_action_confirmation.css'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import nextConfig from '@/next.config'


type Quick_action_confirmation_props = {
    'title':string,
    'content': String
    'set_show_quick_action_confirmation_tab': React.Dispatch<React.SetStateAction<boolean>>,
    'confirmation_action': ()=>void
}

const Quick_action_confirmation = ({
    title, 
    content, 
    set_show_quick_action_confirmation_tab, 
    confirmation_action
}:Quick_action_confirmation_props) => {

    const mounted = useRef<boolean>(false)
    const [portal_root, set_portal_root] = useState<HTMLDivElement | null>(null)



    useEffect(()=>{
        const root = document.getElementById('portal-root') as HTMLDivElement
        if(!root) return

        set_portal_root(root)


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
            if(mounted.current) {console.log('close');  unblock_cont()}
            else mounted.current = true
        }


    },[])



    return (
        <>
            {portal_root && createPortal(<div id="quick_action_confirmation">
                <div id="quick_action_confirmation-title">{title}</div>
                <div id="quick_action_confirmation-content">
                    <div id='quick_action_confirmation-content-pic'><img alt='' src={`${nextConfig.assetPrefix}/assets/attention.png`}></img></div>
                    <div id='quick_action_confirmation-content-text-placeholder'><div id='quick_action_confirmation-content-text' dangerouslySetInnerHTML={{__html: content}}></div></div>
                </div>
                <div id='quick_action_confirmation-bts-placeholder'>
                    <div id='quick_action_confirmation-bts'>
                        <button id='quick_action_confirmation-bts-cancel' onClick={()=>set_show_quick_action_confirmation_tab(false)}>Cancel</button>
                        <button id='quick_action_confirmation-bts-confirm' onClick={confirmation_action}>Confirm</button>
                    </div>
                </div>
            </div>, portal_root)}
        </>
    )


}



export default Quick_action_confirmation