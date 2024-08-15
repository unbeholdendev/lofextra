import {
  useFormContext,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import styles from "./styles.module.css";

type Props = {
  name: string;
  options?: RegisterOptions<FieldValues, string>;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Checkbox = ({ name, options, ...rest }: Props) => {
  const { register } = useFormContext();

  return (
    <>
      <label htmlFor={name}>{rest["aria-label"]}</label>

      <input
        id={name}
        className={styles.checkbox}
        type="checkbox"
        {...register(name, options)}
        {...rest}
      />
    </>
  );
};
