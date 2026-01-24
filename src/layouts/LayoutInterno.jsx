import { HeaderInterno } from "../components/HeaderInterno"
import { Footer } from "../components/Footer"
import "../styles/layoutInicio.css";

export function LayoutInterno({ children }) {
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