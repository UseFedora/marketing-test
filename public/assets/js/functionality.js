// namespace? 
window.onload = function() { 
  var request = new XMLHttpRequest();

  ///////// Event Listeners /////////
  document.querySelector("#registrantForm").addEventListener("submit", function(){
     User.validate();
  });
  //clear err mssg for invalid form submission when user clicks into a field to correct err
  document.querySelector("#register-email").addEventListener("click", function (event) {
    document.querySelector("#form-error").innerHTML = "";
  });
  document.querySelector("#register-name").addEventListener("click", function (event) {
    document.querySelector("#form-error").innerHTML = "";
  });  


  /////////// modules /////////// 
  var Pageload = (function(){ 
    var registrantForm  = document.querySelector("#registrantForm"),
        registrantsDiv  = document.querySelector("#displayRegistrants"),
        deleteButtons   = document.getElementsByClassName("delete-registrant-button");

    request.onload = function() {
      var registrantList = JSON.parse(request.responseText);
      
      if (request.status == 200) {       
          displayRegistrants(registrantList);
        } 
      else {
        var pageError = document.createElement("div");
        pageError.innerHTML = "Uh oh! SOmething went wrong. Please refresh your browser.";

        document.querySelector("#displayRegistrants").append(pageError);
        }
    }; 

    request.open("GET", "http://localhost:9292", true);
    request.send();

    //build out list of registrants
    function displayRegistrants(arry){
      if(typeof arry === 'object' && arry.guests.length) {
        for(var i = 0; i < arry.guests.length; i++) {
          var container       = document.createElement("div"),
              hamburger       = document.createElement("button"),        
              registrantInfo  = document.createElement("div"),
              deleteUser      = document.createElement("button");
     
          container.className = "registrant-div row";

          hamburger.className = "hamburger col-sx-2 col-sm-1";
          hamburger.innerHTML = "&#9776";

          registrantInfo.className = "registrant-info col-sx-8 col-sm-10";
          registrantInfo.innerHTML = "<h4>" +  arry.guests[i].name + " (" + arry.guests[i].email + ")" + "</h4>";

          deleteUser.className = "delete-registrant-button col-sx-2 col-sm-1";
          deleteUser.innerHTML = "&#735;";
          // now add the data we will need to delete the correct user
          deleteUser.setAttribute('data', arry.guests[i].email);
          // and attach a listener to the delete button
          deleteUser.addEventListener('click', User.delete);

          container.appendChild(hamburger);
          container.appendChild(registrantInfo);
          container.appendChild(deleteUser);
          registrantsDiv.appendChild(container);
        }
      }
    }
  })();


  var User = (function(){     
    function vaidateForm() {
      var error_field = document.querySelector("#form-error"),
          nameInput   = document.querySelector("#register-name").value,
          emailInput  = document.querySelector("#register-email").value,
          regex       = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

      //since safari does not render html5 form validation error mssgs
      if(!regex.test(emailInput)  || emailInput.length === 0 || nameInput.length === 0) {
          error_field.innerHTML = "You must provide a name and valid email.";
          event.preventDefault();
          return false;
        }
    }
    function deleteRegistrant(){
      var attribute     = this.getAttribute("data"),
          registrantDiv = this.parentNode,
          parent        = this.parentNode.parentNode;
  
        request.open("DELETE", "http://localhost:9292/" + attribute, true);
        request.send();
        request.onload = remove();

      function remove(){
        parent.removeChild(registrantDiv);
      }
    } 

    return {
      validate: vaidateForm,
      delete: deleteRegistrant
    };
  })();



/////////// jQuery sort ///////////
  $( ".registrants" ).sortable({
    appendTo: document.body,
    axis: "y"
  });

};
