import { useContext } from "react";
import { ConfirmContext } from "./ConfirmContext";

function useConfirm() {
  const context = useContext<(description: string) => Promise<boolean>>(
    ConfirmContext as any
  );
  return context;
}
export default useConfirm;
