/* eslint-disable @typescript-eslint/no-unused-vars */
import { build, combine } from "../index";
import { ResponseType } from "../types";
import {
  Badge_Order,
  OrderDirection,
  QueryBadgeArgs,
  QueryUserBadgesArgs,
  UserBadge,
  type Badge,
  type QueryBadgesArgs,
  User,
  QueryUserArgs,
  MutationUpdateUserArgs,
} from "./test-schema";

it("builds a basic query", () => {
  const query = build<Badge[], QueryBadgesArgs>("badges")
    .first(10)
    .where({
      name: "badge",
      id: "1",
    })
    .select(["id", "name"]);

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badges(
      first: 10
      where: {
        name: "badge"
        id: "1"
      }
    ) {
      id
      name
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = [
    {
      id: "",
      name: "",
    },
  ];

  // @ts-expect-error - should fail because it's missing id and name
  const s: ResponseType<typeof query> = [{}];
});

it("builds a query with enums", () => {
  const query = build<Badge[], QueryBadgesArgs>("badges")
    .first(10)
    .orderBy([Badge_Order.Name])
    .orderDirection.enum(OrderDirection.Asc)
    .select(["id", "name"]);

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badges(
      first: 10
      orderBy: [name]
      orderDirection: ASC
    ) {
      id
      name
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = [
    {
      id: "",
      name: "",
    },
  ];
});

it("builds a basic query with nested fields", () => {
  const query = build<UserBadge[], QueryUserBadgesArgs>("userBadges")
    .where({
      claimed: false,
    })
    .select({
      id: true,
      claimed: true,
      badge: {
        id: true,
      },
    });

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    userBadges(
      where: {
        claimed: false
      }
    ) {
      id
      claimed
      badge {
        id
      }
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  // Ensure the type inference works

  const r: ResponseType<typeof query> = [
    {
      id: "",
      claimed: false,
      badge: {
        id: "",
      },
    },
  ];
});

it("builds a query for a singular entity", () => {
  const query = build<Badge, QueryBadgeArgs>("badge")
    .id("1")
    .select(["id", "name", "xp"]);

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badge(
      id: "1"
    ) {
      id
      name
      xp
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = {
    id: "",
    name: "",
    xp: 0,
  };
});

it("builds a query with a nested query", () => {
  const query = build<User, QueryUserArgs>("user")
    .id("1")
    .select({
      id: true,
      badges: build<UserBadge[], QueryUserBadgesArgs>("userBadges")
        .where({ claimed: false })
        .select({
          id: true,
          badge: build<Badge>("badge").select(["id", "name", "xp"]),
        }),
    });

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
      user(id: "1") {
        id
        badges(
          where: {
            claimed: false 
          }
        ) {
            id
            badge {
              id
              name
              xp
            }
          }
      }
    }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = {
    id: "",
    badges: [
      {
        id: "",
        badge: {
          id: "",
          name: "",
          xp: 0,
        },
      },
    ],
  };
});

it("aliases fields", () => {
  const query = build<Badge, QueryBadgeArgs>("badge").id("1").select({
    id: true,
    title: "name",
  });

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badge(
      id: "1"
    ) {
      id
      name: title
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = {
    id: "",
    title: "",
  };
});

it("strips out nullish values", () => {
  const query = build<Badge[], QueryBadgesArgs>("badges")
    .where({
      description: undefined,
      id: undefined,
      imageUrl: undefined,
    })
    .select(["id"]);

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badges {
      id
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);
});

it.todo("creates ... on fragments");

it("combines multiple queries into a single request", () => {
  const queryA = build<Badge[], QueryBadgesArgs>("badges").select(["id"]);
  const queryB = build<UserBadge[], QueryUserBadgesArgs>("userBadges").select([
    "id",
    "userId",
  ]);

  const query = combine({
    badges: queryA,
    userBadges: queryB,
  });

  const actual = query.toString().replace(/\s/g, "");
  const expected = `query {
    badges {
      id
    }
    userBadges {
      id
      userId
    }
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = {
    badges: [
      {
        id: "",
      },
    ],
    userBadges: [
      {
        id: "",
        userId: "",
      },
    ],
  };
});

it("builds mutations", () => {
  const query = build<boolean, MutationUpdateUserArgs>("updateUser")
    .input({ username: "foo", location: "UK" })
    .mutation();

  const actual = query.toString().replace(/\s/g, "");
  const expected = `mutation {
    updateUser(
      input: {
        username: "foo"
        location: "UK"
      }
    )
  }`.replace(/\s/g, "");

  expect(actual).toEqual(expected);

  const r: ResponseType<typeof query> = true;
  // @ts-expect-error - should fail because it's not a boolean
  const s: ResponseType<typeof query> = "wrong";
});
