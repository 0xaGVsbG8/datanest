import { useRef, useCallback, useEffect, useContext } from "react"
import { set_repull_data_context_ } from '../layout_contexts'


type Finder_props = {
    type: 'normal' | 'whole' | 'hold'
}


const Finder = ({type = 'normal'}: Finder_props) => {


    const input_value_ref = useRef<string>('')
    const {set_search_type, set_repull_data, set_search_input} = useContext(set_repull_data_context_)


    const search_for = useCallback(()=>{
        const user_input = input_value_ref.current.trim().normalize().replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')  as string
        const records = Array.from(document.querySelectorAll('.data-section-record:not(#fake-record)')) as HTMLDivElement[]

        for(const record of records){
            const name_el = record.querySelector('.data-item-name-item')
            const item_name = (name_el?.textContent ?? '').trim().normalize().replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
            record.style.display = item_name.startsWith(user_input) ? 'flex' : 'none'
        }
    },[])



    useEffect(()=>{ 

        if(type=='normal') return

        const handler = (e:KeyboardEvent) => {
            if(e.key=='Enter'){
                set_repull_data(c=>c+1)
            }
        }

        const finder = document.getElementById('finder') as HTMLInputElement
        if(!finder) return

        finder.addEventListener('keydown',handler)
        setTimeout(() => {
            finder.focus()
        }, 50);

        return () => {
            finder.removeEventListener('keydown',handler)
        }   


    })


    useEffect(()=>{
        if(type=='whole'){
            set_search_type('whole')
        }
        if(type=='normal'){
            set_search_type('normal')
        }
    },[type])
    



    
    return (
        <>
            {type == 'normal' && <input id="finder" placeholder="Look for an item in here" onChange={(event: React.ChangeEvent<HTMLInputElement>)=>{input_value_ref.current = event.target.value;search_for()}}></input>}
            {type == 'whole' && <input id="finder" placeholder="Look for an item in the entire disk" onChange={(event: React.ChangeEvent<HTMLInputElement>)=>{set_search_input(event.target.value)}}></input>}
        </>
    )

}


export default Finder