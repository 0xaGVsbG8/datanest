import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Enter the passcode",
  description: "Dashboard to manage user and data storage",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

    
    return (
        <>
            {children}
        </>
    )

}