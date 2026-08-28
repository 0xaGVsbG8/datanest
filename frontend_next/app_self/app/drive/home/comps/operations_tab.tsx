'use client'
import { useEffect, useState, useContext, useCallback } from 'react'
import { operations_tab_context_, Op_confirmation_tab_context_ } from '../layout_contexts' 
import {  operations_tab_props } from '../../types'
import '../styles/operations_tab.css'
import nextConfig from '@/next.config'







const Operations_tab = ({ coms, operations_count }: operations_tab_props) => {


    const operations_tab_context = useContext(operations_tab_context_)

    const Op_confirmation_tab_context = useContext(Op_confirmation_tab_context_)

    
    const [expand_hide_bar, set_expand_hide_bar] = useState<boolean>(true)

    const [isMobile, set_isMobile] = useState<boolean>(false)




    useEffect(()=>{

        const HandleResize = () => {
            const screen_size = window.innerWidth
            if(screen_size<968){
                set_isMobile(true)
            }else{
                set_isMobile(false)
            }
        }   

        HandleResize()


        window.addEventListener('resize',HandleResize)
        return () => {window.removeEventListener('resize',HandleResize)}

    },[])




    const cancel_all = useCallback(() => {

        Op_confirmation_tab_context.setConfirmationData(prev=>({
            ...prev,
            title: 'Confirmation',
            show_confirmation_tab: true,
            content_msg: 'Are you sure that you want to cancel all the operations and marked the finished ones as completed?',
            confirm_btn_className: 'op_confirmation_tab-del-btn',
            confirm_btn_content: 'Yes',
            confirm_behaviour: ()=>window.location.reload(),
        }))

    },[coms])



    return (
        <>
            {Object.entries(coms).length> 0 && (<div id="operations-tab" className='special-tab' style={{
                width: !isMobile ? (expand_hide_bar ? '50%' : '15%') : expand_hide_bar?'100%':'40%',
            }}>
                <div id="operations-tab-title">
                    <div>
                        {expand_hide_bar ? <>{operations_count} operations</>: 'OPs'}
                    </div>
                    
                    <div id='operations-tab-title-btn-div'>
                        <button onClick={()=>{
                            set_expand_hide_bar(c=>!c)
                        }}>
                            {expand_hide_bar ? '⬇️' : '⬅️'}
                        </button>   


                        <button onClick={()=>{
                            cancel_all()
                        }}>❌</button>
                    </div>
                </div>

                <div id="operations-tab-content" style={{
                    visibility: expand_hide_bar ? 'visible' : 'hidden',
                    height: expand_hide_bar ? 'auto' : '0px',
                }}>

                {Object.entries(coms).map(([key, value], index)=>(
                        
                        <div id='operations_tab_record-placeholder' key={index} style={{
                            // height: expand_hide_bar ? '2.5rem': '0px',
                            borderBottom: expand_hide_bar ? 'gray 2px solid': 'none'
                        }}>

                        {expand_hide_bar ? <div className="operations_tab_record" >
                            
                                <div className="Operations_tab_record_msg">{value[0]}</div>
                                <div className="Operations_tab_record_action" onClick={()=>{
                                    if(!value[0].includes('100.00%')){
                                        value[1]()
                                    }else{
                                        operations_tab_context.set_operations_count(c=>c-1)
                                        operations_tab_context.set_coms(prev=>{
                                            console.log('before delete:', prev);
                                            console.log(prev, 'd?')
                                            const newComs = {...prev}
                                            delete newComs[Number(key)]
                                            return newComs
                                        })
                                    }
                                }
                                }>
                                    {value[0].includes ('100.00%') ? <a><img src={`${nextConfig.assetPrefix}/assets/complete.png`} alt=''></img></a> : '❌'}

                                </div>
                            </div> 
                            : null}
                            
                        </div>
                ))}
                </div>
            </div>)}
        </>
    )
}


export default Operations_tab