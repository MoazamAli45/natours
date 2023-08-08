const nodemailer = require('nodemailer');

const smtpTransport = require('nodemailer-smtp-transport');
const pug = require('pug');
// convvert html to text for email template
// NOT WORKING
// const htmlToText = require('html-to-text');

const htmlToText = (html) => {
  // Remove HTML tags using a regular expression
  const plainText = html.replace(/<[^>]*>/g, '');

  // Replace multiple spaces and newlines with a single space
  const formattedText = plainText.replace(/\s+/g, ' ');

  return formattedText.trim();
};
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Syed Moazam Ali <syedmoazamali4321@gmail.com>';
  }
  createTransport() {
    if (process.env.NODE_ENV === 'development') {
      // mailtrap
      return nodemailer.createTransport(
        smtpTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false, // Use true if you're using SSL/TLS
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        }),
      );
    }
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com', // Replace with Brevo SMTP server hostname
      port: 587, // Replace with Brevo SMTP server port
      secure: false, // Use TLS
      auth: {
        user: process.env.BREVO_USER, // Replace with your SMTP username
        pass: process.env.BREVO_KEY, // Replace with your SMTP password
      },
    });
  }
  send(template, subject) {
    // render the template
    // console.log(__dirname);
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    //  email options
    const mailOptions = {
      from: this.from,
      // options will come from auth controller
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    // send Email
    const transporter = this.createTransport();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
  sendWelcome() {
    this.send('welcome', 'Welcome To Natours from AlSyed Developers');
  }
  sendResetToken() {
    this.send('resetPassword', 'Reset Password Token (Valid for 10 minutes)');
  }
};

// const sendEmail = async (options) => {
//   // TRANSPORTER
//   const transporter = nodemailer.createTransport(
//     smtpTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: false, // Use true if you're using SSL/TLS
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     }),
//   );

//   //  EMAIL OPTIONS
//   const mailOptions = {
//     from: 'Syed Moazam Ali <syedmoazamali4321@gmail.com>',
//     // options will come from auth controller
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html
//   };

//   // SEND EMAIL
//   // transporter.sendMail(mailOptions, (error, info) => {
//   //   if (error) {
//   //     console.log('Error:', error);
//   //   } else {
//   //     console.log('Email sent:', info.response);
//   //   }
//   // });

//   // ANOTHER WAY AS WE ARE USING ASYNC AWAIT INSTEAD OF CALLBACK WILL CATCH ERROR IN AUTH CONTROLLER
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
