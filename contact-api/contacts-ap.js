let http = require('http');

let contacts = [
    {id: 0, first: 'James', last: 'Dougal', email: 'james@gmail.com'},
    { id: 1, first: 'Rebecca', last: 'Martin', email: 'rebecca@gmail.com' },
    { id: 2, first: 'Laura', last: 'Love', email: 'laura@gmail.com' },
];

let lastId = 0;

let findContact = function(id) {
    id = parseInt(id, 10);
    return contacts.find(function(contact) {
        return contact.id === id;
    });
};

let deleteContact = function(contactToDelete) {
    contacts = contacts.filter(function(contact) {
        return contact !== contactToDelete;
    });
};

let readBody = function(request, callback) {
    let body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body);
    });
};

let matches = function(request, method, path) {
    return request.method === method &&
           request.url.startsWith(path);
};

let getSuffix = function(fullUrl, prefix) {
    return fullUrl.slice(prefix.length);
};

let getContactsRoute = function (request, response) {
    response.end(JSON.stringify(contacts));
};

let postContactsRoute = function (request, response) {
    readBody(request, function (body) {
        let contact = JSON.parse(body);
        contact.id = ++lastId;
        console.log(contact);
        contacts.push(contact);
        response.end('Created contact!');
    });
};

let deleteContactRoute = function (request, response) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    deleteContact(contact);
    console.log(contact);
    response.end('Deleted contact!');
};

let getContactRoute = function (request, response) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    response.end(JSON.stringify(contact));
};

let putContactRoute = function (request, response) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id);
    readBody(request, function (body) {
        let newParams = JSON.parse(body);
        console.log(newParams);
        Object.assign(contact, newParams);
        response.end('Updated contact!');
    });
};

let notFound = function (request, response) {
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

let server = http.createServer(function (request, response) {
    console.log(request.method, request.url);

    let route = routes.find(function (route) {
        return matches(request, route.method, route.path);
    });

    (route ? route.handler : notFound)(request, response);

});

server.listen(3000);