import { Footer } from "../components/Footer";
import { HeaderExtO } from "../components/HeaderExtO";

export function LayoutO({ children }) {
    return (
        <>
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   