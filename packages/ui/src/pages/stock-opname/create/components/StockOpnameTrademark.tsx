import { DataTable } from '#components/data-table';
import React, { useContext, useMemo } from 'react';
import { createColumnTrademark } from '../constants/table';
import { StockOpnameMaterialContext } from '../context/StockOpnameContext';
import { useTranslation } from 'react-i18next';
import { useStockOpnameTrademark } from '../hooks/useStockOpnameTrademark';
import { InputSearch } from '#components/input';
import { ValueChange } from '../types/form-types';

const StockOpnameTrademark: React.FC = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'stockOpnameCreate'])
  const {
    trademarks,
    handleShowWarningChange,
  } = useContext(StockOpnameMaterialContext)
  const {
    checkStatusMaterial,
    classRow,
    handleSelectMaterial,
    setSearch,
    debounceSearch
  } = useStockOpnameTrademark({ handleShowWarningChange })

  const filteredTrademarks = useMemo(() => {
    if (!debounceSearch) return trademarks;
    return trademarks.filter((trademark) => {
      const searchTerm = debounceSearch.toLowerCase();
      return trademark.material?.name.toLowerCase().includes(searchTerm)
    })
  }, [debounceSearch, trademarks]);

  return (
    <div className="ui-mt-6 ui-space-y-4">
      <div className="ui-flex ui-items-center ui-justify-between">
        <InputSearch
          id="input-search-activity-program"
          placeholder={t('stockOpnameCreate:form.trademark.table.search')}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-w-1/2"
        />
        <p>
          <strong className="ui-text-dark-blue ui-text-sm">
            {filteredTrademarks.length}
          </strong>
          &nbsp;
          {t('common:item')}
        </p>
      </div>
      <DataTable
        data={filteredTrademarks}
        columns={createColumnTrademark({
          t,
          language,
          classRow,
          checkStatusMaterial
        })}
        isSticky
        onClickRow={(row) => handleSelectMaterial(row.original)}
        className="ui-overflow-x-auto ui-max-h-[425px]"
      />
    </div >
  )
}

export default StockOpnameTrademark
