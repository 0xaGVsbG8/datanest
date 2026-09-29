import { Metadata } from "next"
import { doc_title } from "@/app/site"
import Layout_client from "./layout_client"

export const metadata: Metadata = {
  title: doc_title,
  description: "Dashboard to manage user and data storage",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

    
    return (
        <>
            <Layout_client>{children}</Layout_client>
        </>
    )

}