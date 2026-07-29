"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { GptProvider } from "@/components/GptProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GptProvider>{children}</GptProvider>
    </Provider>
  );
}
