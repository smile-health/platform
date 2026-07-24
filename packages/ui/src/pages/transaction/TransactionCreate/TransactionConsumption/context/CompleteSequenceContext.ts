import { createContext } from "react";

type ProtocolContextProps = { 
  protocol_id: number
  entity_id?: number | null
  activity_id?: number | null
}

const defaultValue = {
  protocol_id: 0
}

export const CompleteSequenceContext = createContext<ProtocolContextProps>(defaultValue)