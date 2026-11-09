import { Html, Head, Main, NextScript } from 'next/document'

// Lato used to be pulled in by an @import url() inside styles/style.css. Once
// Turbopack merges the app's stylesheets into one chunk that @import is no
// longer at the top of the file, and browsers ignore it -- so load it here.
export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
