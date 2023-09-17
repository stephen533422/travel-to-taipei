//console.log(id);
dom={
    nav_title: document.querySelector(".nav_title"),
    picture_list: document.querySelector(".picture_list"),
    circle_container: document.querySelector(".circle_container"),
    left_btn: document.querySelector(".left_btn"),
    right_btn: document.querySelector(".right_btn"),
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