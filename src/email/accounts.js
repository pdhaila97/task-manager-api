const sgMail = require("@sendgrid/mail");
const sgApiKey = process.env.SEND_GRID_API_KEY;

sgMail.setApiKey(sgApiKey);

function sendWelcomeMail (name, email) {
    sgMail.send({
        to: email,
        from: "pdhaila97@gmail.com",
        subject: `Welcome to TaskManager ${name} !`,
        text: `Thanks for joining our community ${name}. I'm delighted to have you use this application.`
    });
}


function sendCancellationEmail (name, email) {
    sgMail.send({
        to: email,
        from: "pdhaila97@gmail.com",
        subject: `Sad to see you go...`,
        text: `Hi ${name}, We're sad to see you leave. Hope you enjoyed our service when you were here.\nPlease take some time to help us understand what we can do to make the user experience better. Thanks ! And We hope to see you soon!`
    });
}
module.exports = {
    sendWelcomeMail,
    sendCancellationEmail
}