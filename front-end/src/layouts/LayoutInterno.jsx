import { HeaderInterno } from "../components/HeaderInterno"
import { Footer } from "../components/Footer"
import { MenuInterno } from "../components/MenuInterno";

export function LayoutInterno({ children }) {
    return (
        <>
            <HeaderInterno />
            <MenuInterno />
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   