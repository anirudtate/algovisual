import { type AppType } from "next/dist/shared/lib/utils";
import "../styles/globals.css";
import { Roboto, Bebas_Neue } from '@next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-roboto',
})

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`${roboto.variable} ${bebas.variable} font-sans`}>
      <Component {...pageProps} />;
    </main>
  )
};

export default MyApp;
