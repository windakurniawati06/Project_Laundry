const express = require("express")
const app = express()
const md5 = require("md5")
app.use(express.json())

const models = require("../models/index")
const users = models.users

//panggil fungsi auth -> validasi token
const {auth} = require("./login")

//fungsi auth dijadikan middleware
app.use(auth)

//endpoint for get all users
app.get("/", async (request, response) =>{
    let dataUsers = await users.findAll()

    return response.json(dataUsers)
})

//endpoint add new Users
app.post("/", (request, response) =>{
    let newUsers = {
        nama: request.body.nama,
        username: request.body.username,
        password: md5(request.body.password),
        role: request.body.role
    }

    users.create(newUsers)
    .then(results =>{
        response.json({
            message : `Data Users Berhasil ditambahkan`
        })
    })
    .catch(error =>{
        response.json({
            message : error.message
        })
    })
})

//endpoint Update users
app.put("/:id_user", (request, response) =>{
    let data = {
        nama: request.body.nama,
        username: request.body.username,
        role: request.body.role
    }
    if (request.body.password) {
        data.password = md5(request.body.password)
    }
    let parameter = {
        id_user: request.params.id_user
    }

    users.update(data, {where: parameter})
    .then(results =>{
        response.json({
            message : `Data Users Berhasil diUpdate`
        })
    })
    .catch(error =>{
        response.json({
            message : error.message
        })
    })
})

//endpoint delete users
app.delete("/:id_user", (request, response) =>{
    let parameter = {
        id_user : request.params.id_user
    }
    
    users.destroy({where: parameter})
    .then(results =>{
        return response.json({
            message : `Data Users Berhasil dihapus`
        })
    })
    .catch(error =>{
        return response.json({
            message : error.message
        })
    })
})

module.exports = app