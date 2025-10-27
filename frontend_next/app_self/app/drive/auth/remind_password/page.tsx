
"use client";
import './style.css'
import {redirect} from 'next/navigation'
import Send_keys from './send_keys'
import { send } from 'process';
import React,{useState, useEffect, createContext} from 'react'
import Change_password_view from './change_password';
import { set_cookie } from '../../cookie_manager';
import {show_tab_props,show_tab_context_props, user_data_props, show_tab_context_, user_data_context_ } from './context'








const View = () =>{


    const [msg,set_msg] = useState<string>('')
    const [send_keys, call_send_keys] = useState<number>(0)
    const [show_tab, set_show_tab] = useState<show_tab_props>('main')
    const [user_data, set_user_data] = useState<{passcode: string,auth_token: string}>({passcode:'',auth_token:''})


    useEffect(()=>{
        const handler = () => {set_msg('')}

        document.querySelectorAll('input').forEach((e)=>{
            e.addEventListener('input',handler)
        })

        return () => {
            document.querySelectorAll('input').forEach((e)=>{
                e.removeEventListener('input',handler)
            })
        }

    },[])



    useEffect(()=>{
        setTimeout(() => {
            document.getElementById('email-input')!.focus()
        }, 300);
    },[])





    
    useEffect(()=>{console.log(show_tab)},[show_tab])

    return (

    <>
        <user_data_context_.Provider value={{user_data, set_user_data}}>
            <show_tab_context_.Provider value={{set_show_tab, show_tab}}>
                {show_tab == 'main'  && <div className="center-wrap">
                    <main className="card" role="main" aria-labelledby="login-title">
                        <div className="brand" aria-hidden="false">
                        <div>
                            <h1 id="login-title">Reset your password</h1>
                        </div>
                        </div>

                        <div id="loginForm" >
                        <div>
                            <label className="input-label" htmlFor="email">Enter e-mail address</label>
                            <div className="field">
                            <input
                                id="email-input"
                                name="email"
                                type="email"
                                placeholder="example@outlook.com"
                                required
                                aria-required="true"
                                autoComplete="email"
                            />
                            </div>
                            <div
                            id="emailError"
                            className="error"
                            role="status"
                            aria-live="polite"
                            style={{ display: "none" }}
                            ></div>
                        </div>


                        <div className="row" style={{ marginTop: ".25rem" }}>
                          
                            
                            <div id="row2" className="small" style={{ marginTop: ".25rem" }}>
                                <button onClick={()=>window.open('login','_self')}>Head back</button>
                            </div>

                        </div>

                        




                        <div className="actions">
                            <div id='msg-bar' dangerouslySetInnerHTML={{__html: msg}}></div>
                            <button className="btn" id="submitBtn" onClick={()=>call_send_keys(c=>c+1)}>
                            Send
                            </button>
                        </div>

                        <div id="result" aria-live="polite"></div>
                        </div>
                    </main>
                </div>}
                {show_tab == 'change_password_view' && <Change_password_view></Change_password_view>}
                {send_keys ? <Send_keys setMsg = {set_msg} send_keys={send_keys}></Send_keys> : null}
            </show_tab_context_.Provider>
        </user_data_context_.Provider>
    </>


)

}


export default View
