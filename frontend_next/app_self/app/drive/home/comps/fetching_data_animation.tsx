
import { createPortal } from "react-dom"
import '../styles/fetching-data.css'

const Fetching_data_animation = () => {


    return (<>
        {createPortal(<div id="fetching-data-animation">
            <div id="fetching-data-animation-spin"></div>
        </div>,document.body)}
    </>)

}


export default Fetching_data_animation