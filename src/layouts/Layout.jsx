import { HeaderExt } from "../components/HeaderExt"
import { MenuExt } from "../components/MenuExt"
import { Footer } from "../components/Footer"

export function Layout({ children }) {
    return (
        <>
            <HeaderExt />
            <MenuExt />
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   