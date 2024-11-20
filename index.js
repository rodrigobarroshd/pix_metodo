import axios from "axios";
import express from "express";
import { Payment } from "mercadopago";

const app = express()
app.use(express.json())

const prodkey = "APP_USR-4565008394740498-081914-5ab1134511029c41bb24f00de1e71f4a-203869457"
const testkey = "TEST-4565008394740498-081914-b78b35b2272dece9e4361137e5ef56a7-203869457"
app.get("/api/getpayment/:paymentid", async (req, res) => {
    try {

        const paymentId = req.params.paymentid;
        const payment = await new Payment({
            accessToken: prodkey
        }).get({
            id: paymentId
        });

        // Responding with the relevant payment data
        res.status(200).send({
            idPIX: payment.id,
            status: payment.status,
            qr_code: payment.point_of_interaction.transaction_data.qr_code,
            total_a_pagar: payment.transaction_details.total_paid_amount,
            data_expiracao: payment.date_of_expiration
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error fetching payment details" });
    }
});


app.put("/api/createpayment", async (req, res) => {
    console.log("Dados recebidos no backend:", req.body); // Inspects the data received

   await new Payment({
    accessToken: prodkey
   })
        .create({
            body: {
                transaction_amount: Number(req.body.transaction_amount),
                payment_method_id: "pix",
                payer: {
                    email: req.body.email
                },
            }
        })
        .then((response) => res.send({
            idPIX: response.id,
            status: response.status,
            qr_code: response.point_of_interaction.transaction_data.qr_code,
            total_a_pagar: response.transaction_details.total_paid_amount,
            data_expiracao: response.date_of_expiration
        })).catch(console.log)
});

app.post("/api/pagamentoatualizado", async (req, res) => {
    if(req.body.action === "payment.updated") {

        await axios({
            url: "/api/getpayment",
            headers: {
                paymentid: req.body.data.id
            }
        })
        .then(x => x.data)
        .then(async (r) => {
            if (r.response.status === "approved") {

                console.log(r)
            }
        })
        .catch(console.log)
    }
})


app.listen(3000, async () => {
    console.log("API ONLINE COM A PORTA 3000")
})