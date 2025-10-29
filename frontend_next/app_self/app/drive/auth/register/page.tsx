
"use client";
import './style.css'
import {redirect} from 'next/navigation'
import Send_keys from './send_keys'
import { send } from 'process';
import React,{useState, useEffect, useRef} from 'react'
import { manage_register_widgets_context_, manage_register_widgets_allowed_states } from './context';





const View = () =>{

    

    const [msg,set_msg] = useState<string>('')
    const [send_keys, call_send_keys] = useState<number>(0)
    const [show_manage_register_widgets, set_show_manage_register_widgets] = useState<manage_register_widgets_allowed_states>('show whole widget')
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
        <manage_register_widgets_context_.Provider value={{set_show_manage_register_widgets, show_manage_register_widgets, set_register_msg : set_msg}}>
            {(show_manage_register_widgets === 'show whole widget' || show_manage_register_widgets === 'show partial'  ) && <div className="center-wrap">
                <main className="card" role="main" aria-labelledby="login-title">
                    <div className="brand" aria-hidden="false">
                    {show_manage_register_widgets === 'show whole widget' && <div className="logo">DN</div>}
                    <div>
                        {show_manage_register_widgets === 'show whole widget' &&
                            <>
                                <h1 id="login-title">Register panel</h1>
                                <p className="lead">Make an account</p>
                            </>
                        }

                    </div>
                    </div>
                    
                    <div id="loginForm">
                        {show_manage_register_widgets === 'show whole widget' && <div>
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
                        </div>}

                        {show_manage_register_widgets === 'show whole widget' && <div>
                            <label className="input-label" htmlFor="password">Password</label>
                            <div className="field" style={{ alignItems: "center" }}>
                            <input
                                id="password-input1"
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
                                const password_field = document.getElementById('password-input1') as HTMLInputElement
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
                        </div>}




                    {show_manage_register_widgets === 'show whole widget' &&  <div>
                        <label className="input-label" htmlFor="password">Re-type password</label>
                        <div className="field" style={{ alignItems: "center" }}>
                        <input
                            id="password-input2"
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
                            const password_field = document.getElementById('password-input2') as HTMLInputElement
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
                    </div>}





                    {show_manage_register_widgets === 'show whole widget' &&  <div className="row" style={{ marginTop: ".25rem" }}>
                        <div id="row2" className="small" style={{ marginTop: ".25rem" }}>
                            <button onClick={()=>window.open('login','_self')}>Already registered? Sign in!</button>
                        </div>
                    </div>}

                    




                    <div className="actions">
                        <div id='msg-bar' dangerouslySetInnerHTML={{__html: msg}}></div>
                        {show_manage_register_widgets === 'show whole widget'  ? <button className="btn" id="submitBtn" onClick={()=>call_send_keys(c=>c+1)}>Register</button> : <button className="btn" style={{transform: 'scale(0.8)'}} id="submitBtn" onClick={()=>window.open('login','_self')}>Head back</button>}
                    </div>

                    <div id="result" aria-live="polite"></div>
                    </div>
                </main>
            </div>}

            {send_keys ? 
                <Send_keys 
                    setMsg = {set_msg} 
                    fetching={fetching} 
                    send_keys={send_keys}>
                </Send_keys>
            :null}
            
        </manage_register_widgets_context_.Provider>
    </>


)

}


export default View
