const express = require('express');
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
const cors = require("cors");
const validator = require('email-validator');
const sanitizeHtml = require('sanitize-html');
const csp = require('./middleware/csp');
const crypto = require('crypto');
const { json } = require('express');

require("dotenv").config();
const app = express();

const PORT  = process.env.PORT || 5001;

app.use(cors({ origin: "*" }));

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        serviceClient: process.env.CLIENT_ID,
        privateKey: process.env.PRIVATE_KEY
    },
});
  
// verify connection configuration
transporter.verify(function (error, success) {
if (error) {
    console.log(error);
} else {
    console.log("Server is ready to recieve messages");
}
});

app.post("/send", (req, res) => {
    let form = new multiparty.Form();
    let data = {};
    form.parse(req, function (err, fields) {
        Object.keys(fields).forEach(function (property) {
        data[property] = fields[property].toString();
        });
        console.log(data);
        const {firstname, lastname, email, message, honeypot} = data;

        if (honeypot) {
            console.log(`Bot Data: \n${JSON.stringify(data)}`)
            res.status(200).send({message: "Message Sent!"})
            return
        };

        const cleanMessage = sanitizeHtml(
            message,
            {allowedTags: []}
        );

        if (!firstname || !lastname || !email || !cleanMessage) res.status(400).send({message: 'Please fill all fields.'});

        if (!validator.validate(email)) res.status(400).send({message: 'Invalid Email'});

        const name = `${firstname} ${lastname}`
        const mail = {
        from: 'no-reply@quintusentialconsulting.com',
        to: process.env.EMAIL, // receiver email,
        subject: 'Inquiry from ' + email,
        text: `Name: ${name} \nEmail: ${email}  \n\n ${cleanMessage}`,
        };
        transporter.sendMail(mail, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send({message: "Something went wrong."})
        } else {
            res.status(200).send({message: "Message Sent!"})
        }
        });
    });
});

//Middleware
app.use(express.static('public'));
app.get('/', (req, res) => {
    let nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' https://fonts.googleapis.com; frame-src 'self'`
    );
    csp('index.html', nonce)
});

app.listen(PORT);
console.log('Server started at http://localhost:' + PORT);