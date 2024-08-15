import { Currencies } from "../containers/Dashboard/constants";
import { Select } from "./Select";

type Props = {
  name: string;
  label?: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const options = Object.keys(Currencies).map((code) => ({
  label: `${code} - ${Currencies[code as keyof typeof Currencies]}`,
  value: code,
}));

export const CurrencyPicker = ({ name, label, ...props }: Props) => {
  return (
    <Select
      name={name}
      options={options}
      label={label || "currency"}
      {...props}
    />
  );
};
