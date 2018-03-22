const http = require('http');

let contacts = [
    { id: 0, first: 'James', last: 'Dougal', email: 'james@gmail.com' },
    { id: 1, first: 'Rebecca', last: 'Martin', email: 'rebecca@gmail.com' },
    { id: 2, first: 'Laura', last: 'Love', email: 'laura@gmail.com' },
];

let lastId = 2;

let findContact = id => {
    id = parseInt(id, 10);
    return contacts.find(contact => contact.id === id);
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

let getContactsRoute = (request, response) => { response.end(JSON.stringify(contacts)) };

let postContactsRoute = (request, response) => {
    readBody(request, (body) => {
        let contact = JSON.parse(body);
        contact.id = ++lastId;
        contacts.push(contact);
        response.end('Created contact!');
    });
};

let deleteContactRoute = (request, response, params) => {
    let id = params[0];
    let contact = findContact(id);
    deleteContact(contact);
    console.log(contact);
    response.end('Deleted contact!');
};

let getContactRoute = (request, response, params) => {
    let id = params[0];
    let contact = findContact(id);
    response.end(JSON.stringify(contact));
};

let putContactRoute = (request, response) => {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    readBody(request, (body) => {
        let newParams = JSON.parse(body);
        Object.assign(contact, newParams);
        response.end('Updated contact!');
    });
};

let notFound = (request, response) => {
    response.statusCode = 404;
    response.end('404, nothing here!');
};

let routes = [
    { method: 'DELETE', path: /^\/contacts\/([0-9]+)$/, handler: deleteContactRoute },
    { method: 'GET', path: /^\/contacts\/([0-9]+)$/, handler: getContactRoute },
    { method: 'PUT', path: /^\/contacts\/([0-9]+)$/, handler: putContactRoute },
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContactsRoute },
    { method: 'POST', path: /^\/contacts\/?$/ , handler: postContactsRoute },
];

let server = http.createServer((request, response) => {
    console.log(request.method, request.url);
    let params = [];
    let matchedRoute;
    for (let route of routes ) {
        let match = matches(request, route.method, route.path);
        if (match) {
            matchedRoute = route;
            params = match;
            break;
        }
    }
    (matchedRoute ? matchedRoute.handler : notFound)(request, response, params);
});
server.listen(3000);