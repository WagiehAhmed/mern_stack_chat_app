import { useCallback, useEffect, useState } from "react";

export const useToggle = (initialValue) => {
  const [state, setState] = useState((initialValue = false));
  const toggle = useCallback(() => {
    setState((pre) => !pre);
  }, []);
  return [state, toggle];
};
