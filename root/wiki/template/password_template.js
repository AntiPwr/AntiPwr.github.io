
        function passwordProtect() {
          // Change this password to something else for each page:
          const correctPassword = "____";
          const userInput = prompt("Enter the password to access ____ page:");
    
          if (userInput !== correctPassword) {
            alert("Wrong password. You will be redirected.");
            // Redirect them elsewhere (e.g., your homepage)
            window.location.href = "../scape_wiki_homepage.html";
          }
        }
    
        // Prompt for password once the page loads
        window.onload = passwordProtect;
