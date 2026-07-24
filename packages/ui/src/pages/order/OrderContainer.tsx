import { PropsWithChildren } from 'react'
import Meta from '#components/layouts/Meta'
import Container, { ContainerProps } from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

type OrderContainerProps = PropsWithChildren & {
  metaTitle: string
  title: React.ReactNode
  backButton?: ContainerProps['backButton']
}

export default function OrderContainer({
  title,
  children,
  metaTitle,
  backButton,
}: OrderContainerProps) {
  const router = useSmileRouter()
  const { t } = useTranslation('order')

  const handleClick = () => {
    if (backButton?.onClick) {
      backButton?.onClick()
    } else if (document.referrer && document.referrer.includes(router.asPath)) {
      router.nextRouter(document.referrer)
    } else {
      router.push('/v5/order/vendor')
    }
  }

  return (
    <Container
      title={title}
      withLayout
      backButton={{ label: t('back'), onClick: handleClick, ...backButton }}
    >
      <Meta title={generateMetaTitle(metaTitle)} />
      <div className="ui-mt-6">{children}</div>
    </Container>
  )
}
