import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import { categoriesSchema } from "@/validators/validators";
import { useFormContext } from "react-hook-form";

type Props = {
  name: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;
export const CategoryPicker = ({ name, ...props }: Props) => {
  const { pubKeyHex } = useAccountContext();

  const { data } = useQuery(
    `select * from categories where pubKeyHex = '${pubKeyHex}' and deletedAt is null`,
    categoriesSchema
  );
  const { register } = useFormContext();

  return (
    <label>
      {"category"}

      <select {...register(name)} {...props}>
        <option value={""}>{"<category>"}</option>

        {data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>
    </label>
  );
};
