export const nodemailer = require('nodemailer');

 export function email(nom, compagnie, phone, message) {
  const output = `
                <p>You have a new contact request</p>
                <h3>Contact Details</h3>
                <ul>  
                <li>Name: ${nom}</li>
                <li>Company: ${compagnie}</li>
                <li>Phone: ${phone}</li>
                </ul>
                <h3>Message</h3>
                <p>${message}</p>
              `;
  return output;

}
        
export let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
            user: 'foo@example.com', 
            pass: 'password',  
          },
});