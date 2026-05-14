export type Identity = {
  id: string;
  type: "user" | "guest";
  plan: "guest" | "free" | "pro" | "enterprise";
};
