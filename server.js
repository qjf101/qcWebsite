const express = require('express');
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
const cors = require("cors");
const validator = require('email-validator');
const sanitizeHtml = require('sanitize-html');
const csp = require('./middleware/csp');
const crypto = require('crypto');
const geoip = require('geoip-lite');
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
app.use(express.static('public'), (req,res, next) => {
    const frmBCard = req.query.source === 'bCardG1';

    if (frmBCard) {
        console.log(req.query.source);
        let ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
        if (ip.substring(0, 7) == "::ffff:") {
            ip = ip.substring(7)
        }
        let geo = geoip.lookup(ip);
        console.log(ip)
        console.log(geo)
        
        let date_ob = new Date();
        let day = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let date = year + "-" + month + "-" + day;
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        
        console.log(dateTime);

        const mail = {
            from: 'no-reply@quintusentialconsulting.com',
            to: process.env.EMAIL, // receiver email,
            subject: `Business card scanned by: ${ip}`,
            text: `Ip: ${ip} \nDate: ${dateTime}  \n\n Location: ${geo}`,
        };

        if (ip != '::1') {
            transporter.sendMail(mail, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log('card scan msg sent')
            }
            });
        }
    }

    next()
});

const generateNonce = () => {
    return crypto.randomBytes(16).toString('base64');
};

app.get('/', csp('index.html', generateNonce()),  (req, res) => {

});

app.listen(PORT);
console.log('Server started at http://localhost:' + PORT);