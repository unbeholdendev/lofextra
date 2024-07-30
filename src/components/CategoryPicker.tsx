import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useFormContext } from "react-hook-form";
import { QueryKeys } from "../queries";
import { categoriesSchema } from "../validators/validators";

type Props = {
  name: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;
export const CategoryPicker = ({ name, ...props }: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM categories 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
      ORDER BY sortOrder`,
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
