type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;

export enum OrderDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export type Query = {
  badge?: Maybe<Badge>;
  badges: Array<Badge>;
  userBadges: Array<UserBadge>;
};

export type Badge = {
  category: string;
  description: string;
  id: string;
  imageUrl: string;
  name: string;
  xp: number;
};

export enum Badge_Order {
  Description = "description",
  Id = "id",
  ImageUrl = "imageUrl",
  Name = "name",
}

export type Badge_Where = {
  description?: InputMaybe<string>;
  id?: InputMaybe<string>;
  imageUrl?: InputMaybe<string>;
  name?: InputMaybe<string>;
};

export type QueryBadgeArgs = {
  id?: InputMaybe<string>;
};

export type QueryBadgesArgs = {
  first?: number;
  orderBy?: InputMaybe<Array<Badge_Order>>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Badge_Where>;
};

export type QueryUserBadgesArgs = {
  first?: number;
  orderBy?: InputMaybe<Array<UserBadge_Order>>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UserBadge_Where>;
};

export type UserBadge = {
  __typename?: "UserBadge";
  badge: Badge;
  badgeId: string;
  claimed: boolean;
  createdAt: number;
  id: string;
  updatedAt: number;
  userId: string;
};

export enum UserBadge_Order {
  BadgeId = "badgeId",
  Claimed = "claimed",
  Id = "id",
  UserId = "userId",
}

export type UserBadge_Where = {
  badgeId?: string;
  claimed?: boolean;
  id?: string;
  userId?: string;
};

export type User = {
  id: string;
  badges: Array<UserBadge>;
};

export type QueryUserArgs = { id: string };

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type UpdateUserInput = {
  avatar?: string;
  location?: string;
  shippingAddress?: string;
  username?: string;
};
