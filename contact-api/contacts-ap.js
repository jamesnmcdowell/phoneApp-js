let http = require('http');

let contacts = [
    { id: 0, first: 'James', last: 'Dougal', email: 'james@gmail.com' },
    { id: 1, first: 'Rebecca', last: 'Martin', email: 'rebecca@gmail.com' },
    { id: 2, first: 'Laura', last: 'Love', email: 'laura@gmail.com' },
];

let lastId = 0;

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

let matches = (request, method, path) => request.method === method && request.url.startsWith(path);

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

let deleteContactRoute = (request, response) => {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    deleteContact(contact);
    console.log(contact);
    response.end('Deleted contact!');
};

let getContactRoute = (request, response) => {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    response.end(JSON.stringify(contact));
};

let putContactRoute = (request, response) => {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    readBody(request, (body) => {
        let newParams = JSON.parse(body);
        console.log(newParams);
        Object.assign(contact, newParams);
        response.end('Updated contact!');
    });
};

let notFound = (request, response) => {
    response.statusCode = 404;
    response.end('404, nothing here!');
};

let routes = [
    { method: 'DELETE', path: '/contacts/', handler: deleteContactRoute },
    { method: 'GET', path: '/contacts/', handler: getContactRoute },
    { method: 'PUT', path: '/contacts/', handler: putContactRoute },
    { method: 'GET', path: '/contacts', handler: getContactsRoute },
    { method: 'POST', path: '/contacts', handler: postContactsRoute },
];

let server = http.createServer((request, response) => {
    console.log(request.method, request.url);
    let route = routes.find(route => matches(request, route.method, route.path));
    (route ? route.handler : notFound)(request, response);
});
server.listen(3000);