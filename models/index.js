exports.getModel = (model) => {
    return require(`./${model}`)
}