import { memo, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@apollo/client/react";

import { GetUsersDocument } from "../../__generated__/graphql";
import { GET_POSTS } from "../../gql/getPosts";

import { PostsCell } from "./cells/PostsCell";
import { GenericCell } from "./cells/GenericCell";
import type { Post, GetPostsData, GetPostsVars, UserRow } from "@/types";
import { LoadingSpinner } from "../LoadingSpinner";

const columnHelper = createColumnHelper<UserRow>();

type TableContentProps = {
  searchValue: string;
};

export const TableContent = memo(({ searchValue }: TableContentProps) => {
  // 1) Users query
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    networkStatus: usersNetworkStatus,
  } = useQuery(GetUsersDocument, {
    variables: { filters: {} },
    notifyOnNetworkStatusChange: true,
  });

  const users = useMemo(() => {
    const list = usersData?.users ?? [];
    const q = searchValue.trim().toLowerCase();

    if (!q) return list;

    return list.filter((u) => {
      const searchable =
        `${u.id} ${u.name} ${u.email} ${u.phone} ${u.age}`.toLowerCase();

      return searchable.includes(q);
    });
  }, [usersData, searchValue]);

  // 2) Posts query (ONE TIME)
  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
    networkStatus: postsNetworkStatus,
  } = useQuery<GetPostsData, GetPostsVars>(GET_POSTS, {
    variables: { filters: {} },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
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

  // 4) Columns
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

  const usersIsBusy = usersLoading || usersNetworkStatus === 4; // 4 = refetch

  if (usersIsBusy)
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (usersError)
    return <div className="p-4 text-red-500">Error: {usersError.message}</div>;

  const postsWarning = postsError ? (
    <div className="px-4 py-2 text-xs text-yellow-300">
      Posts failed to load: {postsError.message}
    </div>
  ) : null;

  const postsIsBusy = postsLoading || postsNetworkStatus === 4;

  const postsLoadingBanner = postsIsBusy ? (
    <div className="px-4 py-2 text-xs text-gray-300 flex items-center gap-2">
      <LoadingSpinner size="sm" />
      Loading posts…
    </div>
  ) : null;

  return (
    <div className="w-full overflow-x-auto">
      {postsWarning}
      {postsLoadingBanner}
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
      </table>
    </div>
  );
});
