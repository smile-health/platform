import { Td, Tr } from "#components/table"
import React from "react"
import { CreateTransctionForm } from "../transaction-create.type"
import { useFormContext } from "react-hook-form"
import { OptionType, ReactSelectAsync } from "#components/react-select"
import { Stock } from "#types/stock"
import { loadMaterial } from "../transaction-create.service"
import { useTranslation } from "react-i18next"
import { TRANSACTION_TYPE } from "../transaction-create.constant"
import { useRouter } from "next/router"

type Props = {
  onSelect: (stock: Stock) => void
  colSpan: number
  className?: string
}
type CustomOptionType = OptionType & { stock: Stock }

const TransactionCreateMaterialDropdown: React.FC<Props> = (props) => {
  const { onSelect, colSpan, className } = props
  const { t } = useTranslation('transactionCreate')
  const {
    watch,
  } = useFormContext<CreateTransctionForm>()
  const { activity, entity, items } = watch()
  const { query } = useRouter()
  const { type } = query as { type: string }

  const isAddRemoveStock = [
    TRANSACTION_TYPE.ADD_STOCK,
    TRANSACTION_TYPE.REMOVE_STOCK,
  ].includes(Number(type))

  return (
    <Tr>
      <Td id="cell-material-dropdown" colSpan={colSpan} className="ui-m-2">
        <div className={className}>
          <ReactSelectAsync
            key={items.length}
            id={`select-material-dropdown`}
            value={null}
            loadOptions={(keyword, _, additional) =>
              loadMaterial(keyword, _, additional) as any
            }
            onChange={(value: CustomOptionType) => onSelect(value.stock)}
            placeholder={t('table.placeholder.add_material')}
            additional={{
              page: 1,
              type,
              ...activity?.value && { activity_id: activity.value },
              ...entity?.value && { entity_id: entity.value },
              ...items.length > 0 && { material_ids: items.map(x => x.material_id) },
              is_addremove: Number(isAddRemoveStock),
            }}
            menuPortalTarget={document.documentElement}
            isClearable={false}
          />
        </div>
      </Td>
    </Tr>
  )
}

export default TransactionCreateMaterialDropdown