const authConfig = {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API!,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
