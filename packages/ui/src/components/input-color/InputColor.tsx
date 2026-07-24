import React, { useEffect, useRef, useState } from 'react'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

const presetColors = [
  '#f87171', '#dc2626', '#b91c1c', '#991b1b',
  '#f97316', '#ea580c', '#c2410c', '#9a3412',
  '#f59e0b', '#d97706', '#b45309', '#92400e',
  '#eab308', '#ca8a04', '#a16207', '#854d0e',
  '#84cc16', '#65a30d', '#4d7c0f', '#3f6212',
  '#22c55e', '#16a34a', '#15803d', '#166534',
  '#10b981', '#059669', '#047857', '#065f46',
  '#14b8a6', '#0d9488', '#0f766e', '#115e59',
  '#06b6d4', '#0891b2', '#0e7490', '#155e75',
  '#0ea5e9', '#0284c7', '#0369a1', '#075985',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
  '#d946ef', '#c026d3', '#a21caf', '#86198f',
  '#ec4899', '#db2777', '#be185d', '#9d174d',
  '#f43f5e', '#e11d48', '#be123c', '#9f1239',
];


// Extend the Window interface to include EyeDropper
declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

type ColorInputProps = {
  id?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  error?: boolean
  onChange: (value: string) => void
  value?: string
  disabled?: boolean
}

export const InputColor = (props: ColorInputProps) => {
  const { id, name, onChange, disabled, value, size = 'md', error } = props
  const { t } = useTranslation()
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const handleChange = (color: string) => {
    setOpen(false)
    onChange?.(color)
  };

  const openPicker = () => setOpen(true)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cx(
        "ui-relative ui-flex ui-w-full ui-items-center space-x-3 ui-bg-white-100 ui-border ui-border-gray-300 focus:ui-ring-2 ui-px-3",
        "focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25 ui-rounded",
        {
          'ui-h-8': size === 'sm',
          'ui-h-10': size === 'md',
          'ui-h-12': size === 'lg',
          'ui-h-14': size === 'xl',
          'ui-border ui-border-danger-500 focus:ui-ring-danger-500 focus:ui-ring-opacity-25': error,
          'ui-cursor-pointer': !disabled,
          'ui-cursor-not-allowed': disabled,
        })
      }
      ref={dropdownRef}
      onClick={openPicker}
    >
      <button
        className="ui-h-4 ui-w-4 ui-rounded-full ui-border ui-border-gray-300 ui-shadow-sm"
        style={{ backgroundColor: value }}
        aria-label="Pick a color"
        disabled={disabled}
        type="button"
      />
      <span
        className={cx(
          "text-sm font-medium ui-text-gray-800",
          {
            "ui-text-gray-500": !value || disabled,

            // size 
            'ui-text-sm': size === 'sm',
            'ui-text-base': size === 'md',
            'ui-text-lg': size === 'lg',
            'ui-text-xl': size === 'xl',
          }
        )
        }
      >
        {value || t('form.color.placeholder')}
      </span>
      <input
        id={id}
        name={name}
        type="hidden"
        value={value || ''}
        disabled={disabled}
      />
      {open && (
        <div className="ui-absolute ui-z-10 ui-mt-2 ui-w-max ui-p-4 ui-bg-white ui-rounded-xl ui-border ui-border-gray-200 -ui-top-[160px]">
          <div className="ui-grid ui-grid-cols-4 ui-gap-2 ui-max-h-36 ui-overflow-y-auto">
            {presetColors.map((color, index) => (
              <button
                key={index}
                className={cx('ui-w-6 ui-h-6 ui-rounded-full ui-border hover:scale-110 transition', {
                  'ui-border-2 ui-border-primary-800': value === color
                })}
                style={{ backgroundColor: color }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleChange(color)
                }}
                aria-label={`Select ${color}`}
                type='button'
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
