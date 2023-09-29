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
    isbook: document.querySelectorAll(".isbook"),
    delete_icon: document.querySelector(".delete_icon"),
};

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
        dom.input_user_name.value = user.data.name;
        dom.input_user_email.value = user.data.email;
    }
}

function initializeBooking(booking){
    if(booking.data){
        for(let i=0; i<dom.hide.length; i++){
            dom.hide[i].classList.remove("hide");
        }
        dom.attraction_image.src=booking.data.attraction.image;
        dom.attraction_name.textContent = booking.data.attraction.name;
        dom.date.textContent = booking.data.date;
        if(booking.data.time === "morning"){
            dom.time.textContent = "早上 9 點到中午 12 點";
        }
        else if (booking.data.time === "afternoon"){
            dom.time.textContent = "下午 1 點到下午 4 點"
        }
        dom.price[0].textContent = booking.data.price;
        dom.price[1].textContent = booking.data.price;
        dom.attraction_address.textContent = booking.data.attraction.address;
    }
    else{
        dom.nobooking.style.display="flex";
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
  .then( user => {
    initializeNav(user);
    initializeUser(user);
});
api("GET", "/api/booking")
  .then( booking =>{
    initializeBooking(booking);
});
dom.delete_icon.addEventListener("click", async (e)=>{
    response = await api("DELETE", "/api/booking");
    if(response.ok === true){
        window.location.reload();
    }
    else{
        alert("刪除失敗");
    }
});