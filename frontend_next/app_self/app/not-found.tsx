
import { redirect } from "next/navigation"
export const home_path = '/drive/home/me'

const Not_found_behaviour = () => {
    return redirect('/datanest/drive/home/me')
}

export default Not_found_behaviour
