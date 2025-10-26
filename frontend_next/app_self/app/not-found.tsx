
import { redirect } from "next/navigation"
export const home_path = '/drive/home/me'

const Not_found_behaviour = () => {
    return redirect(home_path)
}

export default Not_found_behaviour