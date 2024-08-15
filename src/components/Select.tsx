import { useFormContext } from "react-hook-form";

type Props = {
  name: string;
  options?: { label: string; value: string | number }[];
  label?: string;
  emptyLabel?: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export const Select = ({
  name,
  options,
  label,
  emptyLabel,
  ...props
}: Props) => {
  const { register } = useFormContext();

  return (
    <label>
      {label}

      <select {...(options && register(name))} {...props}>
        {emptyLabel && <option value={""}>{emptyLabel}</option>}

        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
