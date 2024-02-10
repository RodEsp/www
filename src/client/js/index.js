let linkIsOpen = false;
const titleBar = document.getElementById('titleBar');
const nameDiv = document.getElementById('name');
const emailForm = document.getElementById('emailForm');

const navLinks = document.getElementsByClassName('navLink');
const sections = document.getElementsByClassName('section');

//Accepts an HTML element object and centers it in the browser window.
const verticalCenterInBrowser = function (element) {
	element.style.position = 'relative';
	element.style.top =
    Math.ceil(window.innerHeight / 2 - element.clientHeight / 2).toString() +
    'px';
};
verticalCenterInBrowser(titleBar);

window.onresize = function () {
	verticalCenterInBrowser(titleBar);
};

nameDiv.addEventListener('click', function () {
	for (let i = 0; i < sections.length; i++) {
		sections[i].classList.remove('appearTransparent');
	}
	setTimeout(function () {
		titleBar.classList.remove('slideUp');
	}, 200);
	linkIsOpen = false;
});

for (let i = 0; i < navLinks.length; i++) {
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

emailForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	const name = document.getElementById('contact_name').value;
	const email = document.getElementById('contact_email').value;
	const subject = document.getElementById('contact_subject').value;
	const message = document.getElementById('contact_message').value;

	const response = await fetch('/send_email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name, email, subject, message }),
	});

	if (!response.ok) {
		alert('There was a problem sending your e-mail. Please try again later.');
	} else {
		emailForm.reset();
		alert('Email successfully sent!');
	}
});
