import axios from "#lib/axios";
import { getProgramStorage } from "#utils/storage/program";
import { useEffect } from "react";

export const useAxios = () => {
  const workspace = getProgramStorage()

  useEffect(() => {
    if (workspace) axios.defaults.headers.common['x-program-id'] = workspace.id
  }, [workspace])
}
