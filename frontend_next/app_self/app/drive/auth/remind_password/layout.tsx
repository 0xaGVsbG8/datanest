import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Remind password",
  description: "Remind password password",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

    
    return (
        <>
            {children}
        </>
    )

}