let dom={
    //nav
    nav_title: document.querySelector(".nav_title"),
    sign_btn: document.querySelector(".sign.btn"),
    book_btn: document.querySelector(".book.btn"),
    //modal
    modal: document.querySelector(".modal"),
    //main
    hide: document.querySelectorAll(".hide"),
    nobooking: document.querySelector(".nobooking"),
    user_name:document.querySelector(".user_name"),
    attraction_image: document.querySelector(".attraction_image"),
    attraction_name: document.querySelector(".attraction_name"),
    date: document.querySelector(".date"),
    time: document.querySelector(".time"),
    price: document.querySelectorAll(".price"),
    attraction_address: document.querySelector(".attraction_adress"),
    input_user_name: document.querySelector("#user_name"),
    input_user_email: document.querySelector("#user_email"),
    input_user_phone: document.querySelector("#user_phone"),
    isbook: document.querySelectorAll(".isbook"),
    delete_icon: document.querySelector(".delete_icon"),
    order_btn: document.querySelector(".purchase_btn"),
    order_number: document.querySelector(".order_number"),
    order_status: document.querySelector(".status"),
};
let user={};
let booking = {};

async function api(method, url){
    let token = localStorage.getItem("token");
    let response =await fetch(`${url}`,{
        method: `${method}`,
        headers: {
            "Authorization":`Bearer ${token}`
        },
    });
    response =await response.json();
    console.log(response);
    return response;
}
/*
async function getBooking(){
    let token = localStorage.getItem("token");
    let booking =await fetch("/api/booking",{
        method: "GET",
        headers: {
            "Authorization":`Bearer ${token}`
        },
    });
    booking=await booking.json();
    console.log(booking);
    return booking;
}

async function deleteBooking(){
    let token = localStorage.getItem("token");
    let response = await fetch("/api/booking",{
        method: "DELETE",
        headers: {
            "Authorization":`Bearer ${token}`
        },
    })
    response = await response.json();
    return response;
}

async function getUser(){
    let token = localStorage.getItem("token");
    let user = await fetch("/api/user/auth",{
        method: "GET",
        headers: {
            "Authorization":`Bearer ${token}`
        },
    });
    user=await user.json();
    return user;
}*/

function initializeNav(user){
    if(user.data){
        try{
            dom.sign_btn.removeEventListener("click", openModal)
            dom.book_btn.removeEventListener("click", openModal);
        }
        catch(e){
            console.log(e);
        }
        dom.sign_btn.textContent = "登出系統";
        dom.sign_btn.addEventListener("click", logOut);
        dom.book_btn.addEventListener("click", openBooking);
    }
    else{
        try{
            dom.sign_btn.removeEventListener("click", logOut);
            dom.book_btn.removeEventListener("click", openBooking);
        }
        catch(e){
            console.log(e);
        }
        window.location.replace("/");
    }
}

function initializeUser(user){
    if(user.data){
        dom.user_name.textContent = user.data.name;
    }
}

function initializeorder(order){
    if(order.data){

    }
    else{

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

function openBooking(){
    window.location.href="/booking";
}


// main function
dom.nav_title.addEventListener("click", (e)=>{
    //console.log("click");
    location.href = "/";
})
api("GET", "/api/user/auth")
  .then( userdata => {
    user=userdata;
    initializeNav(userdata);
    initializeUser(userdata);
});
let number = window.location.search.split("?number=")[1];
//console.log(number);
api("GET", `/api/order/${number}`)
  .then( orderdata=>{
    if(orderdata.data != null){
        if(orderdata.data.status === 0){
            dom.order_status.textContent = "行程預定成功";
        }
        else{
            dom.order_status.textContent = "行程尚未付款，請聯絡服務人員";
        }
    }
    else{
        dom.order_status.textContent = "查無此訂單編號，請聯絡服務人員";
    }
    dom.order_number.textContent = number;
  })
;





