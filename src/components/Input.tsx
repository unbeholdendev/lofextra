import {
  useFormContext,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type Props = {
  name: string;
  options?: RegisterOptions<FieldValues, string>;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = ({ name, options, ...rest }: Props) => {
  const { register } = useFormContext();

  return (
    <label>
      {rest["aria-label"]}
      <input {...register(name, options)} {...rest} />
    </label>
  );
};
