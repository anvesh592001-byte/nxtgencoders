"use client";

import { useState } from "react";

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function ClientRequestId({ name = "client_request_id" }: { name?: string }) {
  const [requestId] = useState(createRequestId);
  return <input type="hidden" name={name} value={requestId} />;
}
