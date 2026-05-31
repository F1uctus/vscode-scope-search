module.exports = {
  Uri: {
    joinPath: (base, ...parts) => ({
      fsPath: [base.fsPath ?? base.path ?? String(base), ...parts].join('/').replace(/\/+/g, '/'),
    }),
  },
};
