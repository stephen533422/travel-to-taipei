//const body = document.querySelector("body");
//body.scrollTop=0;
let nextPage=0;

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

let left_btn = document.querySelector(".left_btn");
let right_btn = document.querySelector(".right_btn");
let list=document.querySelector(".list");
left_btn.addEventListener('click', (e)=>{
    list.scrollLeft -=list.clientWidth/2;
});
right_btn.addEventListener('click', (e)=>{
    list.scrollLeft +=list.clientWidth/2;
});

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
const loadAttractions = (response) => {
    
    const attractions=document.querySelector(".attractions");
    let page = document.createElement("div");
    page.className="page";
    for(let i=0; i<response.data.length; i++){
        let attraction=document.createElement("div");
        attraction.className="attraction";
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


