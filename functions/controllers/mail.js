////////////////    MAIL CONFIG  //////////////// 
// import fs from 'fs';
// import path from 'path';
import nodemailer from 'nodemailer';
let transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASS
    }
});


/** The folder with the temporary attachments */
import config from '../config/config.js';
let attachmentsFolder = config.attachmentsFolder;

//////////////////    FIREBASE CONFIG    ////////////////
import Firebase from './firebase.js';



/**
 * Sends the email with the mob data and attachments to the recipients
 * @param {object} mob The Mob object
 * @param {string} attachmentsFolder The folder (relative path) where the attachments are stored tempoparily
 */
let aboutNewMob = async (mob) => {

    //TODO: add error handling (και για το maximum size 10MB)


    let company = await Firebase.getCompany(mob.companyID);

    // prepare mail with defined transport object
    let mail = {
        from: process.env.MAILFROM, // sender address
        to: company.recipients, // list of recipients
        bcc: JSON.parse(process.env.MAILBCC || '[]'), // add adminRecipients as BCC
        subject: `Mobbing - Νέο περιστατικό - ${mob.id}`, // Subject line
        //   text: mob.description, // plain text body
        html: /*html*/`<h2>Νέο περιστατικό: ${mob.id}</h2>
                <p>Παρακαλώ, συνδεθείτε στην κονσόλα διαχείρισης για να δείτε το νέο περιστατικό.</p>
        `, // html body
    };


    // send email
    await transporter.sendMail(mail);
    console.debug("Στάλθηκε email σε Οργανισμό");
    
}


/**
 * Sends email to the company notifying about the new Message from the user
 * @param {object} mob The Mob object
 */
let aboutNewUserMessage = async (mob) => {

    // prepare mail
    let company = await Firebase.getCompany(mob.companyID);
    let message = mob.messages[mob.messages.length-1];   // the last message
    let mail = {
        from: process.env.MAILFROM, // sender address
        to: company.recipients, // list of recipients
        bcc: JSON.parse(process.env.MAILBCC || '[]'), // add adminRecipients as BCC
        subject: `Mobbing - Περιστατικό ${mob.id} - Νέο μήνυμα`, // Subject line
        html: /*html*/`<h2>Υπάρχει νέο μήνυμα για το περιστατικό ${mob.id}.</h2>
                <p>Παρακαλώ, συνδεθείτε στην κονσόλα διαχείρισης για να δείτε το νέο μήνυμα.</p>
        `, // html body
    };

    // send email
    await transporter.sendMail(mail);
    console.debug("Στάλθηκε email σε Οργανισμό");

};



/**
 * Sends email to the user notifying about the new update from the company
 * @param {object} mob The Mob object
 */
let aboutCaseUpdate = async (mob) => {
    if (mob.submitter?.email==null || mob.submitter?.email=="") {   // μπορεί να είναι "" αντί για undefined
        console.debug("Δεν υπάρχει email αναφέροντος προς ειδοποίηση");
        return false;
    }

    let email = {
        from: process.env.MAILFROM, // sender address
        to: mob.submitter.email, // one recipient only!
        subject: `Mobbing - Περιστατικό ${mob.id}`, // Subject line
        html: /*html*/`<h2>Περιστατικό ${mob.id}</h2>
                <p>Υπάρχει νέα ενημέρωση ή νέο μήνυμα σχετικά με το περιστατικό ${mob.id}. </p>
                <p>Παρακαλώ, εισέλθετε στη σελίδα με τον αριθμό του περιστατικού και το PIN που γνωρίζετε, για να δείτε τη νέα κατάσταση.</p>
        `, // html body
    }

    // send email
    await transporter.sendMail(email);
    console.debug("Στάλθηκε email σε καταγγέλλοντα");
    return true
};


export default { aboutNewMob , aboutNewUserMessage , aboutCaseUpdate };