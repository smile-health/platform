import { createContext } from "react";

type OrderCreateContextProps = {
  isRelocation: boolean
  isHierarchy: boolean
}

export const OrderCreateContext = createContext<OrderCreateContextProps>({
  isRelocation: false,
  isHierarchy: false,
})