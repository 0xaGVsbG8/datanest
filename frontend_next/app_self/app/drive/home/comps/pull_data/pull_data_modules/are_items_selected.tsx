


const are_items_selected = () => {


        const OverallCheckbox = document.getElementById('data-select-option-special-checkbox') as HTMLInputElement
        const down_btn = document.getElementById('special_download_btn') as HTMLDivElement

        const del_btn = document.getElementById('rem_btn-1') as HTMLDivElement
        const del_btn_img = document.getElementById('rem_btn-1pic') as HTMLMediaElement

        const move_btn = document.querySelectorAll<HTMLElement>('#move-items-pd-btn, #move-items-pd-btn *')

        const belongings = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]
        const selected_count_info = document.getElementById('data-select-option-special-selected-count')as HTMLDivElement
        
        const el_arr = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]
        
        let selected_records: number = 0
        
        for(const [index, el] of el_arr.entries()){
            const checkbox = (document.querySelector(`#record${index} label input[type="checkbox"]`) as HTMLInputElement)
            if(checkbox.checked){selected_records+=1}
        }


        if(selected_count_info) selected_count_info.innerHTML = String(selected_records)


        if(OverallCheckbox) {
            if(selected_records==belongings.length && belongings.length!=0){OverallCheckbox.checked = true}
            else{OverallCheckbox.checked = false}
        }


        if(selected_records!=0){
            if(down_btn){
                down_btn.style.setProperty('opacity', '1', 'important')
                down_btn.style.setProperty('pointer-events', 'auto', 'important')
            }
 

            if(del_btn){
                del_btn.style.opacity = '1'
                del_btn.style.pointerEvents = 'auto'

                del_btn_img.style.setProperty('pointer-events', 'auto', 'important')
                del_btn_img.style.setProperty('opacity', '1', 'important')
            }

            if(move_btn){
                for(const el of move_btn){
                    el.style.setProperty('pointer-events', 'auto', 'important')
                    el.style.setProperty('opacity', '1', 'important')
                }
            }

        }
            
        else{
            if(OverallCheckbox) {
                OverallCheckbox.checked = false
            }
            
            if(down_btn){
                down_btn.style.setProperty('opacity', '0.6', 'important')
                down_btn.style.setProperty('pointer-events', 'none', 'important')
            }
            if(del_btn){
                del_btn.style.setProperty('pointer-events', 'none', 'important')
                del_btn.style.setProperty('opacity', '0.6', 'important')

                del_btn_img.style.setProperty('pointer-events', 'none', 'important')
                del_btn_img.style.setProperty('opacity', '0.6', 'important')
            }


            if(move_btn){
                for(const el of move_btn){
                    el.style.setProperty('pointer-events', 'none', 'important')
                    el.style.setProperty('opacity', '0.6', 'important')
                }
            }

        }




}

export default are_items_selected