var http = require('http');

var contacts = [
    {id: 0, first: 'James', last: 'Dougal', email: 'james@gmail.com'},
    { id: 1, first: 'Rebecca', last: 'Martin', email: 'rebecca@gmail.com' },
    { id: 2, first: 'Laura', last: 'Love', email: 'laura@gmail.com' },
];

var lastId = 0;

var findContact = function(id) {
    id = parseInt(id, 10);
    return contacts.find(function(contact) {
        return contact.id === id;
    });
};

var deleteContact = function(contactToDelete) {
    contacts = contacts.filter(function(contact) {
        return contact !== contactToDelete;
    });
};

var readBody = function(request, callback) {
    var body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body);
    });
};

var matches = function(request, method, path) {
    return request.method === method &&
           request.url.startsWith(path);
};

var getSuffix = function(fullUrl, prefix) {
    return fullUrl.slice(prefix.length);
};

var server = http.createServer(function(request, response) {
    console.log(request.method, request.url);

    if (matches(request, 'GET', '/contacts')) {
        response.end(JSON.stringify(contacts));
    } else if (matches(request, 'POST', '/contacts')) {
        readBody(request, function(body) {
            var contact = JSON.parse(body);
            contact.id = ++lastId;
            console.log(contact);
            contacts.push(contact);
            response.end('Created contact!');
        });
    } else if (matches(request, 'DELETE', '/contacts/')) {
        var id = getSuffix(request.url, '/contacts/');
        var contact = findContact(id);
        deleteContact(contact);
        console.log(contact);
        response.end('Deleted contact!');
    } else if (matches(request, 'GET', '/contacts/')) {
        var id = getSuffix(request.url, '/contacts/');
        var contact = findContact(id);
        response.end(JSON.stringify(contact));
    } else if (matches(request, 'PUT', '/contacts/')) {
        var id = getSuffix(request.url, '/contacts/');
        var contact = findContact(id);
        readBody(request, function(body) {
            var newParams = JSON.parse(body);
            Object.assign(contact, newParams);
            response.end('Updated contact!');
        });
    } else {
        response.end('404, nothing here!');
    }
});

server.listen(3000);