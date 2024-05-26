import { useAccountContext } from "@/hooks/contexts";
import { useLofiQuery } from "@/hooks/useLofiQuery";
import { QueryKeys } from "@/queries";
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

  const { data } = useLofiQuery({
    sql: `select * from categories where pubKeyHex = '${pubKeyHex}' and deletedAt is null`,
    schema: categoriesSchema,
    queryKey: [QueryKeys.GET_CATEGORIES, pubKeyHex],
  });

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
