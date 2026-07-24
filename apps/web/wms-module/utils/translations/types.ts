import { locales } from './config';

export function Locale(): 'id' | 'en' {
  return 'id';
}

export function isLocale(lang: string): boolean {
  // Check if lang is one of 'id' or 'en'
  return locales.includes(lang.toLowerCase() as 'id' | 'en');
}
