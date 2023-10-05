//const body = document.querySelector("body");
//body.scrollTop=0;
let nextPage=0;
let dom={
    nav_title: document.querySelector(".nav_title"),
    sign_btn: document.querySelector(".sign.btn"),
    book_btn: document.querySelector(".book.btn"),
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
    login_description: document.querySelector(".login_content .modal_description"),
    signup_message: document.querySelector(".signup_message"),
    login_message: document.querySelector(".login_message"),
};

dom.nav_title.addEventListener("click", (e)=>{
    //console.log("click");
    location.href = "/";
})

let search_btn = document.querySelector(".search_btn");
search_btn.addEventListener("click", (e)=>{
    let search_inputbox = document.querySelector(".search_inputbox");
    let attractions = document.querySelector(".attractions");
    let page_end=document.querySelector(".page_end");
    let main_content = document.querySelector(".main_content");
    main_content.removeChild(page_end);
    attractions.innerHTML="";
    nextPage = 0;
    loadPage(search_inputbox.value).then(()=>{
        let page_end=document.querySelector(".page_end");
        if(!page_end){
            const main_content=document.querySelector(".main_content");
            let page_end=document.createElement("div");
            page_end.className="page_end";
            main_content.appendChild(page_end);
        }
        infiniteScroll(search_inputbox.value);
    });
});
//mrt list
let left_btn = document.querySelector(".left_btn");
let right_btn = document.querySelector(".right_btn");
let list=document.querySelector(".list");
left_btn.addEventListener('click', (e)=>{
    list.scrollLeft -=list.clientWidth/2;
});
right_btn.addEventListener('click', (e)=>{
    list.scrollLeft +=list.clientWidth/2;
});
// mrt list
fetch('/api/mrts') //記得改
.then((response) => {
    return response.json();
})
.then((response) => {
    //console.log(response);
    //console.log(response.data[0]);
    const list = document.querySelector(".list");
    for(let i=0; i<response.data.length; i++){
    let list_item=document.createElement("div");
    list_item.className= "list_item";
    list_item.textContent = response.data[i];
    list.appendChild(list_item);
    }
})
.then(()=>{
    let list_item = document.querySelectorAll(".list_item");
    let search_inputbox =document.querySelector(".search_inputbox");
    for(let i=0; i<list_item.length; i++){
        list_item[i].addEventListener("click", (e)=>{
            //console.log(e.target);
            search_inputbox.value = e.target.textContent;
            search_btn.click();
        })
    }
})
.catch((error) => {
    console.log(`Error: ${error}`);
})

async function loadPage(keyword){
    let url='/api/attractions?page=' + nextPage.toString();//記得改
    if(keyword){
        url=url+'&keyword='+keyword;
    }
    let response = await fetch(url) 
    response = await response.json();
    loadAttractions(response);
    nextPage=response.nextPage;
}
function goPage(id){
    location.href = "/attraction/" + id.toString();
}
const loadAttractions = (response) => {
    const attractions=document.querySelector(".attractions");
    let page = document.createElement("div");
    page.className="page";
    for(let i=0; i<response.data.length; i++){
        let attraction=document.createElement("div");
        attraction.className="attraction";
        attraction.addEventListener("click", (e)=>{
            goPage(response.data[i].id);
        })
        let picture_container=document.createElement("div");
        picture_container.className="picture_container";
        let picture=document.createElement("img");
        picture.className="picture";
        picture.src=response.data[i].images[0];
        let attraction_title=document.createElement("div");
        attraction_title.className = "attraction_title";
        attraction_title.textContent=response.data[i].name;
        let attraction_detail=document.createElement("div");
        attraction_detail.className="attraction_detail";
        let attraction_mrt=document.createElement("div");
        attraction_mrt.className="attraction_mrt";
        attraction_mrt.textContent=response.data[i].mrt;
        let attraction_category=document.createElement("div");
        attraction_category.className="attraction_category";
        attraction_category.textContent=response.data[i].category;

        page.appendChild(attraction);
        attraction.appendChild(picture_container);
        attraction.appendChild(attraction_detail);
        picture_container.appendChild(picture);
        picture_container.appendChild(attraction_title);
        attraction_detail.appendChild(attraction_mrt);
        attraction_detail.appendChild(attraction_category);
    }
    //console.log(response.data);
    if(response.data.length==0){
        let text=document.createElement("div");
        text.className="text";
        text.textContent="查無資料";
        page.appendChild(text);
    }
    attractions.appendChild(page);
}
const infiniteScroll=(keyword)=>{
    const root = null;
    const options = {
        root,
        threshold: 1,
    };
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                if(nextPage!=null){
                    console.log("loadPage");
                    loadPage(keyword);
                    console.log("nextPage=",nextPage);
                }
                if(nextPage==null){
                    observer.disconnect();
                }
            }
        });
    };

    const observer = new IntersectionObserver(callback, options);
    let target=document.querySelector(".page_end");
    if(target){
        observer.observe(target);
    }
}
// default load
loadPage().then(()=>{
    let page_end=document.querySelector(".page_end");
    if(!page_end){
        const main_content=document.querySelector(".main_content");
        let page_end=document.createElement("div");
        page_end.className="page_end";
        main_content.appendChild(page_end);
    }
    infiniteScroll();
});

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
            dom.sign_btn.removeEventListener("click", openModal)
            dom.book_btn.removeEventListener("click", openModal);
        }
        catch(e){
        }
        dom.sign_btn.textContent="登出系統";
        dom.sign_btn.addEventListener("click", logOut);
        dom.book_btn.addEventListener("click", openBooking);
    }
    else{
        try{
            dom.sign_btn.removeEventListener("click", logOut);
            dom.book_btn.removeEventListener("click", openBooking);
        }
        catch(e){
        }
        dom.sign_btn.textContent="註冊/登入";
        dom.sign_btn.addEventListener("click", openModal);
        dom.book_btn.addEventListener("click", openModal);
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
        if(!dom.signup_message){
            let message = document.createElement("div");
            message.className="modal_description signup_message";
            dom.signup_message=message;
        }
        if(data.ok===true){
            dom.signup_message.style.color = "green";
            dom.signup_message.textContent = "註冊成功";
        }else if(data.message==="already signedup"){
            dom.signup_message.style.color = "red";
            dom.signup_message.textContent = "此信箱已註冊"
        }
        dom.signup_content.insertBefore(dom.signup_message, dom.signup_description);
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
    }).then((response) => {
        //console.log(response);
        return response.json()
    }).then((data) => {
        console.log(data);
        if(data.token){
            localStorage.setItem("token",data.token);
            getUserByToken();
            location.reload();
        }else{
            if(!dom.login_message){
                let message = document.createElement("div");
                message.className="modal_description login_message";
                dom.login_message=message;
            }
            dom.login_message.style.color = "red";
            dom.login_message.textContent = "帳號或密碼錯誤"
        }
        dom.login_content.insertBefore(dom.login_message, dom.login_description);
    });
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