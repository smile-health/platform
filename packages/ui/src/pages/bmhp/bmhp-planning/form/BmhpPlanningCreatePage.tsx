'use client'

import React from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
// import { queryClient } from '#provider/query-client'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createBmhpPlanningYear } from '../services/bmhp-planning.services'
import BmhpPlanningForm from './components/BmhpPlanningForm'
import { bmhpPlanningFormValidation } from './libs/bmhp-planning-form.validation'

type FormValues = {
  year: {
    label?: string
    value: number
  }
}

const BmhpPlanningCreatePage: React.FC = () => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])
  const router = useSmileRouter()
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(bmhpPlanningFormValidation(t)),
    defaultValues: {
      year: undefined,
    },
  })

  const createMutation = useMutation({
    mutationFn: createBmhpPlanningYear,
    onSuccess: async () => {
      toast.success({ title: t('bmhpPlanning:message.create_success') })
      await queryClient.invalidateQueries({ queryKey: ['bmhp-planning-years'] })
      router.push('/v5/bmhp-planning')
    },
    onError: (error: any) => {
      toast.danger({
        title:
          error?.response?.data?.message || t('common:message.failed.create'),
      })
    },
  })

  const onSubmit = (data: FormValues) => {
    // If your API expects just the year number, extract it here
    createMutation.mutate({ year: data.year.value })
  }

  return (
    <Container title={t('bmhpPlanning:add_year')} withLayout>
      <Meta title={`SMILE | ${t('bmhpPlanning:add_year')}`} />
      <div className="ui-max-w-2xl ui-mx-auto ui-mt-6">
        <div className="ui-bg-white ui-rounded-lg ui-border ui-border-[#d2d2d2] ui-p-6">
          <h3 className="ui-text-lg ui-font-semibold ui-mb-6">
            {t('bmhpPlanning:add_year')}
          </h3>
          <BmhpPlanningForm control={control} errors={errors} />
        </div>
        <div className="ui-flex ui-gap-3 ui-justify-end ui-mt-6">
          <Button
            type="button"
            variant="outline"
            className="ui-w-40"
            onClick={() => router.back()}
          >
            {t('common:back')}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="ui-w-40"
            onClick={handleSubmit(onSubmit)}
          >
            {createMutation.isPending
              ? t('common:notification.loading')
              : t('common:submit')}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default BmhpPlanningCreatePage
