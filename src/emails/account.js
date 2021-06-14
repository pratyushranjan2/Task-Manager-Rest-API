const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

// sgMail.send({
//     to: 'pratyushranjan02@gmail.com',
//     from: 'pratyushranjan02@gmail.com',
//     subject: 'Sent from SendGrid Email API',
//     text: 'Hello Send Grid!'
// });

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'pratyushranjan02@gmail.com',
        subject: 'Welcome to Nodejs',
        text: `Get lost, ${name}.`,
    });
}

const sendCancellationEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'pratyushranjan02@gmail.com',
        subject: 'We hated you already',
        text: 'Thankyou. We can finally breathe.'
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}