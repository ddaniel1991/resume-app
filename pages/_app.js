import { Barlow, Barlow_Condensed } from 'next/font/google'
import { useRevealOnScroll } from '../components/motion'
import '../styles/globals.css'

const displayFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const textFont = Barlow({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-barlow',
  display: 'swap',
})

export default function MyApp({ Component, pageProps }) {
  useRevealOnScroll()
  return (
    <div className={`site ${displayFont.variable} ${textFont.variable}`}>
      <Component {...pageProps} />
    </div>
  )
}
