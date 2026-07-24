import { Fragment } from 'react'
import { useParams } from 'next/navigation'
import { Checkbox } from '#components/checkbox'
import { FormErrorMessage } from '#components/form-control'
import Check from '#components/icons/Check'
import Warning from '#components/icons/Warning'
import { InputSearch } from '#components/input'
import { ProgramItem } from '#components/modules/ProgramItem'
import { Spinner } from '#components/spinner'
import cx from '#lib/cx'
import { ListProgramsResponse } from '#services/program'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialGlobalFormData } from '../../schema/MaterialSchemaForm'
import { IconPrograms } from '#constants/program'

type Props = {
  program_ids?: number[]
  keyword: string
  onChangeKeyword: (keyword: string) => void
  coreProgram?: ListProgramsResponse
  isLoading?: boolean
}

export default function MaterialFormProgramSelection(props: Readonly<Props>) {
  const { program_ids, keyword, coreProgram, onChangeKeyword, isLoading } =
    props
  const { t } = useTranslation('entity')
  const params = useParams()
  const id = params?.id

  const { control } = useFormContext<MaterialGlobalFormData>()

  const handleUncheck = (
    itemId: number,
    value: any,
    onChange: (...event: any[]) => void
  ) => {
    const filtered = value?.filter((val: any) => val !== itemId)
    onChange(filtered)
  }

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded">
      <div className="ui-flex ui-flex-col ui-gap-4">
        <div className="ui-font-bold">Programs</div>
        <div className="ui-rounded ui-bg-slate-100 ui-px-4 ui-py-[9px] ui-flex ui-gap-2 ui-items-center">
          <Warning />
          <p className="ui-text-xs ui-font-normal">
            {t('form.programs.description')}
          </p>
        </div>
        <InputSearch
          placeholder={t('form.programs.search')}
          defaultValue={keyword}
          onChange={(e) => onChangeKeyword(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="ui-flex ui-justify-center ui-mt-4">
          <Spinner className="ui-my-8 ui-w-5" />
        </div>
      ) : (
        <Controller
          control={control}
          name="program_ids"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="ui-grid ui-grid-cols-1 ui-gap-2 ui-mt-4">
              {coreProgram?.data?.map((item) => {
                const isChecked = value?.includes(item?.id)
                const disabled =
                  !!id && program_ids?.some((x) => x === item?.id)

                return (
                  <Fragment key={item?.id}>
                    <button
                      type="button"
                      className={cx(
                        'ui-flex ui-gap-4 ui-border ui-rounded-lg ui-p-4 ui-items-center',
                        {
                          'ui-bg-[#E2F3FC]': isChecked,
                          'ui-border-gray-300': !isChecked,
                          'ui-border-[#004990]': isChecked,
                          'ui-cursor-pointer': !disabled,
                          'ui-cursor-not-allowed': disabled,
                          'ui-border-slate-100': disabled,
                          'ui-bg-slate-100': disabled,
                        }
                      )}
                      onClick={() => {
                        if (disabled) return

                        if (!isChecked) {
                          const data = value?.concat(item?.id)
                          onChange(data)
                        } else handleUncheck(item?.id, value, onChange)
                      }}
                    >
                      {!disabled && (
                        <Checkbox
                          id={`cbx-program-${item?.key}`}
                          checked={isChecked}
                        />
                      )}
                      <ProgramItem
                        id={item?.key}
                        key={item?.id}
                        data={item}
                        disabled={disabled}
                        className={{
                          wrapper: 'ui-gap-4 ui-flex-auto',
                          title: 'ui-text-base',
                          ...(disabled && {
                            title: 'ui-text-base ui-text-left',
                          }),
                        }}
                        icon={IconPrograms[item.key]}
                      />

                      {disabled && (
                        <div className="ui-flex ui-gap-2 ui-items-center">
                          <p className="ui-text-xs ui-font-normal ui-italic ui-text-neutral-500">
                            {t('form.programs.selected')}
                          </p>
                          <Check />
                        </div>
                      )}
                    </button>
                    {error?.message && (
                      <FormErrorMessage>{error.message}</FormErrorMessage>
                    )}
                  </Fragment>
                )
              })}
            </div>
          )}
        />
      )}
    </div>
  )
}
