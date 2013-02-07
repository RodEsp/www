$(document).ready(function () {
    verticalCenterInBrowser($("#name"));
});

//Accepts jQuery element object and centers it in the browser window.
var verticalCenterInBrowser = function (element) {
    element.css("position", "relative");
    element.css("top", ($(window).height()/2) - (element.outerHeight()/2));
};

$(window).resize(function () {
    verticalCenterInBrowser($("#name"));
});