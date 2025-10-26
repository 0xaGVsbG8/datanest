'use client'
import './style.css'
import { useState, useRef, useEffect } from 'react'
import Send_keys from './send_keys'

type Passcode_props = {
    type: 'login' | 'register'
    auth_token: string
}



const Enter_passcode = ({auth_token}: Passcode_props) => {

    const [msg, set_msg] = useState<string>('')
    const [send_keys, call_send_keys] = useState<number>(0)
    const passcode_input = useRef<HTMLInputElement | null>(null)

    useEffect(()=>{
        setTimeout(() => {
            passcode_input.current!.focus()
        }, 300);
    },[])



    useEffect(()=>{
        document.title='Enter a passcode'
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
        <div className="center-wrap">
            <main className="card" role="main" aria-labelledby="login-title">
                <div className="brand" aria-hidden="false">
                </div>

                <div id="loginForm" >
                <div>
                    <label className="input-label" htmlFor="email">Enter a passode sent on your email</label>
                    <br></br>
                    <div className="field">
                    <input ref={passcode_input} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
                        const value = e.target.value;
                        const sanitized = value.replace(/\D/g, "").slice(0, 6);
                        e.target.value = sanitized
                    }}
                        id="email-input"
                        name="number"
                        type="number"
                        placeholder="123456"
                        required
                        aria-required="true"
                        autoComplete="email"
                        max={6}
                        inputMode="numeric"
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

        
                <div id="row2" className="small" style={{ marginTop: ".25rem" }}>
                    <button onClick={()=>window.open('login','_self')}>Go back to the login site</button>
                </div>




                <div className="actions">
                    <div id='msg-bar' dangerouslySetInnerHTML={{__html: msg}}></div>
                    <button className="btn" id="submitBtn" onClick={()=>{call_send_keys(c=>c+1)}}>
                    Send
                    </button>
                </div>

                <div id="result" aria-live="polite"></div>
                </div>
            </main>

            {send_keys!=0 && passcode_input.current && 
                <Send_keys 
                    auth_token = {auth_token} 
                    passcode = {passcode_input.current?.value} 
                    call_me={send_keys}  
                    set_msg = {set_msg}
                ></Send_keys>
            }

        </div>
    )

}

export default Enter_passcode