import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Питание Москва — доставка обедов', description: 'Четыре блюда на ваш вкус. Соберите комплексный обед — привезём завтра с 12:00 до 13:00 бесплатно.', icons: {icon:'/favicon.svg'} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru"><body>{children}</body></html>}
