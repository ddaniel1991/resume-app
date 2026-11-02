import { Html, Head, Main, NextScript } from 'next/document'

const BOOT_SCRIPT = `document.documentElement.classList.add('js');
setTimeout(function () {
  if (!document.documentElement.classList.contains('motion-ready')) {
    document.documentElement.classList.add('reveal-all');
  }
}, 3000);`

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
