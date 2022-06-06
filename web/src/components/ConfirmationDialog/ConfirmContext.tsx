import { createContext, useCallback, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

interface IConfirm {
  open: boolean;
  description: string;
  onConfirm: () => void;
}

const ConfirmContext = createContext<(description: string) => Promise<boolean>>(
  async (_: string) => {
    return false;
  }
);

function ConfirmationDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [confirm, setConfirm] = useState<IConfirm>({
    open: false,
    description: "Are you sure you want to do that?",
    onConfirm: () => {},
  });

  const [resolve, setResolve] = useState<(value: boolean) => void | null>();

  const handleConfirm = () => {
    if (resolve) {
      resolve(true);
    }
    setConfirm((_: any) => {
      return {
        ...confirm,
        open: false,
      };
    });
  };

  const handleClose = () => {
    if (resolve) {
      resolve(false);
    }
    setConfirm((_: any) => {
      return {
        ...confirm,
        open: false,
      };
    });
  };

  const value = useCallback((description: string): Promise<boolean> => {
    return new Promise((r: (s: boolean) => void, _) => {
      setResolve((_: any) => r);
      setConfirm({
        open: true,
        description,
        onConfirm: handleConfirm,
      });
    });
  }, []);

  return (
    <>
      <ConfirmContext.Provider value={value}>
        <ConfirmationDialog
          open={confirm.open}
          description={confirm.description}
          onConfirm={handleConfirm}
          onClose={handleClose}
        ></ConfirmationDialog>
        {children}
      </ConfirmContext.Provider>
    </>
  );
}

export default ConfirmationDialogProvider;
export { ConfirmContext };
export type { IConfirm };
