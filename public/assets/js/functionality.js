// namespace? 
window.onload = function() { 
  var registrantCount,
      renderWelcome,
      xmlrequest = new XMLHttpRequest();

  document.querySelector("#register-name").value  = "";
  document.querySelector("#register-email").value = "";

  // will remove the welcome registrant mssg bar on page refresh, render it otherwise
  //chrome >= 6, IE >= 9, Firefox >= 7, safari >= 8, opera >= 15
  if (performance.navigation.type  === 1 ) {
    renderWelcome = false;
  } else {
    renderWelcome = true;
  }



  ///////// Event Listeners /////////
  document.querySelector("#registrantForm").addEventListener("submit", function() {
    User.validate();
  });
  //clear err mssg for invalid form submission when user clicks into either field
  document.querySelector("#register-email").addEventListener("click", function (event) {
    document.querySelector("#registrant-form-error").innerHTML = "";
  });
  document.querySelector("#register-name").addEventListener("click", function (event) {
    document.querySelector("#registrant-form-error").innerHTML = "";
  }); 



  /////////// modules /////////// 
  var Display = (function() { 
    var registrantForm  = document.querySelector("#registrantForm"),
        registrantsDiv  = document.querySelector("#displayRegistrants"),
        deleteButtons   = document.getElementsByClassName("delete-registrant-button");

    xmlrequest.onload = function() {
      var registrantList = JSON.parse(xmlrequest.responseText);
      
      if (xmlrequest.status == 200) {
          registrantCount = registrantList.guests.length;    
          displayRegistrants(registrantList);
        } 
      else {
        var pageError = document.createElement("div");
        pageError.innerHTML = "Uh oh! SOmething went wrong. Please refresh your browser.";

        document.querySelector("#displayRegistrants").append(pageError);
        }
    }; 

    xmlrequest.open("GET", "http://localhost:9292", true);
    xmlrequest.send();

    function generateNoRegistrantsDiv() {
      var div = document.createElement("div");
      var p = document.createElement("p");
      
      p.innerHTML = "There are no registrants";
      div.className = "no-registrants";

      div.appendChild(p);
      document.querySelector("#displayRegistrants").appendChild(div);
    }

    function registerMssg() {
      var name = document.cookie.split("name=")[1];
        
        if(name.length > 0 && renderWelcome){
          var displayDiv  = document.createElement("div"),
              displayText = document.createElement("p"),
              mainContent = document.querySelector(".main-content");

          
          displayDiv.className  = "row signup-mssg";
          displayText.innerHTML = "Thank you for registering " + name; 
          displayDiv.appendChild(displayText); 
          document.querySelector(".container").insertBefore(displayDiv, mainContent);
        }
    }

    //build out list of registrants
    function displayRegistrants(arry) {
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
        registerMssg();
      } 
      else {
        generateNoRegistrantsDiv();
      }
    }

    return {
      noRegistrants: generateNoRegistrantsDiv
    };
  })();

  var User = (function() {  
    function vaidateForm() {
      var error_field = document.querySelector("#registrant-form-error"),
          nameInput   = document.querySelector("#register-name").value,
          emailInput  = document.querySelector("#register-email").value,
          regex       = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      
      //since safari does not render html5 form validation error mssgs
      if(!regex.test(emailInput)  || emailInput.length === 0 || nameInput.length === 0) {
          error_field.innerHTML = "You must provide a name and valid email.";
          event.preventDefault();
          return false;
        }
      
      //create a cookie to grab the name of the last registered user
      document.cookie = "name = " + nameInput;
      
      welcomeMssg = true;         
    }
    function deleteRegistrant() {
      var attribute     = this.getAttribute("data"),
          registrantDiv = this.parentNode,
          parent        = this.parentNode.parentNode;
  
        xmlrequest.open("DELETE", "http://localhost:9292/" + attribute, true);
        xmlrequest.send();
        xmlrequest.onload = remove();

      function remove() {
        parent.removeChild(registrantDiv);

        //reveal the no-registrant div again if user deletes last registrant
        if(registrantCount > 0) {
          registrantCount -= 1;
        }
        if(registrantCount === 0) {
          Display.noRegistrants();
        }
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
