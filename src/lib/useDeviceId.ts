"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "st_device_id";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function useDeviceId() {
  const [deviceId] = useState<string>(getOrCreateDeviceId);
  return deviceId;
}
