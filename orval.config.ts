import { defineConfig } from "orval";

export default defineConfig({
  lostAndFoundApi: {
    input: "https://wasitkheir.runasp.net/swagger/v1/swagger.json",
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/api/mutator.ts",
          name: "customInstance",
        },
        operations: {
          "/api/auth/login": {
            header: { Authorization: "Bearer {token}" }, // Note: But use withCredentials for cookie
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'echo "API generated!"',
    },
  },
});
