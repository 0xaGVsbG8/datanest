

import are_items_selected from "./are_items_selected";


type item_selectorPC_props = {
    ctrl_a_pressed: React.MutableRefObject<boolean>,
    ctrl_pressed: React.MutableRefObject<boolean>,
    toggling_mouse_ref: React.MutableRefObject<boolean>
    clicked_overall_checkbox: React.MutableRefObject<{
        clicked: boolean
        timeout_id:  ReturnType<typeof setTimeout> | null 
    }>
    block_record_selector: React.MutableRefObject<boolean>
}




export const untoggle_all_records = () => {
    document.querySelectorAll('.data-section-record:not(#fake-record)').forEach((e, index)=>{
        const el = e as HTMLDivElement
        el.classList.remove('data_section_record_selected');
        const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
        if(checkbox){checkbox.checked = false; }
    })

    const selected_records_counter = document.getElementById('data-select-option-special-selected-count') as HTMLDivElement
    if(selected_records_counter) selected_records_counter.innerHTML = String(0)
    const checkbox = document.getElementById('data-select-option-special-checkbox') as HTMLInputElement
    if(checkbox) checkbox.checked = false

}




const item_selectorPC = ({
    ctrl_a_pressed, 
    ctrl_pressed, 
    toggling_mouse_ref, 
    clicked_overall_checkbox,
    block_record_selector

}: item_selectorPC_props)=>{






    const canvas = document.getElementById('div-canvas') as HTMLDivElement
    const board = document.getElementById('data-section-records') as HTMLDivElement
    const selected_counter = document.getElementById('data-select-option-special-selected-count') as HTMLDivElement


    let public_x: number = 0
    let public_y:number = 0
    let start_x:number = 0
    let start_y:number = 0
    let restart_height: boolean = false
    let last_scroll: number = 0
    const move_by: number = 5

    let context_menu_acc: boolean = false

    let finding = false

    let first_selected_el: HTMLDivElement | null = null
    
    const anchor: {
        'top'?:number,
        'left'?:number,
        'right'?:number,
        'bottom':number} = {
            top:0,
            left:0,
            right:0,
            bottom:0
        }

    let reversed_block = false
    


    let selected_count: number = 0




    const toggle_class = (add: boolean, el: HTMLDivElement, checkbox: HTMLInputElement) => {

        if(add){
            el.classList.add('data_section_record_selected')
            checkbox.checked = true
            if(!selected_count)return
            selected_count+=1
            selected_counter.innerHTML = String(selected_count)
        }else{
            el.classList.remove('data_section_record_selected')
            checkbox.checked = false
        }
    }






    const find_belongings = () => {


        selected_count = 0

        const belongings = Array.from(document.querySelectorAll<HTMLDivElement>('.data-section-record:not(#fake-record)'))
        const canvas_rect = canvas.getBoundingClientRect()

            for(const [index, el] of belongings.entries()){
                const el_rect = el.getBoundingClientRect()
                const checkbox = document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement

                if(!reversed_block){

                    if(
                        el_rect.top >= anchor.bottom - board.scrollTop - el_rect.height
                        &&
                        el_rect.top  <= canvas.getBoundingClientRect().bottom 
                    ){
                        toggle_class(true, el as HTMLDivElement, checkbox)
                    }
                    else{
                        toggle_class(false, el as HTMLDivElement, checkbox)
                    }
                }

                else{
                    if(
                        el_rect.bottom >= canvas_rect.top 
                        &&
                        el_rect.top  <= anchor.bottom - board.scrollTop


                    ){
                        toggle_class(true, el as HTMLDivElement, checkbox)


                    }
                    else{
                        toggle_class(false, el as HTMLDivElement, checkbox)
                    }
                }
    
            }
        
            are_items_selected()

    }





    const find_canvas_size = () => {

        let here_height = 0
        let here_width = 0


        here_height = public_y - start_y
        here_width = public_x - start_x
        reversed_block = false



        if(here_width<0){
            canvas.style.left  =  `${public_x}px`
            here_width = start_x - public_x
        }



        if(anchor.bottom - board.scrollTop>board.getBoundingClientRect().top){
            canvas.style.top = `${anchor.bottom-board.scrollTop}px`
        }
      


        else{

            canvas.style.top = `${board.getBoundingClientRect().top - 2}px`
        }



        if(!restart_height){here_height = public_y -  canvas.getBoundingClientRect().top}else{here_height = 1}

        if(here_height<0 && !restart_height){
            reversed_block = true
            canvas.style.top = `${public_y + 2}px`
            here_height = Math.max((anchor.bottom - public_y - board.scrollTop),start_y - public_y + 15)

            if(canvas.getBoundingClientRect().top+here_height>board.getBoundingClientRect().bottom){
                here_height = board.getBoundingClientRect().bottom - public_y
            }
        }
    

        if(here_height>board.getBoundingClientRect().height || here_width>board.getBoundingClientRect().width){return}




        canvas.style.height = `${here_height - 2}px`
        canvas.style.width = `${here_width - 2}px` 


    }


    const find_first_selected_el = () => {
        const belongings = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)'))
        const pos_y = public_y + board.scrollTop

        anchor.bottom = pos_y
        

        for(const el of belongings){
            const el_rect = el.getBoundingClientRect()
            const el_top = el_rect.bottom + board.scrollTop
            if(el_top>pos_y){
                first_selected_el = el as HTMLDivElement
                break
            }
        }
    }



    const handle_move = (ev: TouchEvent) => {
        if(!toggling_mouse_ref.current) return

        if(finding){return}
        finding = true

        setTimeout(() => {
            finding = false
        }, 5);


        const e = ev.touches[0]

        public_x = e.clientX
        public_y  = e.clientY + window.scrollY

        const board_rect = board.getBoundingClientRect()
        if(
            public_y<board_rect.top ||
            public_x>board_rect.right ||
            public_x<board_rect.left || 
            public_y>board_rect.bottom

        ){return}


        if(public_y>=last_scroll){
        }else{
        }
        ev.preventDefault()

        board.scrollBy({ top: public_y>=last_scroll  ?  move_by : -move_by, left: 0, behavior: 'auto' });

        

        find_canvas_size()
        find_belongings()

        setTimeout(() => {
            last_scroll = public_y
        }, 70);
    }






    const handle_touch_down = (ev: TouchEvent) => {

        const e = ev.touches[0]

        const first_input = document.querySelector('#record0 label input')
        if(!first_input) return
        const first_input_rect = first_input.getBoundingClientRect()
        if(e.clientX<=first_input_rect.right+10) {
            setTimeout(() => {
            are_items_selected()
            }, 150); 
            return}

        else{
            setTimeout(() => {
                untoggle_all_records()
                are_items_selected()
            }, 140);
        }
    }
    


    const handle_mouse_down_with_contextmenu = (ev: MouseEvent) => {
            
        ev.preventDefault()
        const e = ev


        const first_input = document.querySelector('#record0 label input')
        if(!first_input) return
        const first_input_rect = first_input.getBoundingClientRect()

        if(e.clientX<=first_input_rect.right+10) {setTimeout(() => {
            are_items_selected()
        }, 150); return}

        if(block_record_selector.current) return

        if(ctrl_a_pressed.current || ctrl_pressed.current || clicked_overall_checkbox.current.clicked){return}
        toggling_mouse_ref.current = true



        start_x = e.clientX 
        start_y = e.clientY + window.scrollY



        const board_rect = board.getBoundingClientRect()

        if(
            start_y<board_rect.top ||
            start_x>board_rect.right ||
            start_x<board_rect.left ||
            start_y>board_rect.bottom
        ){
        }else{
            restart_height = true
            canvas.style.top = `${start_y}px`
            canvas.style.left = `${start_x}px`
            canvas.style.width = `${1}px`
            canvas.style.height = `${1}px`
            public_x = e.clientX
            public_y = start_y
            find_first_selected_el()
            setTimeout(() => {
                restart_height = false
            }, 110);
            canvas.style.display = 'block'

        }


        setTimeout(() => {
            if(!toggling_mouse_ref.current){
                untoggle_all_records()
                are_items_selected()
                return
            }

        }, 130);



    }



    const handle_mouse_up = () => {
        toggling_mouse_ref.current = false
        canvas.style.display = 'none'
        context_menu_acc = false
    }


    const handle_scroll = () => {
        if(!toggling_mouse_ref.current){return}
        find_canvas_size()
        find_belongings()
    }



    const handleEsc = (e:KeyboardEvent) => {
        if(e.key=='Escape'){
            untoggle_all_records()
            are_items_selected()
        }
    }


    window.addEventListener('touchstart',handle_touch_down)
    window.addEventListener('touchend',handle_mouse_up)
    window.addEventListener('touchmove', handle_move, { passive: false });
    window.addEventListener('contextmenu',handle_mouse_down_with_contextmenu)
    window.addEventListener('keydown',handleEsc)
    board.addEventListener('scroll',handle_scroll)


    return () => {
        window.removeEventListener('touchstart', handle_touch_down);
        window.removeEventListener('touchend', handle_mouse_up);
        window.removeEventListener('touchmove', handle_move);
        window.removeEventListener('contextmenu', handle_mouse_down_with_contextmenu);
        window.removeEventListener('keydown', handleEsc);
        board.removeEventListener('scroll', handle_scroll);
    }





}



export default item_selectorPC