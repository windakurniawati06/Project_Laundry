const express = require("express")
const app = express()
app.use(express.json())

//call model
const models = require("../models/index")
const { request, response } = require("./users")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi

//panggil fungsi auth -> validasi token
const {auth} = require("./login")

//fungsi auth dijadikan middleware
app.use(auth)

//endpoint get transaksi
app.get("/", async (request, response)=>{
    let dataTransaksi = await transaksi.findAll({
        include: [
            { model: models.member, as: "member"},
            { model: models.users, as: "user"},
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: [
                    {model: models.paket, as:"paket"}
                ]
            }
        ]
    })
    return response.json(dataTransaksi)
})

//endpoint new transaksi
app.post("/",(request,response) =>{
    let newTransaksi = {
        id_member : request.body.id_member,
        tgl : request.body.tgl,
        batas_waktu : request.body.batas_waktu,
        tgl_bayar : request.body.tgl_bayar,
        status : 1,
        dibayar : request.body.dibayar,
        id_user : request.body.id_user
    }

    transaksi.create(newTransaksi)
    .then(result =>{
        //jika insert transaksi berhasil, lanjut
        //insert data detail transaksinya
        let newIDTransaksi = result.id_transaksi

        let detail = request.body.detail_transaksi
        for (let i = 0; i < detail.length; i++) {
            detail[i].id_transaksi = newIDTransaksi    
        }

        //proses insert detail transaksi
        detail_transaksi.bulkCreate(detail)
        .then(result=>{
            return response.json({
                message :`Data transaksi berhasil ditambahkan!`
            })
        })
        .catch(error =>{
            return response.json({
                message: error.message
            })
        })

    })
    .catch(error =>{
        return response.json({
            message : error.message
        })
    })
})

app.put("/:id_transaksi", async(request, response) =>{
    //tampung data untuk update tabel transaksi
    let dataTransaksi = {
        id_member : request.body.id_member,
        tgl : request.body.tgl,
        batas_waktu : request.body.batas_waktu,
        tgl_bayar : request.body.tgl_bayar,
        status : request.body.status,
        dibayar : request.body.dibayar,
        id_user : request.body.id_user
    }
    //tampung parameter id_transaksi
    let parameter = {
        id_transaksi: request.params.id_transaksi
    }

    transaksi.update(dataTransaksi, {where : parameter})
    .then(async (result) =>{
        await detail_transaksi.destroy({where : parameter})
        
        //masukan data detail yang baru
        let detail = request.body.detail_transaksi
        for (let i = 0; i < detail.length; i++) {
            detail[i].id_transaksi = request.params.id_transaksi    
        }

        //proses insert detail transaksi
        detail_transaksi.bulkCreate(detail)
        .then(result => {
            return response.json({
                message : `Data transaksi berhasil diUPDATE!`
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
    //setelah berhasil update ke table transaksi,
    //data detail transaksi yg lama dihapus semua berdasarkan
    //id_transaksi

    //setelah dihapus, dimasukan lagi menggunakan bulkCreate
})

//Update status Transaksi
app.post("/status/:id_transaksi",(request, response) => {
    //kita tampung nilai status
    let data = {
        status: request.body.status
    }

    //kita tampung parameter
    let parameter = {
        id_transaksi: request.params.id_transaksi
    }

    //proses update status transaksi
    transaksi.update(data, {where: parameter})
    .then(result => {
        return response.json({
            message : `Data STATUS berhasil di UPDATE!`
        })
    })
    .catch(error =>{
        response.json({
            message : error.message
        })
    })
})

//endpoint DELETE transaksi
app.delete( "/:id_transaksi", (request, response) => {

    //parameter kurang satu untuk memanggil transaction_id di tabel transaction_details
    let parameter = {
        id_transaksi: request.params.id_transaksi
    }

    //delete data transaction
    detail_transaksi.destroy({where: parameter})
    .then(result => {
        transaksi.destroy({where: parameter})
        .then(result => {
            return response.json({
                message: `Data berhasil di HAPUS!`
            })
        })
        .catch(error => {
            return response.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        return response.json({
            message: error.message
        })
    })
})

//endpoint untuk mengubah status pembayaran
app.get("/bayar/:id_transaksi",(request, response) =>{
    let parameter ={
        id_transaksi: request.params.id_transaksi
    }

    let data = {
        //untuk mendapatkan tanggal saat ini
        tgl_bayar: new Date().toISOString().split("T")[0],
        dibayar: true 
    }

    //proses ubah transaksi
    transaksi.update(data, {where: parameter})
    .then(result =>{
        return response.json({
            message : `Transaksi telah berhasil Dibayar!`
        })
    })
    .catch(error=>{
        return response.json({
            message : error.message
        })
    })
})

module.exports = app