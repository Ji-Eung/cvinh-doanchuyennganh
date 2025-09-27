// Shared lightweight API response types (keep in sync with server DTOs)

export interface PostListItem {
  id: string;
  title: string;
  price: number;
  status: string;
  categoryId?: string;
  sellerId?: string;
  createdAt?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta?: any;
}

export interface FavoriteItemDto {
  id: string;
  post: {
    _id: string;
    title: string;
    price: number;
    status: string;
  } | null;
  createdAt: string;
}
