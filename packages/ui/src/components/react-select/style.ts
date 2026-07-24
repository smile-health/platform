import { GroupBase, StylesConfig } from "react-select";

const getBackground = (isDisabled: boolean, isFocused: boolean) => {
  if (isDisabled) return '#e0e0e0'
  if (isFocused) return '#BE0028'
  return 'current'
}

const getColor = (isDisabled: boolean, isFocused: boolean) => {
  if (isDisabled) return 'current'
  if (isFocused) return '!ui-text-primary-contrast'
  return 'current'
}

export const getStyles = (): StylesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> => ({
  menu: (styles) => ({
    ...styles,
    zIndex: 18,
    position: 'absolute',
  }),
  menuPortal: (styles) => ({
    ...styles,
    zIndex: 9999,
  }),
  control: (styles) => ({
    ...styles,
    ':disabled': {
      backgroundColor: 'rgb(242, 242, 242)',
    },
    'boxShadow': 'none',
    'minHeight': 42,
    ':focus-within': {
      borderColor: '#BE0028',
      outline: '#BE0028',
      boxShadow: '0 0 0 1px #BE0028',
    },
    '> :first-of-type': {
      'flexWrap': 'unset',
      'overflow': 'auto auto',
      '&::-webkit-scrollbar': {
        height: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#989898',
        borderRadius: '5px',
      },
    },
  }),
  option: (styles, { isFocused, isDisabled }) => ({
    ...styles,
    'textTransform': 'capitalize',
    'backgroundColor': getBackground(isDisabled, isFocused),
    'color': getColor(isDisabled, isFocused),
    ':active': {
      backgroundColor: isFocused ? '#EB5757' : 'current',
    },
  }),
  singleValue: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
    padding: '4px 6px',
    width: 'max-content',
    backgroundColor: '#E0E0E0',
    color: '#002D40',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '18px',
  }),
  multiValue: (styles) => ({
    ...styles,
    minWidth: 'unset',
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    'textTransform': 'capitalize',
    ':hover': {
      backgroundColor: 'gray',
      color: 'white',
    },
    'padding': '4px',
    'svg': {
      display: 'block',
    },
    ':disabled': {
      padding: '0',
      svg: {
        display: 'none',
      },
    },
  }),
  clearIndicator: (styles) => ({
    ...styles,
    cursor: 'pointer',
  }),
})
