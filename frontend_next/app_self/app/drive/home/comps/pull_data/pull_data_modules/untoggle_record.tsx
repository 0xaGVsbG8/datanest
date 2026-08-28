





const untoggle_record = (ctrl_pressed: React.MutableRefObject<boolean>,) => {

    let ctrl_key: boolean = false
    const data_records_main = document.getElementById('data-section-records') as HTMLDivElement

    const down_btn = document.getElementById('special_download_btn') as HTMLDivElement
    const del_btn = document.getElementById('rem_btn-1') as HTMLDivElement
    const selected_count_info = document.getElementById('data-select-option-special-selected-count')as HTMLDivElement

    const OverallCheckbox = document.getElementById('data-select-option-special-checkbox') as HTMLInputElement


    const toggle_key = (e: KeyboardEvent) => {
        if(ctrl_key){return}
        if(e.key == 'Control'){
            ctrl_key = true
            ctrl_pressed.current = true
            const data_records = Array.from(document.querySelectorAll('.data-section-record, .data-section-record *')) as HTMLDivElement[]

            for(const el of data_records){
                el.style.pointerEvents = 'none'
            }
        }
    }

    const untoggle_key = (e: KeyboardEvent) => {
        if(e.key == 'Control'){
            ctrl_key = false
            ctrl_pressed.current = false
            const data_records = Array.from(document.querySelectorAll('.data-section-record, .data-section-record *')) as HTMLDivElement[]
            for(const el of data_records){
                el.style.pointerEvents = 'auto'
            }

        }
    }

    const mouse_down = (e: MouseEvent) => {
        e.preventDefault()
        if(ctrl_key){
            const x = e.clientX
            const y = e.clientY
            const data_records = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]
            for(const [index, el] of data_records.entries()){
                el.style.pointerEvents = 'none'
                const el_rect = el.getBoundingClientRect()
                if (
                    x >= el_rect.left &&
                    x <= el_rect.right &&
                    y >= el_rect.top &&
                    y <= el_rect.bottom
                ) {
                    const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
                    let count: number = 0
                    if(checkbox.checked){
                        el.classList.remove('data_section_record_selected');checkbox.checked = false
                        count = parseInt(selected_count_info.innerHTML) - 1
                        selected_count_info.innerHTML = String(count)
                    }
                    else{
                        el.classList.add('data_section_record_selected');
                        count = parseInt(selected_count_info.innerHTML) + 1
                        selected_count_info.innerHTML = String(count)
                        checkbox.checked = true
                    }



                    if(count==0){


                        down_btn.style.opacity = '0.6'
                        down_btn.style.pointerEvents = 'none'

                        del_btn.style.opacity = '0.6'
                        del_btn.style.pointerEvents = 'none'
                    }else{

                        down_btn.style.opacity = '1'
                        down_btn.style.pointerEvents = 'auto'

                        del_btn.style.opacity = '1'
                        del_btn.style.pointerEvents = 'auto'
                    }


                    const belongings = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]
                    let selected_count: number = 0
                    
                    for(const el of belongings){
                        if(el.classList.contains('data_section_record_selected'))selected_count+=1
                    }
                    if(selected_count==belongings.length){
                        OverallCheckbox.checked = true
                    }else{
                        OverallCheckbox.checked = false
                    }
                    
                }
                
            }
        }
    }


    window.addEventListener('keydown',toggle_key)
    window.addEventListener('keyup',untoggle_key)
    data_records_main.addEventListener('mousedown',mouse_down)


    return () => {
        window.removeEventListener('keydown',toggle_key)
        window.removeEventListener('keyup',untoggle_key)
        data_records_main.removeEventListener('mousedown',mouse_down)
    }


}


export default untoggle_record