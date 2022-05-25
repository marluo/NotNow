var MailListener = require("mail-listener2-updated");
var replyParser = require("node-email-reply-parser");
const db = require("../db/db");
const incidentPoster = require("./mailIncidentPoster");
const mailCreateIncident = require("./mailCreateIncident");
const mailNotSupported = require("./mailNotSupported");

var mailListener = new MailListener({
  username: "gallskrikarn@gmail.com",
  password: "HEJsan123!",
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  markSeen: true // all fetched email willbe marked as seen and not fetched next time
});

mailListener.on("mail", function(mail, seqno, attributes) {
  const pattern = />(\d)</g;

  console.log(mail.from[0].address);

  //matches id and retreieves in order to know what incident we should post it to.
  const incidentId = mail.html.match(
    /<div id="([\s\S]*?)incidentid">(\d{0,})<\/div>/
  );

  //get id out of the regex

  //prevent new Incidents from being created
  const newIncident = mail.subject.match(
    /Incident with id ([\s\S]*?) has been created/
  );

  console.log(newIncident);

  const hee = replyParser(mail.html);
  const gee = hee.getFragments();

  //some mailboxes doesnt send text with email, which

  //if subject doesnt include info about being a new incident
  //to solve in the future, add hidden text
  if (!incidentId && !newIncident) {
    const emailParsed = replyParser(mail.text);

    //save the fragmens
    const fragmentx = emailParsed.getFragments();

    //create a new incident
    mailCreateIncident(
      mail.from[0].address,
      mail.subject,
      fragmentx[0].getContent()
    );

    //if a new incident exists in the "Header" we know its a reply
  } else if (incidentId && newIncident) {
    const idOfIncident = incidentId[2];
    console.log("Test", incidentId[2]);

    //parse email with lib
    /*

      const whiteSpaceFixMail = emailStripped.replace(/\s+/g, " ");
      console.log(whiteSpaceFixMail);
    } else {*/

    //parsing the email
    const emailParsed = replyParser(mail.text);

    //save the fragmens
    const fragment = emailParsed.getFragments();

    console.log(idOfIncident);

    //FIXA SÅ ATT om man skickar in med mail, så får man inget reply mail tillbaka
    //only send back content, make sure it is not a signature
    if (!fragment[0].isSignature()) {
      incidentPoster(
        mail.from[0].address,
        idOfIncident,
        fragment[0].getContent()
      );
    }
  }

  // do something with mail object including attachments

  /*const signature = "<" + mail.html.substring(signatureHTML, mail.html.length);

  const strippedSig = signature.replace(
    /<{1}[^<>$]{1,}>{1}|(?:\\r\\n|\\r|\\n[a-z]{0,3})|-{2,}/g,
    " "
  );

  const whitespaceSigStripped = strippedSig.replace(/\s+/g, " ");
  const emailStripped = emailMessage.replace(
    /<{1}[^<>$]{1,}>{1}|(?:\\r\\n|\\r|\\n[a-z]{0,3})|-{2,}/g,
    " "
  );

  const whiteSpaceFixMail = emailStripped.replace(/\s+/g, " ");

  const splittedSig = whitespaceSigStripped.trim().split(" ");
  const splittedEmail = whiteSpaceFixMail.trim().split(" ");

  splittedSig.forEach(text => {
    splittedEmail.forEach(emailtxt => {
      console.log("TEST", emailtxt, text);
      if (text == emailtxt) {
        let index = splittedEmail.indexOf(emailtxt);
        splittedEmail.splice(index, 1);
      }
    });
  });*/

  // mail processing code goes here
});

mailListener.on("server:connected", function() {
  console.log("imapConnected!!!");
});

mailListener.on("server:disconnected", function() {
  console.log("imapDisconnected");
});
// start listening

module.exports = mailListener;
