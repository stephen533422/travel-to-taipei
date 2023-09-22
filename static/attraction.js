//console.log(id);
dom={
    nav_title: document.querySelector(".nav_title"),
    picture_list: document.querySelector(".picture_list"),
    circle_container: document.querySelector(".circle_container"),
    left_btn: document.querySelector(".left_btn"),
    right_btn: document.querySelector(".right_btn"),
    sign_btn: document.querySelector(".sign.btn"),
    modal: document.querySelector(".modal"),
    close_btn: document.querySelector(".close"),
    login_btn: document.querySelector(".login_btn"),
    login_email: document.querySelector(".login_email"),
    login_password: document.querySelector(".login_password"),
    signup_btn: document.querySelector(".signup_btn"),
    signup_name: document.querySelector(".signup_name"),
    signup_email: document.querySelector(".signup_email"),
    signup_password: document.querySelector(".signup_password"),
    switch_login: document.querySelector(".switch_login"),
    switch_signup: document.querySelector(".switch_signup"),
    login_content: document.querySelector(".login_content"),
    signup_content: document.querySelector(".signup_content"),
    signup_description: document.querySelector(".signup_content .modal_description"),
    message: document.querySelector(".message"),
}
dom.nav_title.addEventListener("click", (e)=>{
    console.log("click");
    location.href = "/";
})
url="../api/attraction/"+id;
fetch(url).then((response)=>{
    return response.json();
}).then((response)=>{
    // console.log(response);
    let name=document.querySelector(".name");
    name.textContent=response.data.name;
    let detail=document.querySelector(".detail");
    detail.textContent=response.data.category + " at " + response.data.mrt;
    let description=document.querySelector(".description");
    description.textContent=response.data.description;
    let address=document.querySelector(".address");
    address.textContent=response.data.address;
    let transport=document.querySelector(".transport");
    transport.textContent=response.data.transport;  
    for(let i=0; i<response.data.images.length; i++) {
        let picture=document.createElement("div");
        picture.className="picture";
        let image = document.createElement("img");
        image.className="image";
        image.src=response.data.images[i];
        dom.picture_list.appendChild(picture);
        picture.appendChild(image);
        let circle=document.createElement("div");
        circle.className="circle";
        dom.circle_container.appendChild(circle);
    }
}).then(()=>{
    let circles = document.querySelectorAll(".circle");
    for(let i=0; i<circles.length; i++) {
        circles[i].addEventListener("click", (e)=>{
            carousel(i);
        })
    }
    var curIndex;
    curIndex=carousel(0);

    let pictures=document.querySelectorAll(".picture");
    dom.left_btn.addEventListener("click", (e)=>{
        //console.log(curIndex);
        if(curIndex===0){
            dom.picture_list.style.transform="translateX(-"+pictures.length+"00%)";
            dom.picture_list.style.transition="none";
            //強制渲染
            dom.picture_list.clientHeight;
            curIndex=carousel(pictures.length-1);
        }
        else{
            curIndex=carousel(curIndex-1);
        }
    })
    dom.right_btn.addEventListener("click", (e)=>{
        //console.log(curIndex);
        if(curIndex === pictures.length-1){
            dom.picture_list.style.transform="translateX(100%)";
            dom.picture_list.style.transition="none";
            //強制渲染
            dom.picture_list.clientHeight;
            curIndex=carousel(0);
        }
        else{
            curIndex=carousel(curIndex+1);
        }
    });
    init();
});


function carousel(i){
    dom.picture_list.style.transform = "translateX(-"+i+"00%)";
    dom.picture_list.style.transition = "0.5s"
    let current_circle=document.querySelector(".current_circle");
    if(current_circle!=null){
        current_circle.classList.remove("current_circle");
    }
    let circles=document.querySelectorAll(".circle");
    //console.log(i);
    //console.log(circles);
    circles[i].classList.add("current_circle");
    curIndex=i;
    return curIndex;
}
function init(){
    //console.log("init");
    let first_picture=dom.picture_list.firstElementChild.cloneNode(true);
    let last_picture=dom.picture_list.lastElementChild.cloneNode(true);
    dom.picture_list.insertBefore(last_picture, dom.picture_list.firstElementChild);
    dom.picture_list.appendChild(first_picture);
    last_picture.style.position="absolute";
    last_picture.style.transform="translateX(-100%)";
}

let radios=document.querySelectorAll(".radio")
let cost=document.querySelector(".cost");
radios[0].addEventListener("click", (e)=>{
    cost.textContent="新台幣2000元";
})
radios[1].addEventListener("click", (e)=>{
    cost.textContent="新台幣2500元";
})

async function getUserByToken(){
    let token = localStorage.getItem("token");
    let user=await fetch("/api/user/auth",{
        method: "GET",
        headers: {
            "Authorization":`Bearer ${token}`
        },
    });
    user=await user.json();
    if(user.data){
        try{
            dom.sign_btn.removeEventListener("click", openModal);
        }catch(e){
        }
        dom.sign_btn.textContent="登出系統";
        dom.sign_btn.addEventListener("click", logOut);
    }
    else{        
        try{
            dom.sign_btn.removeEventListener("click", logOut);
        }catch(e){
        }
        dom.sign_btn.textContent="註冊/登入";
        dom.sign_btn.addEventListener("click", openModal);
    }
}
async function signUp(){
    const form_data = {
        "name": dom.signup_name.value,
        "email": dom.signup_email.value,
        "password": dom.signup_password.value,
    }
    fetch("/api/user",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify(form_data),
    }).then((response) => {
        //console.log(response);
        return response.json()
    }).then((data) => {
        console.log(data);
        if(!dom.message){
            let message = document.createElement("div");
            message.className="modal_description message";
            dom.message=message;
        }
        if(data.ok===true){
            dom.message.style.color = "green";
            dom.message.textContent = "註冊成功";
        }else if(data.message==="already signedup"){
            dom.message.style.color = "red";
            dom.message.textContent = "此信箱已註冊"
        }
        dom.signup_content.insertBefore(dom.message, dom.signup_description);
    });
}

async function logIn(){
    const form_data = {
        "email": dom.login_email.value,
        "password": dom.login_password.value,
    };
    //console.log(form_data);
    let data =await fetch("/api/user/auth",{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify(form_data),
    });
    if(data.ok){
        data=await data.json();
        localStorage.setItem("token",data.token);
        getUserByToken();
        location.reload();
    }
}

function logOut(){
    localStorage.removeItem("token");
    dom.sign_btn.removeEventListener("click", logOut);
    location.reload();
}

function openModal(){
    dom.modal.style.display="block";
}
function closeModal(){
    dom.modal.style.display="none";
}


getUserByToken();
dom.close_btn.addEventListener("click", closeModal);
dom.login_btn.addEventListener("click", logIn);
dom.signup_btn.addEventListener("click", signUp);
dom.switch_login.addEventListener("click", () => {
    dom.signup_content.style.display="none";
    dom.login_content.style.display="flex";
});
dom.switch_signup.addEventListener("click", () =>{
    dom.signup_content.style.display="flex";
    dom.login_content.style.display="none";
});