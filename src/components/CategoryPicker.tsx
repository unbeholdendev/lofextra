import { QueryKeys } from "@/queries";
import { categoriesSchema } from "@/validators/validators";
import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useFormContext } from "react-hook-form";

type Props = {
  name: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;
export const CategoryPicker = ({ name, ...props }: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const { data } = useLofikQuery({
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
