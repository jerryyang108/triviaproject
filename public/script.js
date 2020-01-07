let questionArray=[];
//refresh when category or difficulty selected
function refresh(){
    //options
    let diffDropDownList = document.getElementById("difficulty");
    let selectDiff = diffDropDownList.options[diffDropDownList.selectedIndex].value
    let catDropDownList = document.getElementById("category");
    let selectCat = catDropDownList.options[catDropDownList.selectedIndex].value
    let q = "difficulty="+selectDiff+"&category="+selectCat;
    req = new XMLHttpRequest();
   // console.log(questionText.childNodes.length);
    req.onreadystatechange = function(){
        if (this.readyState ==4 && this.status ==200){
            document.getElementById("result").innerHTML=this.responseText;
            var div = document.getElementById("main");
            console.log(div.childNodes.length)
            //create a check box 
            for(var i =0 ; i<div.childNodes.length; i++){  
                console.log("childnode   "+div.childNodes[i].text);
                var d = document.createElement("INPUT")
                d.setAttribute("type", "checkbox")
                div.childNodes[i].appendChild(d)
                div.childNodes[i].appendChild(document.createElement('br'))
            }

            
        }
    }
    req.open("GET", "http://localhost:3000/questions?"+q);
    req.send();
}
//save button
function save(){
    let createrName=document.getElementById("creater_name");
    let quizTag= document.getElementById("quiz_tag");
    let saved = document.getElementById("savedQuestions");
    if (createrName.value==""|| quizTag.value==""){
        alert("You must enter something on the textbox");
    }
    if (saved.childNodes.length == 0){
        alert("No question in the quiz!");
    }
    else {
        //create a new object store creater name, quiz tag and quesiton array.
        let text = {};
        text.creName=createrName.value;
        text.quTag=quizTag.value;
        text.questionArray = questionArray;
        //send array back to server
        req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if (this.readyState ==4 && this.status ==200){                
                alert("Quiz Created");
            }
        }
        req.open("POST", "http://localhost:3000/quizzes",true);
        req.setRequestHeader('Content-type','application/json');
        req.send(JSON.stringify(text));
        setTimeout(function() {
            window.location.replace("/quizzes?tag=" + text.quTag);
        }, 500);
    }
}
//'add' button
function add(){
    let quesDiv=document.getElementById("savedQuestions");
    let ques = document.getElementById("main");
    
    for (var i = 0 ; i < ques.childNodes.length ; i ++ ){
        console.log(i);
        if (ques.childNodes[i].childNodes[1].checked==true){
            console.log(ques.childNodes.length);
            quesDiv.appendChild(ques.childNodes[i]);         
        }
    }
    //unchecked all question that moved out
    for (var j =0 ;j <quesDiv.childNodes.length; j++){
        // check dubplicate and push to array
        quesDiv.childNodes[j].childNodes[1].checked=false;
        if (!questionArray.includes(quesDiv.childNodes[j].innerText)){
             questionArray.push(quesDiv.childNodes[j].innerText);
        }
       
    }
}
//'remove' button
function remove() {
    let savedQues = document.getElementById("savedQuestions");
    for (var i =0 ; i < savedQues.childNodes.length; i++){
        if(savedQues.childNodes[i].childNodes[1].checked==true){
            savedQues.removeChild(savedQues.childNodes[i]);
        }
    }
}