import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Login form",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

    
    return (
        <>
            {children}
        </>
    )

}