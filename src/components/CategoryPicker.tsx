import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useMemo } from "react";
import { QueryKeys } from "../containers/Dashboard/constants";
import { categoriesSchema } from "../validators/validators";
import { Select } from "./Select";

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

  const options = useMemo(
    () => data?.map(({ title, id }) => ({ label: title, value: id })),
    [data]
  );

  return (
    <Select
      name={name}
      options={options}
      label="category"
      emptyLabel="<category>"
      {...props}
    />
  );
};
