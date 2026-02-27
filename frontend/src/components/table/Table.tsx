import { memo, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@apollo/client/react";

import {
  GetUsersDocument,
  type GetUsersQuery,
} from "../../__generated__/graphql";
import { GET_POSTS } from "../../gql/queries";

import { TableFilters } from "./TableFilters";
import { PostsCell } from "./cells/PostsCell";
import { GenericCell } from "./cells/GenericCell";

type UserRow = GetUsersQuery["users"][0];

type Post = {
  id: number;
  userId: number | null;
  title: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type GetPostsData = { posts: Post[] };
type GetPostsVars = { filters: Record<string, unknown> };

const columnHelper = createColumnHelper<UserRow>();

const TableContent = memo(() => {
  // 1) Users query
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GetUsersDocument, {
    variables: { filters: {} },
  });

  const users: GetUsersQuery["users"] = usersData?.users ?? [];

  // 2) Posts query (ONE TIME)
  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery<GetPostsData, GetPostsVars>(GET_POSTS, {
    variables: { filters: {} }, // fetch all posts once
    fetchPolicy: "cache-first",
  });

  const posts = useMemo<Post[]>(() => postsData?.posts ?? [], [postsData]);

  // 3) Group posts by userId (for count + hover list)
  const postsByUserId = useMemo(() => {
    const map = new Map<number, Post[]>();
    for (const p of posts) {
      if (p.userId == null) continue;
      const list = map.get(p.userId) ?? [];
      list.push(p);
      map.set(p.userId, list);
    }
    return map;
  }, [posts]);

  // 4) Columns depend on postsByUserId, postsLoading
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="font-medium text-sky-300">
            <GenericCell value={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor("age", {
        header: "Age",
        cell: (info) => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="text-indigo-300">
            <GenericCell value={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        size: 180,
        cell: (info) => (
          <span className="text-emerald-300 tabular-nums">
            <GenericCell value={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.display({
        id: "posts",
        header: "Posts",
        size: 110,
        cell: ({ row }) => {
          const userId = row.original.id as number;
          const userPosts = postsByUserId.get(userId) ?? [];
          const count = postsLoading ? null : userPosts.length;

          return (
            <PostsCell
              isLoading={postsLoading}
              count={count}
              posts={userPosts}
            />
          );
        },
      }),
    ],
    [postsByUserId, postsLoading],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (usersLoading) return <div className="p-4">Loading users...</div>;
  if (usersError)
    return <div className="p-4 text-red-500">Error: {usersError.message}</div>;

  // If posts fails, we still want the table usable; just show "-" for posts
  const postsWarning = postsError ? (
    <div className="px-4 py-2 text-xs text-yellow-300">
      Posts failed to load: {postsError.message}
    </div>
  ) : null;

  return (
    <div className="w-full overflow-x-auto">
      {postsWarning}
      <table className="min-w-full table-fixed border-separate border-spacing-y-2">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              className="bg-gray-900/40 hover:bg-gray-900/70 transition-colors"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => (
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-200"
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className="bg-gray-900/40 hover:bg-gray-900/70 transition-colors"
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  className="px-4 py-3 text-sm text-gray-100 align-top"
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr
              className="bg-gray-900/40 hover:bg-gray-900/70 transition-colors"
              key={footerGroup.id}
            >
              {footerGroup.headers.map((header) => (
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-200"
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
});

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="p-2">
      <TableFilters searchValue={searchValue} setSearchValue={setSearchValue} />
      <TableContent />
    </div>
  );
};
