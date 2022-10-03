 
//Contact Form Logic
const form = document.getElementById("contact-form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();

  let mail = new FormData(form);

  sendMail(mail);
})

const sendMail = (mail) => {
    const formSection = document.getElementById("rightContactSection");
    const formErrorField = document.getElementById("formErrorField");
    fetch("/send", {
      method: "post",
      body: mail,

    }).then((response) => {
        return response.json()
    }).then((data) => {
        const {message} = data;

        if (message != 'Message Sent!') {
            formErrorField.innerHTML = message;
        } else {
            formSection.innerHTML = `<h2>Get In Touch</h2><p>${message}</p>`
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    const name = ['firstname', 'lastname'];
    name.forEach((name) => {
        const ele = document.getElementById(name);
        const state = {
            value: ele.value,
        };

        ele.addEventListener('keydown', function (e) {
            const target = e.target;
            state.selectionStart = target.selectionStart;
            state.selectionEnd = target.selectionEnd;
        });

        ele.addEventListener('input', function (e) {
            const target = e.target;

            if (/^[a-zA-Z\s]*$/.test(target.value)) {
                state.value = target.value;
            } else {
                // Users enter the not supported characters
                // Restore the value and selection
                target.value = state.value;
                target.setSelectionRange(state.selectionStart, state.selectionEnd);
            }
        });
    })
});

//-----------------------------------------------------------------------------------------------------------
//Intro Animation
const animateNavBar = () => {
    setTimeout(() => {
        document.getElementById('introContainer').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('mainContent').classList.add('animateNavBar');
    }, 3500);
};

window.addEventListener('load', () => {
    animateNavBar();
});

//-----------------------------------------------------------------------------------------------------------
//Image Modal Logic
const modal = document.getElementById("portfolioModal");

const openImageModal = (element) => {
    const background = element.style.backgroundImage;
    var backgroundUrl = background.slice(4, -1).replace(/["']/g, "");
    const ariaLabel = element.attributes[2].nodeValue;
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");

    modal.style.display = "block";
    modalImg.src = backgroundUrl;
    captionText.innerHTML = ariaLabel;

    //prevent body being scrolled behind modal
    document.body.style.overflowY = 'hidden';
}

const span = document.getElementsByClassName("close")[0];

span.onclick = function() {
modal.style.display = "none";
document.body.style.overflowY = 'unset';
}

const pItems = ['AestheticsByNkechi', 'justSomePlants', 'ShahProperties', 'EtherealImagery'];
const pImages = {
    'AestheticsByNkechi': './assets/portfolioImages/aestheticsByNkechiMockup.png',
    'justSomePlants': './assets/portfolioImages/justSomePlantsMockup.png',
    'ShahProperties': './assets/portfolioImages/shahPropertiesMockup.png',
    'EtherealImagery': './assets/portfolioImages/etherealImagery.png'
};

pItems.forEach((i) => {
    let portfolioItem = document.getElementById(i);
    portfolioItem.style.backgroundImage = `url(${pImages[i]})`;
    portfolioItem.addEventListener('click', () => {
        openImageModal(portfolioItem);
    });
});


//-----------------------------------------------------------------------------------------------------------
//Menu Logic
const menuCheckbox = document.getElementById("openSidebarMenu");

const setCheckbox = () => {
    menuCheckbox.checked = !menuCheckbox.checked
};

const sideBarMenuItems = document.querySelectorAll('.sideMenuA').forEach((i) => {
    i.addEventListener('click', () => {
        setCheckbox();
    })
});


//-----------------------------------------------------------------------------------------------------------
//Scrolled Navbar
const navbar = document.getElementById('nav');
window.onscroll = () => {
    if (window.scrollY > 5) {
        navbar.classList.add('nav-active');
    } else {
        navbar.classList.remove('nav-active');
    }
};
