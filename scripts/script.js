const NUMBER_OF_SLIDES = 3; //total number of screens

//---------------------------------------------------------------------------------
//logic for slide-indicator
//---------------------------------------------------------------------------------

//create class for indicator elems
class IndicatorElems {
    elements = [];
    cssClass = "slide-indicator__elem";

    constructor(numberOfElems, domContainer) {
        if (!domContainer) return;

        while (this.elements.length < numberOfElems) {
            let elem = document.createElement("div");
            elem.classList.add(this.cssClass);

            this.elements.push({
                domElem: elem,
                isActive: false,
            });
        }
        domContainer.append(...this.getDomElems());
        this.makeActiveElem(0);
    }

    getDomElems() {
        return this.elements.map((elem) => elem.domElem);
    }

    makeActiveElem(indexOfActive) {
        if (indexOfActive < 0 || indexOfActive >= this.elements.length) return;

        this.elements = this.elements.map((elem, index) => {
            if (indexOfActive == index) {
                elem.domElem.classList.add(`${this.cssClass}-active`);
                return {
                    domElem: elem.domElem,
                    isActive: true,
                };
            } else {
                elem.domElem.classList.remove(`${this.cssClass}-active`);
                return {
                    domElem: elem.domElem,
                    isActive: false,
                };
            }
        });
    }
}

let slideIndicatorContainer = document.querySelector(".slide-indicator");
let indicatorElems = new IndicatorElems(NUMBER_OF_SLIDES, slideIndicatorContainer);

//---------------------------------------------------------------------------------
//logic for vertical scrolling
//---------------------------------------------------------------------------------
const DELTA_SCREEN_CHANGE = 50; //value of delta between previous and current point to trigger change of screens
const SCROLL_AMOUNT = 768; //height of one screen
const SCROLL_ELEM = document.scrollingElement;

let lastKnownY = 0;
let currentShiftY = 0;
let skipEvents = false;

const handleTouchStart = (event) => {
    lastKnownY = event.touches[0].clientY;
};

const handleTouchMove = (event) => {
    if (!SCROLL_ELEM || skipEvents) return;

    let currentY = event.touches[0].clientY;
    if (Math.abs(lastKnownY - currentY) < DELTA_SCREEN_CHANGE) return; //too small distance of touchmove

    skipEvents = true; //allow new events only after touchend

    if (lastKnownY > currentY) {
        //touchmove from bottom to top
        currentShiftY = Math.min(NUMBER_OF_SLIDES, currentShiftY + 1);
    } else {
        //touchmove from top to bottom
        currentShiftY = Math.max(0, currentShiftY - 1);
    }

    SCROLL_ELEM.scrollTop = currentShiftY * SCROLL_AMOUNT;
    indicatorElems.makeActiveElem(currentShiftY); //change active elem in screen indicator
    console.log("Page changed!");

    // setTimeout(() => {
    //     skipEvent = false;
    // }, 1000); //allow events only after 1 sec
};

const handleTouchEnd = () => {
    skipEvents = false; //allow new change of screen
};

document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchend", handleTouchEnd);
document.addEventListener("touchmove", handleTouchMove);

//---------------------------------------------------------------------------------
//logic for horizontal scrolling by slide-changer
//---------------------------------------------------------------------------------

const HORIZONTAL_SCROLL_AMOUNT = 1024;
const HORIZONTAL_SCROLL_ELEM = document.querySelector(".slide-3");
const SLIDE_CHANGER = document.querySelector(".slide-changer input");
const SLIDE_CHANGER_PROGRESS_BAR = document.querySelector(".slide-changer_progress-bar");
const PERCENT_OF_WIDTH_PB = 7;

// let lastKnownPosition = 0;
let currentShiftX = 0;

//func to change width of progress bar SLIDE_CHANGER
const changeWidthPB = () => {
    if (!SLIDE_CHANGER || !SLIDE_CHANGER_PROGRESS_BAR) return;
    SLIDE_CHANGER_PROGRESS_BAR.style.width = `${SLIDE_CHANGER.value * PERCENT_OF_WIDTH_PB}px`;
};

const handleHorizontalMove = () => {
    if (!HORIZONTAL_SCROLL_ELEM || !SLIDE_CHANGER) return;

    let roundedValue = roundValueOfInput(SLIDE_CHANGER.value);

    // if (roundedValue > lastKnownPosition) {
    //     //move to right
    //     currentShiftX = Math.min(NUMBER_OF_SLIDES, currentShiftX + 1); //NUMBER_OF_SLIDES - lucklely it is the same
    // } else if (roundedValue < lastKnownPosition) {
    //     //move to left
    //     currentShiftX = Math.max(0, currentShiftX - 1);
    // } else {
    // }

    currentShiftX = roundedValue / 50; //because we have 3 positions(0, 50, 100) and step is 50

    SLIDE_CHANGER.value = roundedValue;
    changeWidthPB(); //change with of progress bar because input event is not fired here
    // lastKnownPosition = roundedValue;
    HORIZONTAL_SCROLL_ELEM.scrollLeft = currentShiftX * HORIZONTAL_SCROLL_AMOUNT;
};

const roundValueOfInput = (value) => {
    const THRESHOLDS = [0, 50, 100];
    const deltaValues = THRESHOLDS.map((elem) => Math.abs(value - elem));

    let minValue = 100;
    let indexOfMin = 0;
    THRESHOLDS.forEach((_, index) => {
        if (deltaValues[index] < minValue) {
            minValue = deltaValues[index];
            indexOfMin = index;
        }
    });

    return THRESHOLDS[indexOfMin];
};

handleHorizontalMove(); //inicialization
SLIDE_CHANGER.addEventListener("change", handleHorizontalMove);
SLIDE_CHANGER.addEventListener("input", changeWidthPB);
