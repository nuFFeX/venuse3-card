import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "venuse3-card.js",
  output: {
    file: "dist/venuse3-card.js",
    format: "es",
  },
  plugins: [resolve(), commonjs()],
};
