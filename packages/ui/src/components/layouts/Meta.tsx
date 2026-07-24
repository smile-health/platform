import React from 'react'
import Head from 'next/head'

type MetaProps = {
  title: string
  url?: string
  image?: string
  description?: string
}

const Meta: React.FC<MetaProps> = ({ title, image, url, description }) => {
  return (
    <Head>
      <meta data-rh="true" property="og:card" content="summary" />
      <meta data-rh="true" property="og:site" content="smile" />
      <meta data-rh="true" property="og:creator" content="smile" />

      <meta data-rh="true" name="title" content={title} />
      <meta data-rh="true" name="keywords" content={title} />
      <meta data-rh="true" name="news_keywords" content={title} />
      <meta data-rh="true" name="twitter:title" content={title} />
      <meta data-rh="true" property="og:title" content={title} />

      <meta data-rh="true" name="twitter:site" content="smile" />
      <meta data-rh="true" name="twitter:creator" content="smile" />
      <meta data-rh="true" property="og:site_name" content="smile" />

      {description && (
        <>
          <meta data-rh="true" name="description" content={description} />
          <meta
            data-rh="true"
            name="twitter:description"
            content={description}
          />
          <meta
            data-rh="true"
            property="og:description"
            content={description}
          />
        </>
      )}

      {image && (
        <>
          <meta data-rh="true" name="twitter:image" content={image} />
          <meta data-rh="true" property="og:image" content={image} />
          <link data-rh="true" rel="preload" as="image" href={image} />
        </>
      )}

      {url && (
        <>
          <meta data-rh="true" property="og:url" content={url} />
          <link data-rh="true" rel="canonical" href={url} />
          <link
            data-rh="true"
            rel="alternate"
            media="only screen and (max-width: 640px)"
            href={url}
          />
          <link data-rh="true" rel="amphtml" href={url} />
        </>
      )}

      <title>{title || 'Smile'}</title>
    </Head>
  )
}

export default Meta
