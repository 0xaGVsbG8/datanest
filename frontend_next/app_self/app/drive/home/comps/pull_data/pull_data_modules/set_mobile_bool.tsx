
import { useEffect, useState } from "react"


const useIsMobile = () => {

    const [isMobile, set_isMobile] = useState(false);

    useEffect(()=>{

        const checkMobile = () => {
            const screen_size = window.innerWidth
            if(screen_size<968){
                set_isMobile(true)
            }else{
                set_isMobile(false)
            }
        }


        const HandleResize = () => {
            checkMobile()
        }

        checkMobile()

        window.addEventListener('resize',HandleResize)
        return () => {window.removeEventListener('resize',HandleResize)}

    },[])

    return isMobile

}

export default useIsMobile
