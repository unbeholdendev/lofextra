import { useState, type ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { ConfirmModal } from "./ConfirmModal";

type Props<FormValues extends FieldValues> = {
  children: ReactNode;
  onSubmit: (
    values: FormValues,
    methods: UseFormReturn<FormValues>
  ) => Promise<void> | void;
  confirmModalProps?: {
    enabled: boolean;
    header?: string;
    children?: ReactNode;
    isLoading?: boolean;
  };
} & UseFormProps<FormValues>;

export const Form = <FormValues extends FieldValues>({
  children,
  onSubmit,
  confirmModalProps,
  ...form
}: Props<FormValues>) => {
  const methods = useForm(form);
  const [confirmModal, setConfirmModal] = useState(false);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={
          confirmModalProps?.enabled
            ? methods.handleSubmit(() => setConfirmModal(true))
            : methods.handleSubmit((values) => onSubmit(values, methods))
        }
      >
        {children}
      </form>

      {confirmModal && (
        <ConfirmModal
          onCancel={() => setConfirmModal(false)}
          onConfirm={() => onSubmit(methods.getValues(), methods)}
          header={confirmModalProps?.header}
          isLoading={confirmModalProps?.isLoading}
        >
          {confirmModalProps?.children}
        </ConfirmModal>
      )}
    </FormProvider>
  );
};
