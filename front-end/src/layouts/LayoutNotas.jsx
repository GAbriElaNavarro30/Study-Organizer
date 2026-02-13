import { HeaderInterno } from "../components/HeaderInterno"
import { Footer } from "../components/Footer"

export function LayoutNotas ({ children }) {
    return (
        <>
            <HeaderInterno />
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   