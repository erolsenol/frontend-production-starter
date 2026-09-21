import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "Minimal Starter Example", description: "The simplest Frontend Production Starter example" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
