import { Metadata } from "next"
import LayoutClient from "./layout_client"

export const metadata: Metadata = {
  title: "Dev Dashboard",
  description: "Dev dashboard to manage user and data storage",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>
}
