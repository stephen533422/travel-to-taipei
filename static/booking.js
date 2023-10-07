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

function order() {
    //event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        console.log('can not get prime');
        alert("請輸入正確的信用卡付款資訊");
        return;
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            console.log('get prime error ' + result.msg);
            return;
        }
        console.log('get prime 成功，prime: ' + result.card.prime);
        let data = {
            "prime": result.card.prime,
            "order": {
                "price": booking.data.price,
                "trip": {
                "attraction": {
                    "id": booking.data.attraction.id,
                    "name": booking.data.attraction.name,
                    "address": booking.data.attraction.address,
                    "image": booking.data.attraction.image
                },
                "date": booking.data.date,
                "time": booking.data.time
                },
                "contact": {
                "name": dom.input_user_name.value,
                "email": dom.input_user_email.value,
                "phone": dom.input_user_phone.value
                }
            }
        }
        console.log(JSON.stringify(data));
        let token = localStorage.getItem("token");
        fetch("/api/orders",{
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization":`Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }).then((response)=> response.json()
        ).then((orders)=>{
            console.log(orders);
            if(orders.data){
                console.log(orders.data.number);
                api("DELETE", "/api/booking");
                window.location.replace(`/thankyou?number=${orders.data.number}`);
            }
            else if(orders.error){
                alert("付款失敗，請再試一次");
            }
        });
        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    })
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
api("GET", "/api/booking")
  .then( bookingdata =>{
    booking = bookingdata;
    initializeBooking(bookingdata);
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
TPDirect.setupSDK(137208, 'app_6HrOebCUCFp7uPym2ekNygUqvv1D4fZOGTnjYiVdBoGTi8fjHfX3I6VIqgLv', 'sandbox')
// Display ccv field
let fields = {
    number: {
        element: document.querySelectorAll(".tpfield")[0],
        placeholder: "**** **** **** ****"
    },
    expirationDate: {
        element: document.querySelectorAll(".tpfield")[1],
        placeholder: 'MM / YY'
    },
    ccv: {
        element: document.querySelectorAll(".tpfield")[2],
        placeholder: "ccv"
    }
}
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray',
            'font-size': '16px',
            'font-weight': '500',
            'line-height': '13.3px',
            'font-family': '"Noto Sans TC", sans-serif',
            'font-style': 'normal',
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        /*'@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }*/
        '.tappay-field-focus': {
            'border-color': '#66afe9',
            'outline': '0',
            '-webkit-box-shadow': 'inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6)',
            'box-shadow': 'inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6)',
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})
dom.order_btn.addEventListener("click", ()=>{
    order();
});

