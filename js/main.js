var i, //Counter
    linkIsOpen = false,
    titleBar = document.getElementById("titleBar"),
    nameDiv = document.getElementById("name"),
    navLinks = document.getElementsByClassName("navLink"),
    sections = document.getElementsByClassName("section");

//Accepts an HTML element object and centers it in the browser window.
var verticalCenterInBrowser = function (element) {
    element.style.position = "relative";
    element.style.top = Math.ceil((window.innerHeight / 2) - (element.clientHeight / 2)).toString() + "px";
};
verticalCenterInBrowser(titleBar);

window.onresize = function () {
    verticalCenterInBrowser(titleBar);
};

var slide = function (element, heightCoord) {
    var newHeight = 0;
    if (element.getBoundingClientRect().top > heightCoord) {
        newHeight = element.offsetTop - 1;
    } else {
        newHeight = element.offsetTop + 1;
    }
    element.style.top = newHeight.toString() + "px";

    setTimeout(function () {
        if (element.getBoundingClientRect().top != heightCoord) {
            slide(element, heightCoord);
        }
    }, 0);
};

nameDiv.addEventListener("click", function () {
    for (i = 0; i < sections.length; i++) {
        sections[i].classList.remove("appearTransparent");
    }
    setTimeout(function () {
        titleBar.classList.remove("slideUp");
    }, 300);
    linkIsOpen = false;
});

for (i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function () {
        titleBar.classList.add("slideUp");

        for (var j = 0; j < sections.length; j++) {
            sections[j].classList.remove("appearTransparent");
        }

        var section = document.getElementById(this.innerText.toLowerCase());
        if (!linkIsOpen) {
            setTimeout(function () {
                section.classList.add("appearTransparent");
            }, 200);
        } else {
            section.classList.add("appearTransparent");
        }

        linkIsOpen = true;
    });
}