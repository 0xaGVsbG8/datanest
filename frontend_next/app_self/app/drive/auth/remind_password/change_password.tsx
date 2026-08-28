
import { useState, useRef, useContext, useEffect } from "react"
import { base_fetch_url } from "@/app/config"
import { user_data_context_ } from "./context"

const Change_password_view = () => {


    const pulling = useRef<boolean>(false)
    const [msg,set_msg] = useState<string>('')
    const [send_keys, call_send_keys] = useState<number>(0)
    const passcode_input1 = useRef<HTMLInputElement | null>(null)
    const passcode_input2 = useRef<HTMLInputElement | null>(null)
    const {set_user_data, user_data} = useContext(user_data_context_)
    const [changed, set_changed] = useState<boolean>(false)


    const send_fetch = async() => {

        if(user_data?.auth_token == '' || user_data?.passcode == '') return

        
        if(!passcode_input1.current ||!passcode_input2.current ) return

        if(passcode_input1.current.value == '' || passcode_input2.current.value == '') {set_msg('<span style="color:red">Passcode field cant be empty</span>'); passcode_input1.current.focus(); return}
        if(passcode_input1.current.value != passcode_input2.current.value ) {set_msg('<span style="color:red">Passcode fields values are diffrent</span>'); passcode_input1.current.focus(); return}

        if(user_data?.auth_token == '' || user_data?.passcode == '') return

        if(pulling.current) return
        pulling.current = true

        const response = await fetch(base_fetch_url+`/verify_op/?auth_token=${user_data?.auth_token}&passcode=${user_data?.passcode}&new_password=${passcode_input1.current.value}`,{
            method:'GET',
            credentials:'include',
            headers:{
                "Content-Type": "application/json",
                "protocol":"init"
            },
           
        })
        pulling.current = false
        const data = await response.json()
        if(data.password_changed) {
            passcode_input1.current.value = ''
            passcode_input2.current.value = ''
            set_user_data({auth_token:'',passcode:''})
            set_msg('<span color="green">The password was changed! You can now log in to your account!</span>')
            set_changed(true)
        }

        
    }



    useEffect(()=>{
        setTimeout(() => {
            passcode_input1.current!.focus()
        }, 300);
    },[])




    return (

    <>
        {send_keys != -1  && <div className="center-wrap">
            <main className="card" role="main" aria-labelledby="login-title">
                <div className="brand" aria-hidden="false">
                <div>
                    {!changed && <h1 id="login-title">Set a new password</h1>}
                </div>
                </div>

                <div id="loginForm" >
                

                {!changed && <div>
                    <label className="input-label" htmlFor="password">Password</label>
                    <div className="field" style={{ alignItems: "center" }}>
                    <input ref={passcode_input1}
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
                        if(!passcode_input1.current) return
                        passcode_input1.current.type == 'password' ? passcode_input1.current.type = 'text' : passcode_input1.current.type = 'password'
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

                
                {!changed && <div>
                    <label className="input-label" htmlFor="password">Re-type password</label>
                    <div className="field" style={{ alignItems: "center" }}>
                    <input ref={passcode_input2}
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
                        if(!passcode_input2.current) return
                        passcode_input2.current.type == 'password' ? passcode_input2.current.type = 'text' : passcode_input2.current.type = 'password'
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



                <div className="row" style={{ marginTop: ".25rem" }}>
                   
                    <div className="actions">
                        <div id='msg-bar' dangerouslySetInnerHTML={{__html: msg}}></div>

                    </div>
                    
                    <div id="row2" className="small" style={{ marginTop: ".25rem" }}>
                        <button onClick={()=>window.open('login','_self')}>Go back</button>
                    </div>

                    {!changed && <button className="btn" id="submitBtn" onClick={()=>send_fetch()}>
                        Change
                    </button>}

                </div>

                






                <div id="result" aria-live="polite"></div>
                </div>
            </main>
        </div>}
    </>


)














}

export default Change_password_view