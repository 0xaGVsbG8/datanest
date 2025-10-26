import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign up",
  description: "Register form",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

    
    return (
        <>
            {children}
        </>
    )

}