import { getCurrencySymbol, numberFormatter } from '@/utils/formatter';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { DataTable } from '@repo/ui/components/data-table';
import { InputNumberV2 } from '@repo/ui/components/input-number-v2';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WasteSpecificationTableProps {
  data: any[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onPriceUpdate?: (index: number, newPrice: string) => void;
}

interface PriceCellProps {
  original: any;
  index: number;
  editingIndex: number | null;
  editingPrice: string;
  priceError: boolean;
  onPriceUpdate?: (index: number, newPrice: string) => void;
  onPriceClick: (index: number, currentPrice: string) => void;
  onPriceChange: (values: any) => void;
  onKeyPress: (e: React.KeyboardEvent, index: number) => void;
  onPriceSave: (index: number) => void;
}

const PriceCell = ({
  original,
  index,
  editingIndex,
  editingPrice,
  priceError,
  onPriceUpdate,
  onPriceClick,
  onPriceChange,
  onKeyPress,
  onPriceSave,
}: PriceCellProps) => {
  const isEditing = editingIndex === index;
  const currentPrice = original?.pricePerKg?.toString() || '0';

  if (isEditing) {
    return (
      <InputNumberV2
        value={editingPrice}
        onValueChange={onPriceChange}
        onKeyDown={(e) => onKeyPress(e, index)}
        onBlur={() => onPriceSave(index)}
        placeholder="0"
        min={0}
        autoFocus
        className={`${priceError ? 'ui-border-red-500 ui-border-2' : ''}`}
      />
    );
  }

  return (
    <button
      type="button"
      className="ui-w-full ui-text-left ui-cursor-pointer ui-border ui-border-gray-300 ui-hover:ui-border-blue-400 ui-hover:ui-bg-blue-50 ui-p-2 ui-rounded ui-transition-all ui-duration-200 ui-bg-transparent"
      onClick={() => onPriceUpdate && onPriceClick(index, currentPrice)}
      disabled={!onPriceUpdate}
      aria-label={`Edit price: ${getCurrencySymbol()} ${numberFormatter(
        Number(currentPrice)
      )}`}
    >
      {getCurrencySymbol() + ' ' + numberFormatter(Number(currentPrice))}
    </button>
  );
};

interface ActionCellProps {
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  t: (key: string) => string;
}

const ActionCell = ({ index, onEdit, onRemove, t }: ActionCellProps) => (
  <div className="ui-flex">
    <Button
      onClick={() => onEdit(index)}
      type="button"
      variant="subtle"
      className="!ui-px-1"
      size="sm"
    >
      {t('common:edit')}
    </Button>
    <Button
      onClick={() => onRemove(index)}
      type="button"
      variant="subtle"
      className="!ui-px-1 ui-text-danger-500"
      size="sm"
    >
      {t('common:remove')}
    </Button>
  </div>
);

interface ColumnConfig {
  t: (key: string) => string;
  editingIndex: number | null;
  editingPrice: string;
  priceError: boolean;
  onPriceUpdate: ((index: number, newPrice: string) => void) | undefined;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onPriceClick: (index: number, currentPrice: string) => void;
  onPriceChange: (values: any) => void;
  onKeyPress: (e: React.KeyboardEvent, index: number) => void;
  onPriceSave: (index: number) => void;
}

const createWasteSpecificationColumns = (
  config: ColumnConfig
): ColumnDef<any>[] => {
  const {
    t,
    editingIndex,
    editingPrice,
    priceError,
    onPriceUpdate,
    onEdit,
    onRemove,
    onPriceClick,
    onPriceChange,
    onKeyPress,
    onPriceSave,
  } = config;

  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 20,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('partnership:form.waste_type.label'),
      accessorKey: 'type',
      id: 'type',
      size: 100,
      cell: ({ row: { original } }) => original.typeLabel || '-',
    },
    {
      header: t('partnership:form.waste_group.label'),
      accessorKey: 'group',
      id: 'group',
      size: 100,
      cell: ({ row: { original } }) => original.groupLabel || '-',
    },
    {
      header: t('partnership:form.waste_characteristic.label'),
      accessorKey: 'characteristic',
      id: 'characteristic',
      size: 160,
      cell: ({ row: { original } }) => original.characteristicLabel || '-',
    },
    {
      header: t('partnership:list.column.price_kg'),
      accessorKey: 'pricePerKg',
      id: 'pricePerKg',
      size: 120,
      cell: ({ row: { original, index } }) => (
        <PriceCell
          original={original}
          index={index}
          editingIndex={editingIndex}
          editingPrice={editingPrice}
          priceError={priceError}
          onPriceUpdate={onPriceUpdate}
          onPriceClick={onPriceClick}
          onPriceChange={onPriceChange}
          onKeyPress={onKeyPress}
          onPriceSave={onPriceSave}
        />
      ),
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 60,
      cell: ({ row: { index } }) => (
        <ActionCell
          index={index}
          onEdit={onEdit}
          onRemove={onRemove}
          t={t as (key: string) => string}
        />
      ),
    },
  ];
};

export const WasteSpecificationTable = ({
  data,
  onEdit,
  onRemove,
  onPriceUpdate,
}: WasteSpecificationTableProps) => {
  const { t } = useTranslation(['partnership', 'common']);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [priceError, setPriceError] = useState<boolean>(false);

  const handlePriceClick = (index: number, currentPrice: string) => {
    setEditingIndex(index);
    setEditingPrice(currentPrice);
    setPriceError(false);
  };

  const handlePriceSave = (index: number) => {
    const priceValue = parseFloat(editingPrice);

    // If input is empty or 0, revert to original price
    if (editingPrice === '' || editingPrice.trim() === '' || priceValue === 0) {
      setEditingIndex(null);
      setEditingPrice('');
      setPriceError(false);
      return;
    }

    if (onPriceUpdate && !isNaN(priceValue) && priceValue > 0) {
      onPriceUpdate(index, editingPrice);
      setEditingIndex(null);
      setEditingPrice('');
      setPriceError(false);
    } else {
      setPriceError(true);
    }
  };

  const handlePriceCancel = () => {
    setEditingIndex(null);
    setEditingPrice('');
    setPriceError(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handlePriceSave(index);
    } else if (e.key === 'Escape') {
      handlePriceCancel();
    }
  };

  const handlePriceChange = (values: any) => {
    setEditingPrice(values.floatValue?.toString() || '');
    // Clear error when user starts typing
    if (priceError) {
      setPriceError(false);
    }
  };

  const wasteSpecificationColumns = createWasteSpecificationColumns({
    t: t as (key: string) => string,
    editingIndex,
    editingPrice,
    priceError,
    onPriceUpdate,
    onEdit,
    onRemove,
    onPriceClick: handlePriceClick,
    onPriceChange: handlePriceChange,
    onKeyPress: handleKeyPress,
    onPriceSave: handlePriceSave,
  });

  return <DataTable data={data} columns={wasteSpecificationColumns} />;
};
