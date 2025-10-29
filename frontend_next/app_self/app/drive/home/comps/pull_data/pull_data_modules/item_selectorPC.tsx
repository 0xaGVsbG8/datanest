


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
    inside_preview: React.MutableRefObject<boolean>
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
    block_record_selector,
    inside_preview
}: item_selectorPC_props)=>{





    const canvas = document.getElementById('div-canvas') as HTMLDivElement
    const board = document.getElementById('data-section-records') as HTMLDivElement
    const selected_counter = document.getElementById('data-select-option-special-selected-count') as HTMLDivElement


    let public_x: number = 0
    let public_y:number = 0
    let start_x:number = 0
    let start_y:number = 0
    let restart_height: boolean = false

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



    const handle_move = (e: MouseEvent) => {
        if(!toggling_mouse_ref.current) return

        if(finding){return}
        finding = true

        setTimeout(() => {
            finding = false
        }, 5);


        public_x = e.clientX
        public_y  = e.clientY + window.scrollY

        const board_rect = board.getBoundingClientRect()
        if(
            public_y<board_rect.top ||
            public_x>board_rect.right ||
            public_x<board_rect.left || 
            public_y>board_rect.bottom

        ){return}
        
        find_canvas_size()
        find_belongings()
    }

    
    const handle_mouse_down = (e: MouseEvent) => {
      
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

        }






        setTimeout(() => {
            if(!toggling_mouse_ref.current){
                untoggle_all_records()
                are_items_selected()
                return
            }else{
                canvas.style.display = 'block'
            }

        }, 130);



    }



    const handle_mouse_up = () => {
        toggling_mouse_ref.current = false

        canvas.style.display = 'none'
    }


    const handle_scroll = () => {
        if(!toggling_mouse_ref.current){return}
        find_canvas_size()
        find_belongings()
    }


    const handleContextMenu = (e:MouseEvent) => {


        if(window.innerWidth<900) return
        
        e.preventDefault()
        if(inside_preview.current) return

        const x = e.clientX
        const y = e.clientY

        const data_section = document.getElementById('data-section') as HTMLDivElement
        const data_section_rect = data_section.getBoundingClientRect()


        if( x < data_section_rect.left || x > data_section_rect.right || y > data_section_rect.top + data_section_rect.height ) return

        const el_array = document.querySelectorAll<HTMLDivElement>('.data-section-record')
        for(const [index, el] of el_array.entries()){
            const el_rect = el.getBoundingClientRect()
            if(el_rect.top<y && el_rect.bottom>y){
                const expand_action_tab_btn = document.querySelector(`#action_tab_show_btn${index-1}`) as HTMLDivElement
                if(expand_action_tab_btn) expand_action_tab_btn.click()
            }
        }
    }

    const handleEsc = (e:KeyboardEvent) => {
        if(e.key=='Escape'){
            untoggle_all_records()
            are_items_selected()
        }
    }


    board.addEventListener('mousedown',handle_mouse_down)
    window.addEventListener('mouseup',handle_mouse_up)
    window.addEventListener('mousemove',handle_move)
    window.addEventListener('contextmenu',handleContextMenu)
    window.addEventListener('keydown',handleEsc)
    board.addEventListener('scroll',handle_scroll)


    return () => {
        board.removeEventListener('mousedown',handle_mouse_down)
        window.removeEventListener('mouseup',handle_mouse_up)
        window.removeEventListener('mousemove',handle_move)
        window.removeEventListener('contextmenu',handleContextMenu)
        window.removeEventListener('keydown',handleEsc)
        board.removeEventListener('scroll',handle_scroll)
    }





}



export default item_selectorPC