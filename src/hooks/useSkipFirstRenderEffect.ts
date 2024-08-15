import {
  useEffect,
  useRef,
  type DependencyList,
  type EffectCallback,
} from "react";

export const useSkipFirstRenderEffect = (
  effect: EffectCallback,
  deps?: DependencyList
) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    effect();
  }, deps);
};
