const { registerService, loginService } = require("../service/authService")

const routes = [
    {
        method: 'POST',
        path: '/api/register',
        handler: registerService
    },
    {
        method: 'POST',
        path: '/api/login',
        handler: loginService
    }
]

module.exports = routes