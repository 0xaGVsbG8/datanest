

import are_items_selected from "./are_items_selected"

const ctrl_a_listener = (ctrl_a_pressed: React.MutableRefObject<boolean>, stop_ctrl_a_listener: React.MutableRefObject<boolean>)=>{

    let ctrl_key:boolean = false
    let a_key:boolean = false


    const mouse_pos_info: {x:number, y: number} = {x:0,y:0}

    const toggle_key = (e: KeyboardEvent)=>{
       
        if(e.key == 'Control'){
            ctrl_key = true
        }
        if(e.key == 'a'){
            const inputs_array = Array.from(document.querySelectorAll('input')) as HTMLInputElement[]
            for(const input of inputs_array){
                if(document.activeElement === input){
                    return
                }
            }
            a_key = true
            e.preventDefault()


        }
        combo_toggled()
    }

    const untoggle_key = (e: KeyboardEvent)=>{
        if(e.key=='Control'){
            ctrl_key = false
            if(ctrl_a_pressed) ctrl_a_pressed.current = false
            
        }
        if(e.key == 'a'){
            a_key = false
            if(ctrl_a_pressed) ctrl_a_pressed.current = false
        }
    }

    const combo_toggled = () => {
        if(stop_ctrl_a_listener.current){return}
        setTimeout(()=>{
            if(a_key && ctrl_key){

                if(ctrl_a_pressed) ctrl_a_pressed.current = true
                document.querySelectorAll('.data-section-record:not(#fake-record)').forEach((e, index)=>{
                    const el = e as HTMLDivElement
                    el.classList.add('data_section_record_selected');
                    const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
                    if(checkbox){checkbox.checked = true}
                })
                are_items_selected()
            }
        },5)
    }

    const track_mouse = (e: MouseEvent) => {
        mouse_pos_info.x = e.clientX
        mouse_pos_info.y = e.clientY
    }


    window.addEventListener('keydown', toggle_key)
    window.addEventListener('keyup', untoggle_key)
    window.addEventListener('mousemove', track_mouse)


    return () => {
        window.removeEventListener('keydown', toggle_key)
        window.removeEventListener('keyup', untoggle_key)
        window.removeEventListener('mousemove', track_mouse)
    }

    
}



export default ctrl_a_listener