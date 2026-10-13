import { useContext } from "react";
import { AccountContext } from "../contexts/AccountContext";
import { WebsocketContext } from "../contexts/WebsocketContext";

export const useAccountContext = () => {
  const ctx = useContext(AccountContext);

  if (!ctx) {
    throw new Error("Not inside AccountContext!");
  }

  return ctx;
};

export const useWebsocketContext = () => {
  const ctx = useContext(WebsocketContext);

  if (!ctx) {
    throw new Error("Not inside WebsocketContext!");
  }

  return ctx;
};
