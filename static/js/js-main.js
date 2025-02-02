
function setOrUpdateCookie(name, value, days) {
	let expires = "";
    if (days) {
		const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function updateLanguage(tl){
	setOrUpdateCookie("locale", tl, 30);
	window.location.reload();
}

function safeBtoa(input) {
    const utf8Bytes = new TextEncoder().encode(input);
    const base64String = btoa(String.fromCharCode(...utf8Bytes));
    return base64String;
}

// dark mode
const html = document.querySelector('html');
const toggleModeBtns = document.querySelectorAll('.btn-mode');
const currentMode = localStorage.getItem('mode') || 'dark';
function setMode(mode) {
	html.classList.toggle('dark', mode === 'dark');
	localStorage.setItem('mode', mode);
	setOrUpdateCookie("theme", mode, 30);
}
function toggleMode() {
	const newMode = html.classList.contains('dark') ? 'light' : 'dark';
	setMode(newMode);
}
setMode(currentMode);
toggleModeBtns.forEach(btn => btn.addEventListener('click', toggleMode));

// toggle box
function toggleBox(event) {
	event.preventDefault();
	const targetId = this.getAttribute("data-target");
	const target = document.getElementById(targetId);
	const expanded = this.getAttribute("aria-expanded") === "true";
	const buttonsWithSameTarget = document.querySelectorAll(`[data-target="${targetId}"]`);
	buttonsWithSameTarget.forEach((button) => {
		button.setAttribute("aria-expanded", !expanded);
		button.classList.toggle("on");
	});
	target.setAttribute("aria-hidden", expanded);
	target.classList.toggle("show");
	if (this.classList.contains("btn-viewport")) {
		document.documentElement.classList.toggle("overflow-hidden");
		document.documentElement.classList.toggle("2xl:overflow-visible");
	}
}
const toggleButtons = document.querySelectorAll(".btn-toggle");
toggleButtons.forEach((button) => {
	button.addEventListener("click", toggleBox);
});
function handleEscapeKey(event) {
	if (event.key === "Escape") {
		const btnViewport = document.querySelector(".btn-toggle.btn-viewport.on");
		if (btnViewport) {
			toggleBox.call(btnViewport, event);
		}
	}
}
document.addEventListener("keydown", handleEscapeKey);

// repeat
const parentDivsToRepeat = document.querySelectorAll('[data-repeat]');
parentDivsToRepeat.forEach((parentDiv) => {
	const repeatCount = parseInt(parentDiv.dataset.repeat);
	for (let i = 1; i < repeatCount; i++) {
		const clonedDiv = parentDiv.cloneNode(true);
		repeatChildren(clonedDiv);
		parentDiv.parentNode.insertBefore(clonedDiv, parentDiv.nextSibling);
	}
});
function repeatChildren(parent) {
	const childDivsToRepeat = parent.querySelectorAll('[data-repeat]');
	childDivsToRepeat.forEach((childDiv) => {
		const repeatCount = parseInt(childDiv.dataset.repeat);
		for (let i = 1; i < repeatCount; i++) {
			const clonedDiv = childDiv.cloneNode(true);
			repeatChildren(clonedDiv);
			childDiv.parentNode.insertBefore(clonedDiv, childDiv.nextSibling);
		}
	});
};

// modal
let currentlyOpenModal = null;
function registerModals(){
	const openModalButtons = document.querySelectorAll('.btn-modal');
	const closeModalButtons = document.querySelectorAll('.btn-modal-close');
	const modals = document.querySelectorAll('.modal');

	openModalButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			const modalId = button.getAttribute('data-modal');
			let modal = document.getElementById(modalId);

			if (currentlyOpenModal) {
			currentlyOpenModal.close();
			}

			if (modal) {
				if (e.currentTarget.dataset.trailer && e.currentTarget.dataset.trailer !== "") {
					if(e.currentTarget.dataset.trailer != "N/A"){
						let trailer_ifr = document.getElementById('trailer-iframe');
						trailer_ifr.src = e.currentTarget.dataset.trailer;
					}else{
						modal = document.getElementById("modal-info");
						if (currentlyOpenModal) {
							currentlyOpenModal.close();
						}

					}
				}

				if(modalId == "modal-create-list"){
					document.querySelector("#user-create-list-status").innerHTML = "";
					document.querySelector("#modal-create-list #collection_name").value = ""
					document.querySelector("#modal-create-list #collection_desc").value = ""
				}

				if(modalId == "modal-add-to-list"){
					document.querySelector("#searchContainer-wrapper").innerHTML = "";
					document.querySelector("#list_content_search").value = ""
				}
			modal.showModal();
			currentlyOpenModal = modal;
			}
		});
	});

	closeModalButtons.forEach(button => {
		button.addEventListener('click', () => {
			const modalId = button.getAttribute('data-modal');
			const modal = document.getElementById(modalId);
			if (modal) {
				//check if the modal is a notice that we need to save the state of (so we dont show it again)
				if(typeof modalId !== 'undefined' && modalId.includes("modal-notice")){
					localStorage.setItem(modalId, true);
				}

				modal.close();
				currentlyOpenModal = null;
			}
		});
	});

	modals.forEach(modal => {
		modal.addEventListener('click', (event) => {
			if (event.target === modal) {
			modal.close();
			currentlyOpenModal = null;
			}
		});
	});

	document.addEventListener('DOMContentLoaded', () => {
		const modal = document.getElementById('modal-rating');
		if (modal) {
			modal.showModal();
			currentlyOpenModal = modal;
		}
	});

	//show notice modal if not seen yet
	let last_notice_seen = localStorage.getItem('modal-notice-' + LATEST_NOTICE_ID) || false;
	if(!last_notice_seen){
		let notice_modal = document.querySelector("#modal-notice-" + LATEST_NOTICE_ID);
		if(notice_modal){
			notice_modal.showModal();
		}
	}
}

// tabs
const switchTab = (buttons, button, panels) => {
	buttons.forEach((btn) => {
		const isSelected = btn === button;
		btn.classList.toggle('current', isSelected);
		btn.setAttribute('aria-selected', isSelected.toString());
	});
	panels.forEach((panel) => {
		const isShown = panel.getAttribute('aria-labelledby') === button.getAttribute('id');
		panel.classList.toggle('show', isShown);
		panel.setAttribute('aria-hidden', (!isShown).toString());
	});
};
const initTabs = (tab) => {
	const buttons = tab.querySelectorAll('.tab-btn');
	const panels = tab.querySelectorAll('.tab-cnt');

	buttons.forEach((button) => {
		button.addEventListener('click', () => switchTab(buttons, button, panels));
	});
};
const tabs = document.querySelectorAll('.tabs');
tabs.forEach(initTabs);

// dropdown
document.addEventListener('DOMContentLoaded', function () {
	const dropdownContainers = document.querySelectorAll('.dropdown');
	function toggleMenu(dropdownContainer, open) {
		const menu = dropdownContainer.querySelector('.dropdown-menu');
		const btn = dropdownContainer.querySelector('.dropdown-button');
		menu.classList.toggle('show', open);
		btn.classList.toggle('on', open);
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
	}
	function closeOtherMenus(currentDropdownContainer) {
		dropdownContainers.forEach(container => {
			if (container !== currentDropdownContainer) {
				toggleMenu(container, false);
			}
		});
	}
	dropdownContainers.forEach(dropdownContainer => {
		const dropdownBtn = dropdownContainer.querySelector('.dropdown-button');
		const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');
		dropdownBtn.addEventListener('click', event => {
			event.stopPropagation();
			const isOpen = dropdownMenu.classList.contains('show');
			closeOtherMenus(dropdownContainer);
			toggleMenu(dropdownContainer, !isOpen);
		});
		dropdownMenu.addEventListener('click', event => {
			event.stopPropagation();
		});
		document.addEventListener('click', () => {
			toggleMenu(dropdownContainer, false);
		});
		document.addEventListener('keydown', event => {
			if (event.key === 'Escape') {
				toggleMenu(dropdownContainer, false);
			}
		});
	});


	//home search submit
	const searchElement = document.getElementById("home-search");
    
    if (searchElement) {
        searchElement.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const searchValue = searchElement.value;
                window.location.href = `/search/?q=${encodeURIComponent(searchValue)}`;
            }
        });

        searchElement.addEventListener("submit", function(event) {
            event.preventDefault();
            const searchValue = searchElement.value;
            window.location.href = `/search/?q=${encodeURIComponent(searchValue)}`;
        });
    }
});

// password
const togglePasswordButtons = document.querySelectorAll('.btn-password');
togglePasswordButtons.forEach(function (button) {
	button.addEventListener('click', function () {
		const passwordFormGroup = this.closest('.control-inp');
		const passwordInput = passwordFormGroup.querySelector('.inp-password');
		const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
		passwordInput.setAttribute('type', type);
		this.classList.toggle('on');
	});
});

// embla
function initiateEmbla(){
	const setupPrevNextBtns = (prevBtn, nextBtn, embla) => {
		if (prevBtn) {
			prevBtn.addEventListener('click', embla.scrollPrev, false);
		}
		if (nextBtn) {
			nextBtn.addEventListener('click', embla.scrollNext, false);
		}
	};	
	const disablePrevAndNextBtns = (prevBtn, nextBtn, embla) => {
		return () => {
			if (embla.canScrollPrev()) prevBtn.removeAttribute('disabled');
			else prevBtn.setAttribute('disabled', 'disabled');

			if (embla.canScrollNext()) nextBtn.removeAttribute('disabled');
			else nextBtn.setAttribute('disabled', 'disabled');
		};
	};	
	const setupDotBtns = (dotsArray, embla) => {
		dotsArray.forEach((dotNode, i) => {
			dotNode.classList.add(
				'embla__dot',
				'w-6', 
				'h-6', 
				'grid', 
				'place-content-center', 
				'opacity-20', 
				'before:w-2', 
				'before:h-2', 
				'before:bg-white', 
				'before:ring-4', 
				'before:ring-white/20', 
				'before:rounded-full',
				'[&.is-selected]:opacity-100',
			);
			dotNode.setAttribute('type', 'button');
			dotNode.setAttribute('aria-label', 'dot button');
			dotNode.addEventListener('click', () => embla.scrollTo(i), false);
		});
	};	
	const generateDotBtns = (dots, embla) => {
		const scrollSnaps = embla.scrollSnapList();
		const dotsFrag = document.createDocumentFragment();
		const dotsArray = scrollSnaps.map(() => document.createElement('button'));
		if (dots) {
			dotsArray.forEach((dotNode) => dotsFrag.appendChild(dotNode));
			dots.appendChild(dotsFrag);
		}
		return dotsArray;
	};	
	const selectDotBtn = (dotsArray, embla) => () => {
		const previous = embla.previousScrollSnap();
		const selected = embla.selectedScrollSnap();
		dotsArray[previous].classList.remove('is-selected');
		dotsArray[selected].classList.add('is-selected');
	};	
	const setupEmbla = (emblaNode, options) => {
		const viewPort = emblaNode.querySelector('.embla__viewport');
		const prevBtn = emblaNode.querySelector('.embla__prev');
		const nextBtn = emblaNode.querySelector('.embla__next');
		const dots = emblaNode.querySelector('.embla__dots');
		const embla = EmblaCarousel(viewPort, options);
		const dotsArray = generateDotBtns(dots, embla);
		const setSelectedDotBtn = selectDotBtn(dotsArray, embla);
		setupPrevNextBtns(prevBtn, nextBtn, embla);
		setupDotBtns(dotsArray, embla);
		embla.on('select', setSelectedDotBtn);
		embla.on('select', disablePrevAndNextBtns);
		embla.on('init', setSelectedDotBtn);
		embla.on('init', disablePrevAndNextBtns);
		if (prevBtn && nextBtn) {
			setupPrevNextBtns(prevBtn, nextBtn, embla);
			embla.on('init', disablePrevAndNextBtns(prevBtn, nextBtn, embla));
			embla.on('select', disablePrevAndNextBtns(prevBtn, nextBtn, embla));
		}

		//scroll to active element (if it exists)
		const activeElement = emblaNode.querySelector('.embla__viewport .active');
		if(typeof activeElement !== "undefined"){
			const allSlides = Array.from(emblaNode.querySelectorAll('.shrink-0'));
			const activeIndex = allSlides.indexOf(activeElement);
			if (activeIndex !== -1) {
				embla.scrollTo(activeIndex);
			  }
		}
	};	
	const options = {
		containScroll: 'trimSnaps',
		skipSnaps: false,
		loop: false
		// direction: 'rtl',
	};	
	const emblaNodes = [].slice.call(document.querySelectorAll('.embla'));

	emblaNodes.map((emblaNode) => {
		setupEmbla(emblaNode, options);
	});
}