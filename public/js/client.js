const socket = io('http://localhost:8000');
const backendAPIs='http://localhost:3000'
// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp')
const messageContainer = document.querySelector(".container")
const names = document.getElementById('names');
const searchBoxForm = document.getElementById('search');
const searchText = document.getElementById('searchtext');
const title1 = document.getElementById('title1');
const imageInp = document.getElementById("imageInp");
const token=localStorage.getItem('token')
const id=localStorage.getItem('id')
const name = localStorage.getItem('name')
const groupId = localStorage.getItem('groupId');
const groupName = localStorage.getItem('groupName');
let userEmail = localStorage.getItem('email');


// Audio that will play on receiving messages
// var audio = new Audio('ting.mp3');

// Function which will append event info to the contaner
const append = (message, position)=>{
    console.log(message);
    message1=message.split(' ')
    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if(pattern.test(message1[1])==true){
        console.log(1);
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<img src="${message1[1]}" alt="Image" width="500" height="300"/>`;
        messageElement.classList.add('message');
        messageElement.classList.add(position);
        messageContainer.append(messageElement);
    }
    else{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    // if(position =='left'){ 
    //     audio.play();
    // }
    }
}

const addChats = (message,userId,userName, position)=>{
    const messageElement = document.createElement('div');
    
    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
if(userId==id){
    // console.log(1)
    if (pattern.test(message) === true) {
        const imageContainer = document.createElement('div');
        const imageElement = document.createElement('img');
        imageElement.setAttribute('src', message);
        imageElement.setAttribute('alt', 'Image');
        imageElement.setAttribute('width', '300');
        imageElement.setAttribute('height', '300');
        imageContainer.appendChild(imageElement);
        imageContainer.classList.add('image-container');
        messageElement.appendChild(imageContainer);
        // messageElement.classList.add('message');
        messageElement.classList.add('right');
    }
    // if(pattern.test(message)==true){
    //     console.log(1);
    //     messageElement.innerHTML = `<img src="${message}" alt="Image" width="300" height="300"/>`;
    //     messageElement.classList.add('message');
    // //     messageElement.classList.add(position);
    //     messageElement.classList.add('right');
    // }
    else{
    messageElement.innerText = `${userName}:${message}`;
    messageElement.classList.add('message');
//     messageElement.classList.add(position);
    messageElement.classList.add('right');
    }
}
else{
    // if(pattern.test(message)==true){
    //     messageElement.innerHTML = `<img src="${message}" alt="Image" width="500" height="300"/>`;
    //     messageElement.classList.add('message');
    //     // messageElement.classList.add(position);
    //     messageElement.classList.add('left');
    // }
    if (pattern.test(message) === true) {
        const imageContainer = document.createElement('div');
        const imageElement = document.createElement('img');
        imageElement.setAttribute('src', message);
        imageElement.setAttribute('alt', 'Image');
        imageElement.setAttribute('width', '300');
        imageElement.setAttribute('height', '300');
        imageContainer.appendChild(imageElement);
        imageContainer.classList.add('image-container');
        messageElement.appendChild(imageContainer);
        // messageElement.classList.add('message');
        messageElement.classList.add('right');
    }
    else{
        messageElement.innerText = `${userName}:${message}`;
    messageElement.classList.add('message');
    // messageElement.classList.add(position);
    messageElement.classList.add('left');
    }
    
}
messageContainer.append(messageElement);
// if(position =='left'){ 
//     audio.play();
// }
}



// Ask new user for his/her name and let the server know
// const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// If a new user joins, receive his/her name from the server
// socket.on('user-joined', name =>{
//     append(`${name} joined the chat`, 'right')
// })

// If server sends a message, receive it
socket.on('receive', data =>{
    append(`${data.name}: ${data.message}`, 'left')
})

// If a user leaves the chat, append the info to the container
// socket.on('left', name =>{
//     append(`${name} left the chat`, 'right')
// })

// If the form gets submitted, send server the message
form.addEventListener('submit',async (e) => {
    e.preventDefault();
    
    const message = messageInput.value;
    let chatObj = {
        chat: message
    }
    const post = await axios.post(`http://localhost:3000/send/${groupId}`, chatObj, { headers: {'Authorization': token} })
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''
})


window.addEventListener("DOMContentLoaded",dom())
 async function dom (){
    try {
        title1.innerText = `Welcome to ${groupName} Group`;
        const ul = document.querySelector(".container")
        let len = 0;
    let oldMessage = localStorage.getItem("messages");
    let oldMessages = oldMessage?JSON.parse(oldMessage):[{}];
    const msg = oldMessages;
    // console.log(oldMessages);
    for (let i = 1; i < oldMessages.length; i++) {
                addChats(oldMessages[i].chat,oldMessages[i].userId,oldMessages[i].userName,'right')
            }
    let lastMessage = (oldMessages[oldMessages.length - 1]);
       
        const response = await axios.get(`http://localhost:3000/allChats/${groupId}?lastId=${lastMessage.id}`, { headers: { 'Authorization': token } });
        const chats = response.data.chats;
        const length = chats.length;
        // console.log(length);
        // console.log(len);
        if (len !== length) {
            for (let i = len; i < length; i++) {
                if(msg.length<=10){
                    msg.push(chats[i]);
                }else if(msg.length>10){
                    msg.shift();
                    msg.push(chats[i]);
                }
                // console.log(oldMessages);
                addChats(chats[i].chat,chats[i].userId,chats[i].userName,'right')
            }
            console.log(msg)
            localStorage.setItem("messages", JSON.stringify(msg));
        }
        len = length;
        await openBox()
        ul.scrollTop = ul.scrollHeight;
    } catch (error) {
        console.log(error);
    }
    
}

searchBoxForm.addEventListener('click', async (e) => {
    
        try {
            e.preventDefault();
            const email1 = searchText.value
            const response = await axios.post(`${backendAPIs}/addUser/${groupId}`, { email: email1 }, { headers: { 'Authorization': token } });

            displayNameForOther(response);

            alert(response.data.message);
            window.location.reload()
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }

        searchText.value = "";
        window.location.reload()
    
})


//users
let numOfUsers;
async function openBox() {
    const users = await axios.get(`${backendAPIs}/allUsers/${groupId}`);
    
    numOfUsers = users.data.userDetails.length;
    
    names.innerHTML = `
    <li class="list-group-item"><u>User(${numOfUsers})</u><span style="float:right;"><u>Admin Status</u></span></li>
    `
    if (users.data.adminEmail.includes(userEmail)) {
        users.data.userDetails.forEach(user => {
            displayNameForAdmin(user);
        })
    } else {
        users.data.userDetails.forEach(user => {
            displayNameForOther(user);
        })
    }

}
function displayNameForAdmin(user) {
    if (user.isAdmin) {
        names.innerHTML += `
        <li class="list-group-item" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton" onClick="removeAdmin('${user.email}')">remove admin</button></li>
        `
    } else {
        names.innerHTML += `
        <li class="list-group-item" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton" onClick="makeAdmin('${user.email}')">make admin</button></li>
        `
    }
    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
    }
}

async function makeAdmin(email) {
    // console.log(email);
    try {
        const response = await axios.post(`${backendAPIs}/makeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
        // console.log(response);
        document.getElementById(`admin${email}`).innerText = 'remove admin';
        document.getElementById(`admin${email}`).setAttribute('onClick', `removeAdmin('${email}')`);

        alert(response.data.message);
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }

}

async function deleteUser(email) {
    if (confirm('Are you sure')) {
        try {
            console.log(email);
            const response = await axios.post(`${backendAPIs}/deleteUser/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            console.log(response);
            names.removeChild(document.getElementById(`name${email}`));
            
            numOfUsers = +numOfUsers - 1;
            names.firstElementChild.firstElementChild.innerText = `User(${numOfUsers})`;

            alert(response.data.message);
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    }
}

async function removeAdmin(email) {
    try {
        if(confirm(`Are you sure ?`)){
            console.log(email);
            const response = await axios.post(`${backendAPIs}/removeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            console.log(response);
            document.getElementById(`admin${email}`).innerText = 'make admin';
            document.getElementById(`admin${email}`).setAttribute('onClick', `makeAdmin('${email}')`);
    
            alert(response.data.message);
        }
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }
}

function displayNameForOther(user) {
    if (user.isAdmin) {
        names.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</button><button class="userButton">✔️</button></li>
        `
    } else {
        names.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</li>
        `
    }

    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
        document.getElementById(`name${userEmail}`).innerHTML += `
        <button class="delete" onClick="deleteUser('${userEmail}')">X</button>
        `
    }
}

async function uploadFile(){
    try{
        const upload = document.getElementById('uploadFile');
        const formData = new FormData(upload);
        const file = document.getElementById('sendFile').files[0];
        // formData.append('username', 'Atib');
        // formData.append('file' , file);
        // console.log(formData);
        const responce = await axios.post(`${backendAPIs}/sendFile/${groupId}` , formData , { headers: { 'Authorization': token, "Content-Type":"multipart/form-data" } });
        console.log(responce.data);
        document.getElementById('sendFile').value = null;
        // showMyMessageOnScreen(responce.data.data);

        append(`You: ${responce.data.data.message}`, 'right');
    }catch(err){
        console.log(err);
        if(err.response.status == 400){
            return alert(err.response.data.message);
        }
    }
    
}

function logout(){
    if(confirm('Are you sure ?')){
        localStorage.clear();
        return window.location.href = './login.html';
    }
}