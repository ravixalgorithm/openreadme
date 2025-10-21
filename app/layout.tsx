import Clarity from "@/components/Clarity";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Baumans } from "next/font/google";
import "./globals.css";

const inter = Baumans({
    subsets: ["latin"],
    weight: ["400"],
});

export const metadata: Metadata = {
    title: "Open Readme",
    description: "Create beautiful, on-brand README banners and grids.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    verification: {
        google: "e-76yievhM3kVEKPitYXxWAJQiazZqXkOZDANgbl-OI",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        {process.env.NODE_ENV === "production" ? <Clarity /> : null}
        <body className={inter.className}>
        <ErrorBoundary>
            <Toaster richColors />
            {children}
            <Footer />
        </ErrorBoundary>
        </body>
        </html>
    );
}

const Footer = () => {
    return (
        <footer className="w-full mb-4 ">
            <p className="text-center text-muted-foreground">
                Made with{" "}
                <span aria-label="love" role="img">
          ❤️
        </span>{" "}
                by{" "}
                <a href="/about" className="text-teal-300 hover:underline">
                    Open Dev Society
                </a>
            </p>
        </footer>
    );
}
