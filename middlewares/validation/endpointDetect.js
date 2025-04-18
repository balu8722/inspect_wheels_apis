module.exports.endPointDetectMiddleware = (req, res, next) => {
    req.body = { ...req.body, isAdmin: req.baseUrl === "/admin" ? true : false }

    next()
}