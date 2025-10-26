'use client'
import { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { token_choice_context_ } from './move_items'
import '../styles/quick_path.css'
import { fetched_data_context_ } from '../layout_contexts'
import nextConfig from '@/next.config'


type quick_path_props = {
    special_id: number | null
}


const Quick_path = ({ special_id = null}:quick_path_props) => {


    const [show_paths_ls, set_show_paths_ls ] = useState<boolean>(special_id==1?false:true)
    const router = useRouter()
    const token_choice_context = useContext(token_choice_context_)

    const {fetched_data, set_fetched_data} = useContext(fetched_data_context_)

    const hideOnTheNextClick = useRef<boolean>(false)



    const redirect = useCallback((path: string, token: string)=>{
        if(special_id == 1){
            set_fetched_data(null);
            const url = `/drive/home/browse/${token}`
            router.push(url)
        }
        else{
            const els = Array.from(document.querySelectorAll('.cross-paths-ls-record')) as HTMLDivElement[]
            for(const el of els){
                if(el.innerHTML == path){el.classList.add('cross-path-record-selected')}
                else{el.classList.remove('cross-path-record-selected')}
            }
            token_choice_context.set_selected_Token(token)
        }
    },[])

    useEffect(()=>{
        const el = document.getElementById('arrow-btn')
        if(fetched_data?.tree_ls){
            if(!el) return
            if(fetched_data.tree_ls.length == 0){
                setTimeout(() => {
                    el.setAttribute("style", "opacity: 0.6 !important; pointer-events: none; user-select: auto;")
                }, 10);
            }else{
                setTimeout(() => {
                    el.setAttribute("style", "opacity: 1 !important; pointer-events: auto; user-select: auto;")
                }, 10);
            }

        }

    },[ fetched_data])


    useEffect(()=>{

        const Handler = () => {
            if(!hideOnTheNextClick.current) return
            set_show_paths_ls(false)
            setTimeout(() => {
                hideOnTheNextClick.current = false
            }, 130);
        }

        window.addEventListener('pointerdown',Handler)

        return () => {
            window.removeEventListener('pointerdown',Handler)
        }

    },[])


    return(
        <>
            {fetched_data?.tree_ls && <div  className="cross-paths special-tab" id = {'cross-paths'+special_id}>
                <div id='cross-paths-main'  onPointerDown={()=>{
                    set_show_paths_ls(c=>!c);
                    setTimeout(() => {
                        hideOnTheNextClick.current = true
                    }, 100);

                    }}>
                    <div id='cross-paths-name'>{fetched_data?.current_dir}</div>
                    <div>
                        {fetched_data?.tree_ls.length > 1 &&<img alt='' src={`${nextConfig.assetPrefix}/assets/expand-arrow.png`} id='arrow-btn' style={{
                        }}></img>}

                    </div>
                </div>

                {true && <div id='cross-paths-ls'>
                    {fetched_data?.tree_ls.map((key,index)=>(
                        <div className='cross-paths-ls-record' key={index} onPointerDown={()=>{redirect(key.path, key.token)}}  style={{
                        height: show_paths_ls ? '2rem' : '0rem',
                        border: show_paths_ls ? 'white 1px solid' : 'none',
                }}>{key.path}</div>
                    ))}
                </div>}
            </div>}
        </>
    )


}

export default Quick_path