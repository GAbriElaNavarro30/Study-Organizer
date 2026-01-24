import { Footer } from "../components/Footer";
import { HeaderExtO } from "../components/HeaderExtO";

export function LayoutO({ children }) {
    return (
        <>
            <HeaderExtO />
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   