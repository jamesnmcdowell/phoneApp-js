const http = require('http');
const fs = require('fs');
const db = require('../database');

// let contacts = [
//     { id: 0, first: 'James', last: 'Dougal', email: 'james@gmail.com' },
//     { userid: 1, first: 'Rebecca', last: 'Martin', email: 'rebecca@gmail.com' },
//     { userid: 2, first: 'Laura', last: 'Love', email: 'laura@gmail.com' },
// ];

// let lastId = 2;

let findContact = userid => {
    userid = parseInt(userid, 10);
    return contacts.find(contact => contact.userid === userid);
};

let deleteContact = contactToDelete => {
    contacts = contacts.filter(contact => contact !== contactToDelete);
};

let readBody = (request, callback) => {
    let body = '';
    request.on('data', chunk => { body += chunk.toString() });
    request.on('end', () => { callback(body) });
};

let matches = (request, method, path) => {
    let match = path.exec(request.url);
    return request.method === method && (match && match.slice(1));
};

let getSuffix = (fullUrl, prefix) => fullUrl.slice(prefix.length);

let getContactsRoute = (request, response) => { 
    
    console.log('getcontactsroute');
    db.query('select * from contacts')
        .then(results => {
            console.log(JSON.stringify(results));
            response.end(JSON.stringify(results));
        })
        .catch( err => {
            console.log(err)
        }) 
};

let postContactsRoute = (request, response) => {
    readBody(request, (body) => {
        let contact = JSON.parse(body);
        contacts.push(contact);
        response.end('Created contact!');
    });
};

let deleteContactRoute = (request, response, params) => {
    let userid = params[0];
    let contact = findContact(userid);
    deleteContact(contact);
    console.log(contact);
    response.end('Deleted contact!');
};

let getContactRoute = (request, response, params) => {
    let userid = params[0];
    let contact = findContact(userid);
    response.end(JSON.stringify(contact));
};

let putContactRoute = (request, response) => {
    let userid = getSuffix(request.url, '/contacts/');
    let contact = findContact(userid);
    readBody(request, (body) => {
        let newParams = JSON.parse(body);
        Object.assign(contact, newParams);
        response.end('Updated contact!');
    });
    console.log('posted contact!')
};

let notFound = (request, response) => {
    response.statusCode = 404;
    response.end('404, nothing here!');
};

let renderHtml = (response, html) => { response.end( html) };

let renderPage = (request, response) => {
    fs.readFile(`../Phonebook_Frontend${request.url}`, 'utf8', (err, html) => {
        if (err) {
            console.log(request.method, request.url);
            let params = [];
            let matchedRoute;
            for (let route of routes) {
                let match = matches(request, route.method, route.path);
                if (match) {
                    matchedRoute = route;
                    params = match;
                    break;
                }
            }
            (matchedRoute ? matchedRoute.handler : notFound)(request, response, params);
            
        }

        response.end(html);
        // console.log(html);
        
    }); 
    
};

let routes = [
    { method: 'DELETE', path: /^\/contacts\/([0-9]+)$/, handler: deleteContactRoute },
    { method: 'GET', path: /^\/contacts\/([0-9]+)$/, handler: getContactRoute },
    { method: 'PUT', path: /^\/contacts\/([0-9]+)$/, handler: putContactRoute },
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContactsRoute },
    { method: 'POST', path: /^\/contacts\/?$/, handler: postContactsRoute },
    // { method: 'GET', path: /^[a-zA-z.]$/, handler: renderPage},
];



let server = http.createServer((request, response) => {
    renderPage(request, response);
    
});
server.listen(3000);


// CREATE TABLE contacts
//     (
//     userid serial PRIMARY KEY,
//     firstname character varying(200) NOT NULL,
//     lastname character varying(200) NOT NULL,
//     email character varying(300) NOT NULL
//     );

// INSERT INTO contacts(userid, firstname, lastname, email)
// VALUES
//     (DEFAULT, 'james', 'mcdowell', 'james@gmail.com');

// INSERT INTO contacts(userid, firstname, lastname, email)
// VALUES
//     (DEFAULT, 'josh', 'john', 'josh@gmail.com');

// INSERT INTO contacts(userid, firstname, lastname, email)
// VALUES
//     (DEFAULT, 'laura', 'love', 'laura@gmail.com');