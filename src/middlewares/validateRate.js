function isValidRate(rate) {
  return Number.isInteger(rate) && rate >= 1 && rate <= 5;
}
module.exports = (req, res, next) => {
  const { talk } = req.body;

  if (talk.rate === '' || talk.rate === undefined) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }

  if (!isValidRate(talk.rate)) {
    return res.status(400)
    .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
  }

  next();
};
