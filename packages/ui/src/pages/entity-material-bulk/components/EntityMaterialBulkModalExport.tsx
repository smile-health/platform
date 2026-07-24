import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as yup from 'yup'
import { AxiosError } from "axios"
import { FormProvider, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import { toast } from "#components/toast"
import { templateEntityMaterialBulk, TemplateEntityMaterialBulkParams } from "#services/entity-material-bulk"
import { formSchema } from "../schema/EntityMaterialBulkSchemaForm"
import { Dialog, DialogCloseButton, DialogContent, DialogFooter, DialogHeader } from "#components/dialog"
import { Button } from "#components/button"
import { useTranslation } from "react-i18next"

import EntityMaterialBulkFormEntity from "./EntityMaterialBulkFormEntity"
import EntityMaterialBulkFormMaterial from "./EntityMaterialBulkFormMaterial"
import Download from "#components/icons/Download"
import Warning from "#components/icons/Warning"
import { useEffect, useMemo } from "react"
import { getProgramStorage } from "#utils/storage/program"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"

type FilterFormData = yup.InferType<typeof formSchema>

type Props = {
  open: boolean
  setOpen: (flag: boolean) => void
}

const EntityMaterialBulkModalExport: React.FC<Props> = (props) => {
  const { open, setOpen } = props
  const { t } = useTranslation(['common', 'entityMaterialBulk'])
  const queryClient = useQueryClient();
  const methods = useForm<FilterFormData>({
    resolver: yupResolver(formSchema),
  })
  const workspaceStorage = getProgramStorage()
  const isMaterialHierarchy = useMemo(() => workspaceStorage?.config?.material?.is_hierarchy_enabled || false, [workspaceStorage])

  const handleReset = () => {
    methods.reset()
    queryClient.removeQueries({ queryKey: ['entities', 'materials'] })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FilterFormData) => {
      const params: TemplateEntityMaterialBulkParams = {
        // material
        ...data.activity_id && { activity_id: data.activity_id },
        ...data.keyword_material && { material_name: data.keyword_material },
        ...data.material_type_ids && { material_type_ids: data.material_type_ids },
        // entity
        ...data.keyword_entity && { entity_name: data.keyword_entity },
        ...data.type_ids && { entity_type_id: data.type_ids },
        ...data.entity_tag_ids && { entity_tag_id: data.entity_tag_ids },
        ...data.province_ids && { province_id: data.province_ids },
        ...data.regency_ids && { regency_id: data.regency_ids },
        ...data.sub_district_ids && { sub_district_id: data.sub_district_ids },
        ...data.village_ids && { village_id: data.village_ids },
      }

      return templateEntityMaterialBulk(params)
    },
    onSuccess: () => {
      toast.success({ description: t('entityMaterialBulk:export.toast.success') })

      handleReset()
      setOpen(false)
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message })
    },
  })

  useSetLoadingPopupStore(isPending)

  useEffect(() => {
    return () => handleReset()
  }, [methods.reset])

  return (
    <Dialog open={open} onOpenChange={setOpen} className="ui-max-w-[828px]">
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {t("entityMaterialBulk:export.title")}
      </DialogHeader>
      <div className="ui-border-b-[1px]" />
      <DialogContent className="ui-py-4 ui-overflow-y-auto ui-max-h-[calc(100vh-200px)]">
        <div className="ui-space-y-10">
          <div className="ui-bg-primary-50 ui-rounded ui-px-4 ui-py-3">
            <div className="ui-flex ui-gap-2 ui-items-center">
              <Warning />
              <p className="ui-text-xs">{t("entityMaterialBulk:export.description")}</p>
            </div>
          </div>
          <form
            id="export-entity-material-bulk"
            onSubmit={methods.handleSubmit(values => mutate(values as FilterFormData))}
            className="ui-grid ui-grid-cols-1 ui-gap-y-4"
          >
            <FormProvider {...methods}>
              <EntityMaterialBulkFormEntity />
              <div className="ui-border-b-[1px] ui-mt-2" />
              <EntityMaterialBulkFormMaterial isMaterialHierarchy={isMaterialHierarchy} />
            </FormProvider>
          </form>
        </div>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full">
          <Button
            id="btn-close-modal-export"
            variant="default"
            className="ui-w-full"
            loading={isPending}
            onClick={() => {
              setOpen?.(!open)
              methods.reset()
            }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn-submit-modal-download"
            type="submit"
            className="ui-w-full"
            form="export-entity-material-bulk"
            leftIcon={<Download className="ui-size-5" />}
            loading={isPending}
          >
            {t('common:download_template')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default EntityMaterialBulkModalExport