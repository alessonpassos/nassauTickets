class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = "ErroHttp";
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ErroHttp, asyncHandler };
