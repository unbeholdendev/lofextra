import { AccountContext } from "@/contexts/AccountContext";
import { DatabaseContext } from "@/contexts/DatabaseContext";
import { HlcContext } from "@/contexts/HlcContext";
import { useContext } from "react";

export const useDatabaseContext = () => {
  const ctx = useContext(DatabaseContext);

  if (!ctx) {
    throw new Error("Not inside DatabaseContext!");
  }

  return ctx;
};

export const useAccountContext = () => {
  const ctx = useContext(AccountContext);

  if (!ctx) {
    throw new Error("Not inside AccountContext!");
  }

  return ctx;
};

export const useHlcContext = () => {
  const ctx = useContext(HlcContext);

  if (!ctx) {
    throw new Error("Not inside HlcContext!");
  }

  return ctx;
};
