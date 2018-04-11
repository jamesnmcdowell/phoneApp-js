const http = require('http');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const {
    addContact,
    getAllContacts,
    deleteContact,
    updateContact,
    getSingleContact
} = require('../database');

let readBody = (request) => {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => { body += chunk.toString() });
        request.on('end', () => { resolve(body) });
        request.on('error', (err) => {
            reject(err);
        });
    });
};

let matches = (request, method, path) => {
    let match = path.exec(request.url);
    return request.method === method && (match && match.slice(1));
};

let getSuffix = (fullUrl, prefix) => fullUrl.slice(prefix.length);

let getContactsRoute = async (req, res) => {
    let results = await getAllContacts();
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.end(JSON.stringify(results));
};

let postContactsRoute = async (request, response) => {
    let results = await readBody(request);
    let contact = JSON.parse(results);
    try {
        let results = await addContact(contact);
        response.end('contact posted');
    } catch (error) {
        response.end(error);
    };
};

let deleteContactRoute = async (request, response, params) => {
    let userid = params[0];
    let result = await deleteContact(userid);
    response.end('Deleted contact!');
};

let getContactRoute = async (request, response, params) => {
    let userid = params[0];
    let result = await getSingleContact(userid);
    response.end(JSON.stringify(result));
};

let putContactRoute = async (request, response) => {
    let userid = getSuffix(request.url, '/contacts/');
    let result = await readBody(request);
    let newParams = JSON.parse(result);
    console.log(newParams);
    updateContact(newParams);
    response.end('Updated contact!');
};

let notFound = (request, response) => {
    response.statusCode = 404;
    response.end('404, nothing here!');
};

let renderHtml = (response, html) => { response.end( html) };

let renderPage = async (request, response) => {
    try {
        let html = await readFile(`../Phonebook_Frontend${request.url}`, 'utf8');
        response.end(html);
    }
    catch (error) {
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
    };  
};

let routes = [
    { method: 'DELETE', path: /^\/contacts\/([0-9]+)$/, handler: deleteContactRoute },
    { method: 'GET', path: /^\/contacts\/([0-9]+)$/, handler: getContactRoute },
    { method: 'PUT', path: /^\/contacts\/([0-9]+)$/, handler: putContactRoute },
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContactsRoute },
    { method: 'POST', path: /^\/contacts\/?$/, handler: postContactsRoute },
];

let server = http.createServer((request, response) => {
    renderPage(request, response); 
});

server.listen(3000);