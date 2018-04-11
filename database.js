const pg = require('pg-promise')();
//change database name accordingly
const dbConfig = 'postgres://james@localhost:5432/phoneApp';
const db = pg(dbConfig);

let addContact =  (contact) => {
    console.log(contact);
    let { firstname, lastname, email } = contact;
    let query = `INSERT INTO contacts
    (firstname, lastname, email)
    VALUES ('${firstname}', '${lastname}', '${email}');`;
    console.log(query);
    return db.query(query);
};

let getAllContacts = () => db.query('SELECT * FROM contacts;');

let getSingleContact = (id) => db.query(`SELECT * FROM contacts 
 WHERE userid = '${id}';`);

let deleteContact = (id) => db.query(`DELETE FROM contacts 
 WHERE userid = '${id}';`);

let updateContact = (contact) => db.query(`UPDATE contacts 
 SET firstname = '${contact.firstname}',
    lastname = '${contact.lastname}',
    email = '${contact.email}'
 WHERE userid = '${contact.userid}';`); 

module.exports = {
    addContact,
    getAllContacts,
    deleteContact,
    updateContact,
    getSingleContact
};
