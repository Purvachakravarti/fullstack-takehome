import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($filters: PostFilters!) {
    posts(filters: $filters) {
      id
      userId
      title
      content
      createdAt
      updatedAt
    }
  }
`;
