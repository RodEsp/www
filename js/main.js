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

    return;
};

nameDiv.addEventListener("click", function () {
    for (i = 0; i < sections.length; i++) {
        sections[i].classList.remove("appear");
        sections[i].classList.add("disappear");
    }
//    if (linkIsOpen) {
//        titleBar.style.top = "0px";
//    }
    titleBar.classList.remove("slideUp");
//    slide(titleBar, Math.ceil((window.innerHeight / 2) - (titleBar.clientHeight / 2)));
    linkIsOpen = false;
    //Force clicks so animation for sliding name down will be faster.
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
//    nameDiv.click();
});

for (i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function () {
        titleBar.classList.add("slideUp");

        for (var j = 0; j < sections.length; j++) {
            sections[j].classList.remove("appear");
            sections[j].classList.remove("disappear");
        }

        var section = document.getElementById(this.innerHTML.toLowerCase());
        if (!linkIsOpen) {
            setTimeout(function () {
                section.classList.add("appear");
            }, 200);
        } else {
            section.classList.add("appear");
        }

        linkIsOpen = true;
    });
}
