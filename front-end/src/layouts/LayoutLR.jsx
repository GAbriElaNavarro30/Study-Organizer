import { HeaderExtR } from "../components/HeaderExtR"
import { Footer } from "../components/Footer"

export function LayoutLR({ children }) {
    return (
        <>
            <HeaderExtR />
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   