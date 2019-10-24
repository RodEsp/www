let i; //Counter
let linkIsOpen = false;
const titleBar = document.getElementById('titleBar');
const nameDiv = document.getElementById('name');
const navLinks = document.getElementsByClassName('navLink');
const sections = document.getElementsByClassName('section');

//Accepts an HTML element object and centers it in the browser window.
const verticalCenterInBrowser = function (element) {
	element.style.position = 'relative';
	element.style.top = Math.ceil((window.innerHeight / 2) - (element.clientHeight / 2)).toString() + 'px';
};
verticalCenterInBrowser(titleBar);

window.onresize = function () {
	verticalCenterInBrowser(titleBar);
};

nameDiv.addEventListener('click', function () {
	for (i = 0; i < sections.length; i++) {
		sections[i].classList.remove('appearTransparent');
	}
	setTimeout(function () {
		titleBar.classList.remove('slideUp');
	}, 200);
	linkIsOpen = false;
});

for (i = 0; i < navLinks.length; i++) {
	navLinks[i].addEventListener('click', function () {
		titleBar.classList.add('slideUp');

		for (let j = 0; j < sections.length; j++) {
			sections[j].classList.remove('appearTransparent');
		}

		const section = document.getElementById(this.innerText.toLowerCase());
		if (!linkIsOpen) {
			setTimeout(function () {
				section.classList.add('appearTransparent');
			}, 200);
		} else {
			section.classList.add('appearTransparent');
		}

		linkIsOpen = true;
	});
}