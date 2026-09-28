'use client'
import { useEffect, useCallback, useState, useRef, useContext } from "react"
import { app_dir_name, base_fetch_url } from "@/app/config"
import { createPortal } from "react-dom"
import '../styles/preview.css'
import { block_record_selector_context, stop_ctrl_a_listener_context_, fetched_data_context_  } from "../layout_contexts"
import { inside_action_tab_context_ } from "./show_action_tab"
import nextConfig from "@/next.config"
import { lazy_loading_support, lazy_loading_offset } from "@/next.config"



interface OpenPreviewsProps{
    record_id: number
    name: string
    real_size: number
    mimetype: string
    dispatch: any
    dispatched: number
    ls_length: number
    access_url: string
    show_close_btn: boolean
}



interface download_file_props{
    name: string
    access_url: string
}


type touch_info_props = {
    touching: boolean,
    start_x: number,
    current_x: number
    swiped: boolean
    timeout: boolean
}






const download_preview_file = ({
    name, 
    access_url
}: download_file_props)=>{
    const a = document.createElement('a')
    const url = base_fetch_url + access_url + '?nocache=y'
    a.href = url;
    a.download = name
    document.body.appendChild(a)
    a.click()
}


let global_swiped: boolean = false

type current_zoom_setting_props = {last_zoom: number, pause: boolean, behaviour: 'up' | 'down' | 'none'}
const default_current_zoom_setting = {last_zoom: 1, pause: false, behaviour: 'none' as 'none'}




const Open_preview = ({record_id, name, real_size,mimetype, access_url, dispatch, dispatched, ls_length, show_close_btn}:OpenPreviewsProps) =>{

    const [media_el, set_media_el] = useState<React.ReactNode|null>(null)
    const mounted = useRef<boolean>(false)
    const media_url = useRef<string>('')
    const exited = useRef<boolean>(false)


    const block_record_selector = useContext(block_record_selector_context)
    const stop_ctrl_a_listener_context = useContext(stop_ctrl_a_listener_context_)
    const inside_preview = useContext(inside_action_tab_context_)


    const {fetched_data} = useContext(fetched_data_context_)

    const touch_info = useRef<touch_info_props>({touching: false, start_x:-50,current_x: -50, swiped: false, timeout: false})

    const [prev_btn, set_prev_btn] = useState<HTMLButtonElement>()
    const [next_btn, set_next_btn] = useState<HTMLButtonElement>()


    const zoom_el_by_info = useRef<current_zoom_setting_props>(default_current_zoom_setting)

    const [current_zoom_setting, set_current_zoom_setting] = useState<string>('100%')


    const zoom_behaviour = () => {

        let to_zoom: number = 0
        const smallest_possible: number = 0.05
        const zoom_el_by: number = 0.20
        const el_to_zoom = document.querySelector(`#item-displayer${dispatched} .item-displayer-placeholder .item-displayer-media div *:not(pre):not(audio)`) as HTMLDivElement
        if(!el_to_zoom || mimetype.includes('text') || mimetype.includes('application')) return

        const zoom_behaviour = zoom_el_by_info.current.behaviour

        if(zoom_el_by_info.current.behaviour == 'down'){
            to_zoom = zoom_el_by_info.current.last_zoom - zoom_el_by
            if(to_zoom > smallest_possible){el_to_zoom.style.transform = `scale(${to_zoom})`}
            else{to_zoom = smallest_possible}
        }

        if(zoom_behaviour == 'up'){
            to_zoom = zoom_el_by_info.current.last_zoom + zoom_el_by
            el_to_zoom.style.transform = `scale(${to_zoom})`
        }

        let zoom_for_user: string = to_zoom.toFixed(2).replace('.','')

        if(zoom_for_user[0]=='0') zoom_for_user = zoom_for_user.slice(1)

        zoom_for_user[0] == '0' ? zoom_for_user = zoom_for_user.slice(1) : zoom_for_user

        zoom_for_user+='%'

        set_current_zoom_setting(zoom_for_user)

        zoom_el_by_info.current.last_zoom = to_zoom


    }


    const reset_zoom = () => {
        const el_to_zoom = document.querySelector(`#item-displayer${dispatched} .item-displayer-placeholder .item-displayer-media div *:not(pre):not(audio)`) as HTMLDivElement
        if(dispatched!=record_id || !el_to_zoom) return
        zoom_el_by_info.current = default_current_zoom_setting
        el_to_zoom.style.transform = 'scale(1)'
        zoom_el_by_info.current.last_zoom = 1
        set_current_zoom_setting('100%')
    }



    useEffect(()=>{

        if(dispatched!=record_id) return

        const block_wheel_behaviour = (e: WheelEvent) => {
            !mimetype.includes('text') && e.preventDefault()
            if(zoom_el_by_info.current.pause) return

            zoom_el_by_info.current.pause = true
            setTimeout(() => {
                zoom_el_by_info.current.pause = false
            }, 5);


            if(e.deltaY > 0) {
                zoom_el_by_info.current.behaviour = 'down'
            }
            else{
                zoom_el_by_info.current.behaviour = 'up'
            }

            zoom_behaviour()

        }

   

        window.addEventListener('wheel',block_wheel_behaviour, {passive: false})


        return () => {
            window.removeEventListener('wheel',block_wheel_behaviour)
            zoom_el_by_info.current = default_current_zoom_setting
            set_current_zoom_setting('100%')
            reset_zoom()
        }


    },[dispatched])








    useEffect(()=>{

        const resize_displayer = (e?: Event | null, now?: boolean) => {
            setTimeout(() => {
                if(dispatched!=record_id) return
                const item_displayer = document.querySelector(`#item-displayer${record_id} .item-displayer-media`) as HTMLDivElement
                const user_panel = document.querySelector(`#item-displayer${record_id} .item-displayer-user-panel`) as HTMLDivElement
                if(!item_displayer || !user_panel) return
                const item_displayer_rect = item_displayer.getBoundingClientRect()
                const user_panel_rect = user_panel.getBoundingClientRect()
                const new_height = user_panel_rect.top - item_displayer_rect.top
                item_displayer.style.setProperty('height',`${new_height}px`,'important')
            }, now ? 0 : 200);

        }

        resize_displayer(null, true)

        
        window.addEventListener('resize',resize_displayer)

        return () => {
            window.removeEventListener('resize',resize_displayer)
        }

    },[dispatched])




    const block_container = useCallback(()=>{


        const listener = () =>{
            if(fetched_data?.view_type=='file') return
            document.querySelectorAll('#container, #container *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.removeEventListener('click',listener)
                inside_preview.current = false
            })
            dispatch(null)
        }
        document.querySelectorAll('.item-displayer').forEach((e)=>{
            const el = e as HTMLElement
            el.style.setProperty('user-select','all','!important')
        })
        document.querySelectorAll('#container, #container * ').forEach((e)=>{
            const el = e as HTMLElement
            el.style.opacity = '0.6'
            el.addEventListener('click',listener)
            inside_preview.current = true
        })

    },[])




    const get_text_content = async(url: string) => {
        const max_bytes = 3 * (1024 * 1024)
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { Range: `bytes=0-${max_bytes - 1}` },
        })

        let content = await response.text()
        content = content.slice(0, 1500)
        if(content.length == 0){content = '...'}
        const truncated = response.status === 206 || content.length >= max_bytes
        // const truncated = response.status === 206 || content.length >= max_bytes
        set_media_el(
            <pre>
                {content}
                {truncated ? '\n\n... truncated (max 3MB preview)' : ''}
            </pre>
        )
    }







    const set_file_view = useCallback(async()=>{
        if(mounted.current){return}
        mounted.current = true
        const file_url = base_fetch_url + access_url
        media_url.current = file_url
        // return

        const url = media_url.current
        if(mimetype.includes('audio')){
            set_media_el(<audio src={url} controls></audio>)
        }

        else if(mimetype.includes('video')){
            set_media_el(<video src={url} controls ></video>)
        }

        else if(mimetype.includes('image')){
            set_media_el(<img src={url} alt="image-not-supported-by-your-webrowser, err" ></img>)
        }
        
        else if(mimetype.includes('text')&&real_size<3*(1024*1024)){
            get_text_content(url)
        }
        else{
            set_media_el(
            <div style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                flexDirection: 'column',
                backgroundColor:'transparent',
                boxShadow:'none',
            }}>
                <div style={{
                    display:'flex',
                    alignItems:'flex-end',
                    justifyContent:'center',
                    width:'100%',
                    backgroundColor:'transparent',
                boxShadow:'none',

                }}>No display, file type cant be displayed. Forcing to download a text content might crash this site.</div>
                <button style={{
                    backgroundColor:'transparent',
                    color:'aqua',
                    fontWeight:'bold',
                boxShadow:'none',


                }} onClick={()=>{mimetype='text';mounted.current = false;get_text_content(url)}}>Force read text content⚠️</button>
            </div>)
        }


    },[])


    const keep_preview_tab = useCallback(() => {
        setTimeout(() => {
            exited.current = false
            document.body.style.backgroundColor = "#181717"
        }, 1);
    },[])


    const if_to_close_preview_tab = useCallback(() => {
        exited.current = true
        setTimeout(() => {
            if(exited.current){document.getElementById('container')!.click();document.body.style.backgroundColor = "#2b2b2b"}
        }, 2);
    },[])






    useEffect(()=>{


        const handleTouchStart = (e:TouchEvent) => {
            touch_info.current.touching = true
            touch_info.current.start_x = e.touches[0].clientX
            touch_info.current.swiped = false
            touch_info.current.timeout = false

        }
        

        const handleTouchEnd = (e:TouchEvent) => {
            touch_info.current.touching = false
            global_swiped = false
        }

        const handleTouchMove = (e:TouchEvent) => {

            let block_swipe: boolean = false

            if (e.touches.length === 1) {
            }

            if(dispatched!=record_id) return


            if(mimetype.includes('text') || mimetype.includes('application')){
                const pre_area = document.querySelector('.item-displayer-media div pre')
                if(pre_area) {
                    const touch = e.touches[0]
                    const pre_area_rect = pre_area.getBoundingClientRect()
                    if(
                        touch.clientX >pre_area_rect.left 
                        &&
                        touch.clientX < pre_area_rect.left+pre_area_rect.width 
                        &&
                        touch.clientY > pre_area_rect.top 
                        &&
                        touch.clientY < pre_area_rect.top + pre_area_rect.height

                    ){
                        block_swipe = true
                        return

                    }
                }
            }


            if(!touch_info.current.touching || block_swipe) return
            if(touch_info.current.timeout) return
            if(global_swiped) return

            if(dispatched === null || record_id == -1){return}


            touch_info.current.timeout = true

            setTimeout(() => {
                touch_info.current.timeout = false
            }, 20);

            const count_as_move = 50
            const touch = e.touches[0].clientX
            const diff = touch - touch_info.current.start_x

            if(diff > count_as_move){
                global_swiped = true
                const btn = document.getElementById('next-preview-btn'+dispatched) as HTMLButtonElement
                if(btn) btn.click()
            }

            if(diff < -count_as_move){
                global_swiped = true
                const btn = document.getElementById('prev-preview-btn'+dispatched) as HTMLButtonElement
                if(btn) btn.click()
            }

        }



        
        if(dispatched !== null && record_id != -1){

            block_record_selector.current = true

            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '0.6'
                el.style.pointerEvents = 'none'
                el.style.userSelect = 'none'
            })

            

            window.addEventListener('touchstart',handleTouchStart)
            window.addEventListener('touchend',handleTouchEnd)
            window.addEventListener('touchmove', handleTouchMove, { passive: false });






            return () => {
                window.removeEventListener('touchstart',handleTouchStart)
                window.removeEventListener('touchend',handleTouchEnd)
                window.removeEventListener('touchmove',handleTouchMove)
            }




        }else{
            stop_ctrl_a_listener_context.current = false
            block_record_selector.current = false


            document.querySelectorAll('#container, #container  *, .special-tab, .special-tab *').forEach((e)=>{
                const el = e as HTMLElement
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
                el.style.userSelect = 'auto'
            })
        }
        
    },[dispatched])




    
    useEffect(()=>{
        if(!media_el){return}
        if(dispatched!=record_id && mimetype.includes('video')){
            const video = (document.querySelector(`#item-displayer${record_id} video`) as HTMLVideoElement)
            video?.pause()
        }
    },[dispatched, media_el])


    useEffect(()=>{

        let btn1: HTMLButtonElement | null = null
        for(let i = record_id + 1;i<ls_length;i++){
            btn1 = document.getElementById('preview_'+i) as HTMLButtonElement
            if(btn1) break
        }
        set_next_btn(btn1!)



        let btn2: HTMLButtonElement | null = null
        for(let i = record_id - 1;i>-1;i--){
            btn2 = document.getElementById('preview_'+i) as HTMLButtonElement
            if(btn2) break
        }
        set_prev_btn(btn2!)

    },[dispatched])



    //lazy loading support
    useEffect(()=>{

        

        // only one item preview at once
        if(lazy_loading_support===false){
            if(dispatched==record_id){
                set_file_view()
            }
            return
        }

        if(lazy_loading_support===true){

            
            const negative_diff = ( dispatched > -1 ? dispatched : 0 ) - lazy_loading_offset
            const closest_item =  negative_diff > -1 ? negative_diff : 0
            const furthest_item = ( dispatched > -1 ? dispatched : 0 ) + lazy_loading_offset

            if((record_id >= closest_item && record_id <= furthest_item) || dispatched == record_id){
                set_file_view()
            }


        }


    },[dispatched])



    return(<>
            <div className="data-item-name-item" id={'preview_'+record_id} onClick={()=>{
                block_container()
                dispatch(record_id)
                document.body.style.backgroundColor = "#181717"
            }}>📨{name}</div>

            {createPortal(
                <div className={`item-displayer`} id={`item-displayer`+record_id} style={{
                        opacity:dispatched==record_id?'1':'0',
                        userSelect:dispatched==record_id?"auto":'none',
                        pointerEvents:dispatched==record_id?"auto":'none',
                        visibility:dispatched==record_id?"visible":'hidden',
                        display:dispatched==record_id?"flex":'none',
                }}>
                    <div className="item-displayer-placeholder">
                        <div className="item-displayer-info-fake"></div>
                        <div className="item-displayer-info" onClick={()=>{
                                if_to_close_preview_tab()                                
                                }}>
                                <div className="item-displayer-name">{name}</div>
                                <div className="item-displayer-top-bts">

                                    <div>{current_zoom_setting}&nbsp;&nbsp;</div>


                                    <button className="item-displayer-down-btn" id={`item-displayer_down_btn_${record_id}`} onClick={()=>{
                                        download_preview_file({name, access_url})
                                        keep_preview_tab()
                                    }}>
                                        <img alt="" src={`${nextConfig.assetPrefix}/assets/download_icon.jpg`} id="preview-download-pic"></img>
                                    </button>



                                    {show_close_btn ? <button className="close-preview-btn" onClick={()=>document.getElementById('container')?.click()}>❌</button>: <button onClick={()=>window.open(`/${app_dir_name}/home/me`,'_self')}>Head home</button>}
                                </div>

                            </div>

                            <div className="item-displayer-media" onClick={()=>{
                                if_to_close_preview_tab()
                                }}>
                                <div onClick= {()=>{
                                    keep_preview_tab()
                                }} 
                                style={{
                                    display:'flex',
                                    alignItems:'center',
                                    justifyContent:'center'
                                }}>{media_el}

                                </div>
                            </div>
                    </div>
                    <div className="item-displayer-user-panel">

                        <button  className="preview-nav-btn" style={{opacity: prev_btn?'1':'0.3', pointerEvents: prev_btn?'auto':'none'}} id={"prev-preview-btn"+record_id}  onClick={()=>{
                            prev_btn?.click()
                        }}>
                        {/* ⬅️ */}
                            <img alt="" className="nav-preview-pic" src={`${nextConfig.assetPrefix}/assets/left.png`}></img>
                        </button>


                        <button onClick={()=>{
                            const el_to_zoom = document.querySelector(`#item-displayer${dispatched} .item-displayer-placeholder .item-displayer-media div *:not(pre)`) as HTMLDivElement
                            if(dispatched!=record_id || !el_to_zoom) return
                            zoom_el_by_info.current.behaviour = 'down'
                            zoom_behaviour()
                        }} title="zoom_out button">
                            <img alt="zoom_out" src={`${nextConfig.assetPrefix}/assets/zoom_out.png`}></img>
                        </button>


                        <button onClick={()=>reset_zoom()}>Reset</button>


                        <button onClick={()=>{
                            const el_to_zoom = document.querySelector(`#item-displayer${dispatched} .item-displayer-placeholder .item-displayer-media div *:not(pre)`) as HTMLDivElement
                            if(dispatched!=record_id || !el_to_zoom) return
                            zoom_el_by_info.current.behaviour = 'up'
                            zoom_behaviour()
                        }} title="zoom-in button">
                            <img alt="zoom_in" src={`${nextConfig.assetPrefix}/assets/zoom_in.png`}></img>
                        </button>


                        <button className="preview-nav-btn" style={{opacity: next_btn?'1':'0.3', pointerEvents: next_btn?'auto':'none'}}  id={"next-preview-btn"+record_id}  onClick={()=>{
                            next_btn?.click()
                        }}>
                            {/* ➡️ */}
                            <img alt="" className="nav-preview-pic" src={`${nextConfig.assetPrefix}/assets/right.png`}></img>
                        </button>
                    </div>
                </div>,document.body)
            }


            

        </>
    
    )

}



export default Open_preview
export {download_preview_file}