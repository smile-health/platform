import { setIsTon } from '@/redux/actions/app';
import { RootState } from '@/redux/store';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';

const WeightChanger: React.FC = () => {
  const dispatch = useDispatch();
  const isTon = useSelector((state: RootState) => {
    return state.app.isTon;
  });

  const handleWeightUnitChange = (value: 'kg' | 'ton') => {
    const newIsTon = value === 'ton';
    dispatch(setIsTon(!!newIsTon));
  };

  const weightOptions = [
    {
      value: 'kg',
      label: 'KG',
    },
    {
      value: 'ton',
      label: 'TON',
    },
  ];

  const currentWeight = weightOptions.find(
    (x) => (x.value === 'ton') === isTon
  );

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        {currentWeight && (
          <div
            className="ui-bg-[#F5F5F4] ui-flex ui-gap-2 ui-items-center ui-p-[6px] ui-w-[80px] ui-cursor-pointer"
            id="trigger-weight-changer"
          >
            {currentWeight.value.toUpperCase()}
            <ChevronDownIcon className="ui-w-3" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {weightOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleWeightUnitChange(option.value as 'kg' | 'ton')}
            id={`weight-${option.value}`}
          >
            <div className="ui-flex ui-gap-2 ui-items-center ui-font-semibold">
              {option.label}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export default WeightChanger;
