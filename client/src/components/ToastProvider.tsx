import React, { createContext, useCallback, useContext, useState } from "react";
import Toast, { ToastMessage } from "./Toast";

interface ToastContextValue {
  push: (msg: Omit<ToastMessage, "id">) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast outside provider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const push = useCallback((m: Omit<ToastMessage, "id">) => {
    setMessages((prev) => [
      ...prev,
      { ...m, id: Math.random().toString(36).slice(2) },
    ]);
  }, []);
  const remove = (id: string) =>
    setMessages((prev) => prev.filter((m) => m.id !== id));
  const api: ToastContextValue = {
    push,
    success: (text) => push({ text, type: "success" }),
    error: (text) => push({ text, type: "error" }),
    info: (text) => push({ text, type: "info" }),
  };
  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast messages={messages} onDismiss={remove} />
    </ToastContext.Provider>
  );
};
