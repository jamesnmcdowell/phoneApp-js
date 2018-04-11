let container = document.querySelector('.contacts');
let contactTemplate = document.querySelector('#contact-template').content;

console.log(contactTemplate);
let renderContact = contact => {
  let contactRow = contactTemplate.cloneNode(true);
  Object.entries(contact).forEach(([prop, val]) => {
    contactRow.querySelector(`.contact-${prop}`).textContent = val;
  })

  let root = contactRow.children[0];

  contactRow.querySelector('.contact-remove')
    .addEventListener('click', () => removeContact(contact, root));

  return contactRow;
};

let removeContact = async (contact, row) => {
  await fetch(`http://localhost:3000/contacts/${contact.id}`, { method: 'DELETE' });
  container.removeChild(row);
};

(async () => {
  let contacts = await (await fetch('http://localhost:3000/contacts')).json();
  console.log(contacts);
  let contactRows = contacts.map(contact => renderContact(contact));
  for (let row of contactRows) {
    container.appendChild(row);
  }
})()








// let addContact =  (contact) => {
//   fetch(`/contacts`, {
//     method: 'POST',
//     body: JSON.stringify(contact)
//    })
//   //.then(function (response) {
//   //   return response.json();
//   // }).then(function (data) {
//   //   console.log('you posted somehting')
//   // });
// };



// let form = document.querySelector("form");

// let isValidElement = element => element.name && element.value;
// let isValidValue = element => !['checkbox', 'radio'].includes(element.type) || element.checked;
// let isCheckbox = element => element.type === 'checkbox';

// let formToJSON = elements => [].reduce.call(elements, (data, element) => {
//   if (isValidElement(element) && isValidValue(element)) {
//     if (isCheckbox(element)) {
//       data[element.name] = (data[element.name] || []).concat(element.value);
//     } else {
//       data[element.name] = element.value;
//     }
//   }
//   return data;
// }, {});

// let handleFormSubmit = event => {
//   event.preventDefault();
//   let data = formToJSON(form.elements);
//   // postData(data).then(getData).then(render);
//   console.log(data);
//   addContact(data);
// };

// form.addEventListener('submit', handleFormSubmit);

// document.querySelector('.add-contact')
//   .addEventListener('click', () => {
//     addContact(contact)
//   });