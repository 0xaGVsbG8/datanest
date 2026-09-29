
"use client";
import './style.css'
import {redirect} from 'next/navigation'
import Send_keys from './send_keys'
import { send } from 'process';
import React,{useState, useEffect, useRef} from 'react'


const View = () =>{


    const [msg,set_msg] = useState<string>('')
    const [send_keys, call_send_keys] = useState<number>(0)
    const fetching = useRef<boolean>(false)


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

    

    return (

    <>
        {send_keys != -1  && <div className="center-wrap">
            <main className="card" role="main" aria-labelledby="login-title">
                <div className="brand" aria-hidden="false">
                <div className="logo">DN</div>
                <div>
                    <h1 id="login-title">Log in panel</h1>
                    <p className="lead">Log in to continue</p>
                </div>
                </div>

                <div id="loginForm" >
                <div>
                    <label className="input-label" htmlFor="email">E-mail address</label>
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

                <div>
                    <label className="input-label" htmlFor="password">Password</label>
                    <div className="field" style={{ alignItems: "center" }}>
                    <input
                        id="password-input"
                        name="password"
                        type="password"
                        placeholder="Your password"
                        required
                        aria-required="true"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="show-pass"
                        id="togglePass"
                        aria-pressed="false"
                        aria-label="Pokaż hasło"
                    onClick={()=>{
                        const password_field = document.getElementById('password-input') as HTMLInputElement
                        if(!password_field) return
                        password_field.type == 'password' ? password_field.type = 'text' : password_field.type = 'password'
                    }}>
                        👁️
                    </button>
                    </div>
                    <div
                    id="passError"
                    className="error"
                    role="status"
                    aria-live="polite"
                    style={{ display: "none" }}
                    ></div>
                </div>

                <div className="row" style={{ marginTop: ".25rem" }}>
                    <a
                        className="small"
                        href="remind_password"
                    >
                    Forgot password?
                    </a>
                    
                    <div id="row2" className="small" style={{ marginTop: ".25rem" }}>
                        <button onClick={()=>window.open('register','_self')}>No account? Sign up!</button>
                    </div>

                </div>

                




                <div className="actions">
                    <div id='msg-bar' dangerouslySetInnerHTML={{__html: msg}}></div>
                    <button className="btn" id="submitBtn" onClick={()=>call_send_keys(c=>c+1)}>
                    Log in
                    </button>
                </div>

                <div id="result" aria-live="polite"></div>
                </div>
            </main>
        </div>}
        {send_keys ? 
            <Send_keys
                setMsg={set_msg}
                call_me={send_keys}
                call_send_keys={call_send_keys}
                fetching={fetching}
            />
        : null}
        
    </>


)

}


export default View
