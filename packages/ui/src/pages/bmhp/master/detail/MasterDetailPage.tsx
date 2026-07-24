import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { Skeleton } from '#components/skeleton'
import useSmileRouter from '#hooks/useSmileRouter'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  DetailListField,
  DetailSection,
  DetailSectionProps,
} from './components/DetailSection'

export interface MasterDetailActionButton {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'solid' | 'outline' | 'subtle' | 'light' | 'default'
  color?: 'primary' | 'danger' | 'success' | 'warning'
  loading?: boolean
  disabled?: boolean
  id?: string
}

export interface MasterDetailPageProps {
  /** Page title displayed in the header */
  title: string
  /** Optional subtitle */
  subTitle?: string
  /** Back button configuration */
  backPath?: string
  /** Sections to display - each section has a title and fields */
  sections: DetailSectionProps[]
  /** Loading state */
  isLoading?: boolean
  /** Action buttons (edit, delete, etc.) */
  actionButtons?: MasterDetailActionButton[]
  /** Custom content to render after sections */
  children?: React.ReactNode
}

const MasterDetailPage: React.FC<MasterDetailPageProps> = ({
  title,
  subTitle,
  backPath,
  sections,
  isLoading = false,
  actionButtons,
  children,
}) => {
  const { t } = useTranslation(['common'])
  const router = useSmileRouter()

  return (
    <Container
      title={title}
      subTitle={subTitle}
      withLayout
      backButton={
        backPath
          ? {
              show: true,
              label: t('back_to_list'),
              onClick: () => router.push(backPath),
            }
          : undefined
      }
    >
      <Meta title={generateMetaTitle(title)} />
      <div className="ui-space-y-6">
        {/* Action Buttons */}
        {actionButtons && actionButtons.length > 0 && (
          <div className="ui-flex ui-justify-end ui-gap-3">
            {actionButtons.map((button, index) => {
              const ButtonContent = (
                <Button
                  key={index}
                  id={button.id}
                  data-testid={button.id}
                  variant={button.variant || 'outline'}
                  color={button.color || 'primary'}
                  loading={button.loading}
                  disabled={button.disabled}
                  onClick={button.href ? undefined : button.onClick}
                  className="ui-min-w-28"
                >
                  {button.label}
                </Button>
              )

              if (button.href) {
                return (
                  <Link
                    key={index}
                    href={router.getAsLink(button.href)}
                    className="ui-block"
                  >
                    {ButtonContent}
                  </Link>
                )
              }

              return ButtonContent
            })}
          </div>
        )}

        {/* Sections */}
        {isLoading ? (
          <MasterDetailSkeleton sectionsCount={sections.length || 1} />
        ) : (
          sections.map((section, index) => (
            <DetailSection key={section.id || index} {...section} />
          ))
        )}

        {/* Custom Content */}
        {children}
      </div>
    </Container>
  )
}

interface MasterDetailSkeletonProps {
  sectionsCount: number
}

const MasterDetailSkeleton: React.FC<MasterDetailSkeletonProps> = ({
  sectionsCount,
}) => {
  return (
    <>
      {Array.from({ length: sectionsCount }).map((_, index) => (
        <div
          key={index}
          className="ui-border ui-border-neutral-300 ui-rounded ui-p-4 ui-space-y-4"
        >
          <Skeleton className="ui-h-6 ui-w-48" />
          <div className="ui-space-y-3">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <div
                key={fieldIndex}
                className="ui-grid ui-grid-cols-[200px_1fr] ui-gap-4"
              >
                <Skeleton className="ui-h-5 ui-w-32" />
                <Skeleton className="ui-h-5 ui-w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default MasterDetailPage
export type { DetailListField }
