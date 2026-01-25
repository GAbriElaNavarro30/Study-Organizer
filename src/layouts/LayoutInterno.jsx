import { HeaderInterno } from "../components/HeaderInterno"
import { Footer } from "../components/Footer"
import "../styles/layoutInicio.css";

export function LayoutInterno({ children }) {
    return (
        <>
            <HeaderInterno />
            <h1>aqui ira el menu interno del mismo color que el de footer oscuro</h1>
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   