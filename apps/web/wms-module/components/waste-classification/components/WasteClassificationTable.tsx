'use client';

import { TWasteHierarchyClassification } from '@/types/waste-hierarchy';
import { DataTable } from '@repo/ui/components/data-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { columnsWasteClassification } from '../constants/columnsWasteClassification';

interface WasteClassificationTableProps {
  rawData: TWasteHierarchyClassification[];
}

interface WasteClassificationRow extends TWasteHierarchyClassification {
  typeRowSpan?: number;
  groupRowSpan?: number;
}

export function WasteClassificationTable({
  rawData,
}: WasteClassificationTableProps) {
  const { t } = useTranslation(['common', 'wasteClassification']);

  // Transform data to include rowSpan calculations
  const tableData = useMemo((): WasteClassificationRow[] => {
    const typeGroups = new Map<
      string,
      Map<string, TWasteHierarchyClassification[]>
    >();

    // Group data by type and group
    rawData.forEach((item) => {
      if (!typeGroups.has(item.wasteTypeName)) {
        typeGroups.set(item.wasteTypeName, new Map());
      }

      const groups = typeGroups.get(item.wasteTypeName)!;
      if (!groups.has(item.wasteGroupName)) {
        groups.set(item.wasteGroupName, []);
      }

      groups.get(item.wasteGroupName)!.push(item);
    });

    const result: WasteClassificationRow[] = [];

    typeGroups.forEach((groups) => {
      let typeRowCount = 0;
      groups.forEach((characteristics) => {
        typeRowCount += characteristics.length;
      });

      let isFirstType = true;
      groups.forEach((characteristics) => {
        const groupRowCount = characteristics.length;
        let isFirstGroup = true;

        characteristics.forEach((item) => {
          result.push({
            ...item,
            typeRowSpan: isFirstType ? typeRowCount : 0,
            groupRowSpan: isFirstGroup ? groupRowCount : 0,
          });

          isFirstType = false;
          isFirstGroup = false;
        });
      });
    });

    return result;
  }, [rawData]);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={tableData}
        columns={columnsWasteClassification(t)}
        className="ui-rounded ui-border ui-border-gray-200"
      />
    </div>
  );
}
