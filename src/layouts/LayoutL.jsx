import { Footer } from "../components/Footer"

export function LayoutL({ children }) {
    return (
        <>
                <main>
                    {children}
                </main>
            <Footer />
        </>
    )
}   