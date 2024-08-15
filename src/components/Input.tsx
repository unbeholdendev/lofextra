import {
  useFormContext,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type Props = {
  name: string;
  options?: RegisterOptions<FieldValues, string>;
  helperText?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = ({ name, options, helperText, ...rest }: Props) => {
  const { register } = useFormContext();

  return (
    <label>
      {rest["aria-label"]}

      <input
        {...register(name, options)}
        {...rest}
        aria-describedby={helperText ? `${name}-helper` : undefined}
      />

      {helperText && <small id={`${name}-helper`}>{helperText}</small>}
    </label>
  );
};
