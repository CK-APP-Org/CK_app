module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://www.ck.tp.edu.tw",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    },
  },
};
