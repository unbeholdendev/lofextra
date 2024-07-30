import {
  DragDropContext,
  Droppable,
  type OnDragEndResponder,
} from "@hello-pangea/dnd";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
  useLofikQuery,
} from "@lofik/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { TypeOf } from "zod";
import { QueryKeys } from "../../../queries";
import { arrayMove } from "../../../utils/array";
import { categoriesSchema } from "../../../validators/validators";
import { routes } from "../routes";
import { Category } from "./Category";
import styles from "./styles.module.css";

export const Categories = () => {
  const { pubKeyHex } = useLofikAccount();
  const navigate = useNavigate();

  // using the state here as a 'hack' to prevent flickering issue when dropping caused by react-query
  // https://codesandbox.io/s/react-beautiful-dnd-flicker-after-synchronous-update-with-reactquery-n207n1
  const [categoriesState, setCategoriesState] =
    useState<TypeOf<typeof categoriesSchema>>();

  const { data: categories, refetch } = useLofikQuery({
    sql: `
      SELECT * FROM categories 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
      ORDER BY sortOrder`,
    schema: categoriesSchema,
    queryKey: [QueryKeys.GET_CATEGORIES, pubKeyHex],
  });

  useEffect(() => {
    setCategoriesState(categories);
  }, [categories]);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSettled: () => {
      refetch();
    },
  });

  const onDragEnd: OnDragEndResponder = (result) => {
    const { draggableId, source, destination } = result;

    if (
      !destination?.index ||
      source.index === destination.index ||
      !categoriesState
    ) {
      return;
    }

    const oldSortOrder = categoriesState[source.index].sortOrder;
    const newSortOrder = categoriesState[destination?.index].sortOrder;

    // optimistic update
    setCategoriesState(
      arrayMove(categoriesState, source.index, destination.index)
    );

    mutate({
      operation: DatabaseMutationOperation.Sort,
      tableName: "categories",
      identifierValue: draggableId,
      order: oldSortOrder > newSortOrder ? newSortOrder : newSortOrder + 1,
    });
  };

  return (
    <>
      <div className={styles["overview-container"]}>
        <div>
          <div>categories total</div>
          <div className={styles.large}>
            <strong>{categoriesState?.length ?? 0}</strong>
          </div>
        </div>

        <button
          onClick={() =>
            navigate({
              to: routes.CATEGORY_CREATE,
            })
          }
        >
          create category
        </button>
      </div>

      {!!categoriesState?.length && (
        <span className={styles.small}>
          sort categories by drag and dropping
        </span>
      )}

      {categoriesState?.length ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className={styles.scroll}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categoriesState.map((category, index) => (
                  <Category
                    key={category.id}
                    index={index}
                    category={category}
                    onDetailClick={(category) =>
                      navigate({
                        to: routes.CATEGORY_DETAIL,
                        params: { id: category.id },
                      })
                    }
                    onDelete={refetch}
                  />
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div>no categories yet..</div>
      )}
    </>
  );
};
