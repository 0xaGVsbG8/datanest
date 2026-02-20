'use client'
import { redirect } from "next/navigation"
import { useEffect } from "react"

export const home_path = '/drive/home/me'

const Not_found_behaviour = () => {
    // return redirect('/drive/home/me')
    useEffect(() => {
        window.location.href = '/datanest/drive/home/me'
    }, [])

    return null
}

export default Not_found_behaviour