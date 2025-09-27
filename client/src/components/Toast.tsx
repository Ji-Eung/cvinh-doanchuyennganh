import React from "react";

export interface ToastMessage {
  id: string;
  type?: "success" | "error" | "info";
  text: string;
}

const Toast: React.FC<{
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ messages, onDismiss }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`alert alert-${
            m.type === "error" ? "danger" : m.type || "info"
          } py-2 px-3 shadow-sm`}
          style={{ minWidth: 220 }}
        >
          <div className="d-flex justify-content-between align-items-center gap-2">
            <span style={{ fontSize: 14 }}>{m.text}</span>
            <button
              onClick={() => onDismiss(m.id)}
              className="btn-close btn-close-white btn-sm"
              style={{ filter: "invert(1)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
export default Toast;
