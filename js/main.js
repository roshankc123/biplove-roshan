
i=0;
child=0;
var intial_zoom=1;
var zoom_step=0.3;
var child_subid_offset=0;
///initilize associative array that is in data['box_id'] format
var data={};
//initilize numeric array for main initial box that has constant id A
data['A']=[];
data['A'][0]="";   ///for name
data['A'][1]="";    ///for image
data['A'][2]=-1;    ///for child count
data['A'][3]=1;    ///available(1 means not deleted)
temp={};              ///for cache storage of boxes

// When window is loaded then only
window.onload = () => {
    if(!isCookieSet()){
        createCookie("tree_cookie",3650*24*60*60,"site");
    } else {
        var tmp_cookie=getCookie("tree_cookie");
        if(raw_data=getCookie("tree_data")){
            data=JSON.parse(raw_data);
            console.log("cookie data found");
        }
        else{
        // get_json return the data that is from server, if server sent json data then now we can JSON.parse(get_json())
            get_json();
            console.log("data from server");
        }

    }
    position_add("",0,1);
}

///function that make button appears or dissappear when box is clicked
function appear_btn(id,action){
    var btn_offset=1;
    todo = action!=0 ? "visible" : "hidden";
    if(document.getElementById('branch_'+id)){
    if(todo=="visible"){
        document.querySelector(`#${id} img`).className += " opacity-to-img";
    } else {
        document.querySelector(`#${id} img`).className = "box_image";
    }
    
    for(btn_offset=1;btn_offset<=4;btn_offset++){
        document.getElementById("btn_"+id+"_"+btn_offset).style.visibility=todo;
    }
    document.getElementById(id).onclick=function(){
        appear_btn(id,(action+1)%2);
    }
    }
}


// call back for get_json 
function callback(response, callback_arg){
    if(callback_arg=="get_json" || callback_arg=="clone"){
        data=JSON.parse(response);
        document.getElementById('img_A').src="images/"+data['A'][1]+".png";
    }
    else if(callback_arg=="reload"){
        location.reload();
    }
    else if(callback_arg=="delete_clicked"){
        // When delete clicked
    }
    else if(callback_arg=="save"){
        show_key_to_copy(response);
    }
}


// Yes on share option
function confirm_share(){
    document.getElementById("popup_container").lastChild.remove();
    var confirm_container=document.createElement("div");
    confirm_container.id="confirm_container";
    var mssg_container=document.createElement("div");
    mssg_container.className="conf_mssg_container";
    mssg_container.innerHTML="Please enter a secure key to share the content"

    var inpt = document.createElement("input");
    inpt.type="password";
    inpt.placeholder="Secure Key here...";
    inpt.autofocus=true;
    inpt.id="key_input";
    var confirm_btn = document.createElement("button");
    confirm_btn.id="confirm_share_btn";
    confirm_btn.innerHTML="Okay";

    confirm_btn.onclick = function(){
        share_option_clicked(key=inpt.value);        
    };

    confirm_container.appendChild(mssg_container);
    confirm_container.appendChild(inpt);
    confirm_container.appendChild(confirm_btn);
    document.getElementById("popup_container").appendChild(confirm_container);
}

/* Cookie user logged or not */
// Create cookie
function createCookie(ck_name, expire,ck_for){
    var date = new Date();
    var currentTime = date.getTime();
    if(ck_for!="data"){
        var ck_value = md5(`${currentTime}${Math.round(Math.random()*1000)}`);
    }
    else{
        var ck_value = JSON.stringify(data);
    }
    date.setTime(date.getTime() + (expire*1000));
    document.cookie = `${ck_name}=${ck_value};expires=${date.toUTCString()};path=/`;
}


//function to push,edit array data
function data_add(id){
    data[id][0]=document.getElementById('u_name').value;
    okEditFormClicked(id);
    update_cache();                                                   
popUpClose();
}

// Delete cookie by name
function delete_cookie(ck_name) {
    document.cookie = ck_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
}

// Get cookie value from cookie name
function getCookie(ck_name){
    var decodedCookie = decodeURIComponent(document.cookie);
    var each_cookie_item = decodedCookie.split(';');
    for(var i = 0; i <each_cookie_item.length; i++) {
        var val = each_cookie_item[i];
        while (val.charAt(0) == ' ') {
            val = val.substring(1);
        }
        if (val.indexOf(`${ck_name}=`) == 0) {
            return val.substring(`${ck_name}=`.length, val.length);
        }
    }
    return null;
}

// Json send from get_json
function get_json(){
    var url = `http://tree.eastus.cloudapp.azure.com/main.php?user=${getCookie("tree_cookie")}&get_json=1`;

    var request = makeRequest('GET', url);
    if(!request) {
        return;
    }
    // Handle the requests
    request.onreadystatechange = () => {
        if(request.readyState==4&&request.status==200){
            var response=request.responseText;
            if(response!=""){
                callback(response, "get_json");
            }
        }
    };
    request.send();
}





// If cookie is set return true, false otherwise
function isCookieSet(ck_name='tree_cookie'){
    return document.cookie.indexOf(`${ck_name}=`)>=0;
}


///function that create a edit division when popup happens
function edit(id){
    document.getElementById('popup_container').lastChild.remove();
    var edit_container=document.createElement("div");
    edit_container.id="edit_div";
    var div_0=document.createElement("div");
    var input_name=document.createElement("input");
        input_name.type="text";
        input_name.placeholder="Name";
        input_name.id="u_name";
        div_0.appendChild(input_name);
    var div_1=document.createElement("div");
    var input_image=document.createElement("input");
        input_image.type="file";
        input_image.id="u_image";
        div_1.appendChild(input_image);
    var button=document.createElement('button');
        button.id="submit_btn";
        button.innerHTML="Ok";
        button.onclick=function(){
            data_add(id);
        }
        edit_container.appendChild(div_0);
        edit_container.appendChild(div_1);
        edit_container.appendChild(button);
    document.getElementById('popup_container').appendChild(edit_container);
    document.getElementById('u_name').value=data[id][0];
    document.getElementById('u_image').value="";
    return 0; 
}

///function that create button element with desired onclick effect and return button object
function button_create(name,id){
    var button=document.createElement('BUTTON');
        button.innerHTML=name;
        button.style.visibility="hidden";
        button.onclick=function(){
        switch(name){
            case 'Add':
                position_add(id,0,0);
                break;
            case 'View':
                popUpOpen("view",id);
                break;
            case 'xpnd':
                expand(id);
                break;
            case 'del':
                delete_box(id);
                break;
            default:
                break;
        }
    }
    return button;
}

///function that add up boxes in desired position
function position_add(id,init,view_only){  ////view_only 1 for just viewing
    var ul_check=document.getElementById("ul_"+id);
    if(!ul_check){
        var ul_create=document.createElement('ul');
            if(id==""){
                var ul_check=document.getElementById("tree");
            }
            else{
                ul_create.id="ul_"+id;
                document.getElementById("branch_"+id).appendChild(ul_create);
                var ul_check=document.getElementById("ul_"+id);
            }
            console.log("ul created at init 0");
            if(view_only==0 && id!=""){
                expand(id);
                console.log("expanded first");
            }
    }

    if(init==0 && id!=""){
        child=0;
        child_subid_offset=0;
        document.getElementById('btn_'+id+"_"+1).onclick=function(){
            position_add(id,1,0);
        }
    }
    if(view_only==1){
        child_count_tmp=child_subid_offset;
    }
    else if(view_only==0 && id!=""){
        child=(data[id][2])+1;
        console.log("this::"+data[id][2]);
        child_count_tmp=data[id][2]+1;                               
        console.log("child assigned parent index");
    }
    if(id==""){
        var parent_child="A";
    }
    else{
        var first_char_childid=String.fromCharCode(97+return_pre_id(child_count_tmp));
        console.log("pos_0::"+first_char_childid+"  :"+return_pre_id(child_count_tmp));
        var parent_child=id+first_char_childid+String.fromCharCode(65+(child%26));
    }
    if(!data[parent_child] || data[parent_child][3]!=0){
        var box = document.createElement("div");
            box.id=parent_child;
            box.className="box";
            box.onclick=function(){
                appear_btn(box.id,1);
            }
    //increasing child box count
        if(!view_only && !data[box.id]){
            console.log("data object created");
            data[box.id]=[];
            ///name is blank in first
            data[box.id][0]=""; 
            ///image location is blank in first                                                   
            data[box.id][1]="";
            data[box.id][2]=-1;
            data[box.id][3]=1;
        }                            
        var p_tag_to_enclose_btn = document.createElement("p");
        var button=button_create("Add",box.id);
            button.className="btn_1";
            button.id="btn_"+box.id+"_"+1;
            p_tag_to_enclose_btn.appendChild(button);
        var button=button_create("View",parent_child);
            button.className="btn_2";
            button.id="btn_"+box.id+"_"+2;
            p_tag_to_enclose_btn.appendChild(button);
        var button=button_create("xpnd",parent_child);
            button.className="btn_3";
            button.id="btn_"+box.id+"_"+3;
            p_tag_to_enclose_btn.appendChild(button);
        var button=button_create("del",parent_child);
            button.className="btn_4";
            button.id="btn_"+box.id+"_"+4;
            p_tag_to_enclose_btn.appendChild(button);
            box.appendChild(p_tag_to_enclose_btn);
        var image=document.createElement('img');
            image.alt=box.id;
            image.id="img_"+box.id;
            image.className="box_image";
            image.alt=box.id;
            if(temp[box.id]){
                image.src=temp[box.id];
            }
            else if(data[box.id][1]){
                image.src="http://tree.eastus.cloudapp.azure.com/images/"+data[box.id][1]+".png";
            }
            box.appendChild(image);
        var branch = document.createElement("li");
            branch.id="branch_"+parent_child;
            branch.className="branch";
            branch.appendChild(box);
        ul_check.appendChild(branch);
        console.log("init not 0");
        if(view_only!=1){
            if(id!=""){
                data[id][2]++;
            }
            update_cache();
            console.log("child added to parent");
        }
        if(id!=""){
            var button=document.getElementById('btn_'+id+'_3');
            button.innerHTML="mrge";
            button.onclick=function(){
                merge(id);
            }
        }
        // Many take documentElement
        document.documentElement.scrollTop=document.getElementById("tree").offsetHeight;
        // Some browsers take body
        document.body.scrollTop=document.getElementById("tree").offsetHeight;
        console.log("position add end reached");
    }
    child++;
    child_subid_offset++;
}

function return_pre_id(num){
    console.log("num::"+num);
    return ((num/26)-((num/26)%1));
}
///function to remove box
function position_remove(id){
    document.getElementById("ul_"+id).style.visibility="hidden";
}

///function to expand
function expand(id){
    var ul_branch=document.getElementById("ul_"+id);
        var expand_offset=0;
        for(expand_offset=0;expand_offset<=data[id][2];expand_offset++){
            position_add(id,expand_offset,1);
            console.log(expand_offset);
        }
    var button=document.getElementById('btn_'+id+'_3');
    button.innerHTML="mrge";
    button.onclick=function(){
        merge(id);
    }
}

////function to merge
function merge(id){
    var merge_offset=0;
    var ul_object=document.getElementById("ul_"+id);
    if(ul_object){
        //ul_object.style.visibility="hidden";   ///some errors with this ref#1
        ul_object.remove();
    }
    var button=document.getElementById('btn_'+id+'_3');
    button.innerHTML="xpnd";
    button.onclick=function(){
        expand(id);
    }
}


///function to send data added
function json_send(){
    var json_file=JSON.stringify(data);

    var formData = new FormData();
    formData.append('json_file', json_file);

    var url = `http://tree.eastus.cloudapp.azure.com/main.php?user=${getCookie("tree_cookie")}`;

    var request = makeRequest('POST', url);
    if(!request) {
        console.log('Request not supported');
        return;
    }
    // Handle the requests
    request.onreadystatechange = () => {
        if(request.readyState==4&&request.status==200){
            var response=request.responseText;
        }
        else if(request.readyState==4&&request.status!=200){
            console.log("Error occured!!!");
        }
    };
    request.send(formData);

    
}

// Create the ajax request object.
function makeRequest(method, url) {
    var request = new XMLHttpRequest();
    if ("withCredentials" in request) {
        request.open(method, url, true);
    } 
    else if (typeof XDomainRequest != "undefined") {
        request = new XDomainRequest();
        request.open(method, url);
    } else {
        request = null;
    }
    return request;
}


// When ok button is clicked in edit
function okEditFormClicked(id){
    var file_is_present = document.getElementById('u_image').value.trim();

    if(file_is_present){
        var allData = new FormData();

        var image=document.getElementById('u_image');
        temp[id]=window.URL.createObjectURL(image.files[0]);
        document.getElementById('img_'+id).src=temp[id];
        allData.append("u_image", image.files[0]);
        var image_id=getCookie("tree_cookie")+"_"+Date.now();
        data[id][1]=image_id;
        // Server to send data
        var url = `http://tree.eastus.cloudapp.azure.com/main.php?div_id=${image_id}`;

        var request = makeRequest('POST', url);
        if (!request) {
            return;
        }

        // Handle the requests
        request.onreadystatechange = () => {
            if(request.readystate == 4 && request.status == 200){
                return true;
            } else if(request.status != 200 && request.readystate == 4){
                return false;
            }
        };
        request.send(allData);
    }
    else {
        return false;
    }
}

///function for making popup appear
function popUpOpen(type,id){
    document.getElementById("popup_div").style.display = "flex";
    if(type=="edit"){
        edit(id);
    }
    else if(type=="view"){
        view(id);
    }
    else if(type=="share_option"){
        share_option();
    }
    else if(type=="clone"){
        ask_key_popup(type);
    }
}

///function for making popup dissappear
function popUpClose(){
    document.getElementById('popup_container').lastChild.remove();
    document.getElementById("popup_div").style.display = "none";
}

// Option to share yes or no
function share_option(){
    var confirm_container=document.createElement("div");
    confirm_container.id="confirm_container"
    var mssg_container=document.createElement("div");
    mssg_container.className="conf_mssg_container";
    mssg_container.innerHTML="Do you want to make this a sharable tree?"

    var yes_btn=document.createElement("button");
    yes_btn.className="yes_btn";
    yes_btn.innerHTML="Yes";
    var no_btn=document.createElement("button");
    no_btn.className="no_btn";
    no_btn.innerHTML="No";

    yes_btn.onclick=function(){
        ask_key_popup("save");
    }
    no_btn.onclick=function(){
        json_send();
        popUpClose();
    }
    var note_container = document.createElement("p");
    note_container.innerHTML="*Note:- Allowing this will make your tree sharable to people with the key you provided.";
    
    confirm_container.appendChild(mssg_container);
    confirm_container.appendChild(yes_btn);
    confirm_container.appendChild(no_btn);
    confirm_container.appendChild(note_container);
    document.getElementById("popup_container").appendChild(confirm_container);
}

// Yes on share option
function ask_key_popup(for_){
    document.getElementById("popup_container").lastChild.remove();
    var confirm_container=document.createElement("div");
    confirm_container.id="confirm_container";
    var mssg_container=document.createElement("div");
    mssg_container.className="conf_mssg_container";
    mssg_container.innerHTML="Please enter a secure key to share the content";

    var inpt = document.createElement("input");
    inpt.type="password";
    inpt.placeholder="Secure Key here...";
    inpt.id="key_input";
    inpt.autofocus=true;

    var confirm_btn = document.createElement("button");
    confirm_btn.id="confirm_share_btn";
    confirm_btn.innerHTML="Okay";

    confirm_btn.onclick = function(){
        share_key_ajax(key=inpt.value, key_of=for_);        
    };

    confirm_container.appendChild(mssg_container);
    confirm_container.appendChild(inpt);
    confirm_container.appendChild(confirm_btn);
    document.getElementById("popup_container").appendChild(confirm_container);
}

// Final share save button is clicked
// key, input value and key_of = clone or save
function share_key_ajax(key, key_of){
    if(key.length!==0){
        var formData = new FormData();
        formData.append('key', key);
        if(key_of=="save"){
            formData.append('json_file', JSON.stringify(data));
        }
        var url = `http://tree.eastus.cloudapp.azure.com/main.php?user=${getCookie("tree_cookie")}&`;
        url = key_of=="clone" ? url+"clone=1" : url+"save_pw=1";

        var request = makeRequest('POST', url);
        if(!request) {
            console.log('Request not supported');
            return;
        }
        // Handle the requests
        request.onreadystatechange = () => {
            if(request.readyState==4&&request.status==200){
                var response=request.responseText;
                callback(response,key_of);
            }
            else if(request.readyState==4&&request.status!=200){
                console.log("Error occured!!!");
            }
        };
        request.send(formData);

        popUpClose();
    }
    else{
        document.getElementById('key_input').placeholder="please enter key first";
    }
}

///function to update data in cookie
function update_cache(){
    createCookie("tree_data",86400,"data");
}


///function that create a view division when popup happens
function view(id){
    var view_container=document.createElement("div");
    view_container.id="view_div";
    var edit_btn=document.createElement("button");
    edit_btn.innerHTML="edit";
    edit_btn.id="edit_btn";
    edit_btn.onclick=function(){
        popUpOpen("edit",id);
    }
    view_container.appendChild(edit_btn);
    // Image path of user image
    if(temp[id]){
        imagePath=temp[id];
    }
    else if(data[id][1]){
        imagePath="http://tree.eastus.cloudapp.azure.com/images/"+data[id][1]+".png";
    }
    else{
        imagePath="";
    }
    view_container.style.backgroundImage = `url('${imagePath}')`;
    // div for name of user
    var div_0=document.createElement("div");
    div_0.id="view_name_div";
    div_0.innerHTML=data[id][0];
    view_container.appendChild(div_0);
    document.getElementById('popup_container').appendChild(view_container);
}

// Clone button clicked
function clone_clicked(){
    popUpOpen(type="clone");
}

function zoomIn(e){
    if(intial_zoom<2.5){
        intial_zoom+=zoom_step;
        document.getElementById("tree").style.transform=`scale(${intial_zoom})`;
    }
}
function zoomOut(e){
    if(intial_zoom>0.1){
        intial_zoom-=zoom_step;
    }
    document.getElementById("tree").style.transform=`scale(${intial_zoom})`;
}
function zoomReset(e){
    intial_zoom=1;
    document.getElementById("tree").style.transform=`scale(${intial_zoom})`;
}

// Delete button clicked
function delete_clicked(){
    createCookie(ck_name="trash_data", expire=24*60*60, ck_for="data");
    delete_cookie(ck_name="tree_data");

    var url = `http://tree.eastus.cloudapp.azure.com/main.php?user=${getCookie("tree_cookie")}&delete=1`;

    var request = makeRequest('GET', url);
    request.onreadystatechange = () => {
        if(request.readyState == 4 && request.status == 200){
            callback(request.responseText, callback_arg="reload");
        } else if(request.readyState==4&&request.status!=200){
            console.log("Error occured!!!");
        }
    };
    request.send();
}

///function to delete box
function delete_box(id){
    if(id!='A'){
        data[id][3]=0;
        var tmp_id=id;
        tmp_id=tmp_id.split("");
        var rmv=tmp_id.pop();
        rmv=tmp_id.pop();
            console.log(rmv+"::removed");
        tmp_id=tmp_id.join("");
        var parent=tmp_id;
        merge(parent);
        expand(parent);
    }
    else{
        alert('main parent cant be erased');
    }
}

// Show response key to copy
function show_key_to_copy(response_key){
    popUpOpen();
    var confirm_container=document.createElement("div");
    confirm_container.id="confirm_container"
    var mssg_container=document.createElement("div");
    mssg_container.className="conf_mssg_container";
    mssg_container.innerHTML="Here is the key for you!!!";

    var main_key_cont=document.createElement("div");
    main_key_cont.innerHTML=response_key;
    main_key_cont.style.padding="5px 10px";
    main_key_cont.style.backgroundColor="#ccc";

    var yes_btn=document.createElement("button");
    yes_btn.className="yes_btn";
    yes_btn.innerHTML="Copy";
    yes_btn.style.marginTop="30px";
    yes_btn.style.backgroundColor="#00c9FE";

    yes_btn.onclick=function(){
        // Copy response_text to clipboard
        if(document.body.createTextRange) {
            // IE
            var range = document.body.createTextRange();
            range.moveToElementText(main_key_cont);
            range.select();
            document.execCommand("Copy");
        }
        else {
            // other browsers
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(main_key_cont);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("Copy");
        }
    }    
    confirm_container.appendChild(mssg_container);
    confirm_container.appendChild(main_key_cont);
    confirm_container.appendChild(yes_btn);
    document.getElementById("popup_container").appendChild(confirm_container);
}

//popup when clone pressed which takes input for key..this is for tree sharing feature
