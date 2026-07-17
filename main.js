document.addEventListener("DOMContentLoaded", () => {
    const floorHeightInPx = getComputedStyle(document.querySelector("html")).getPropertyValue("--floor-height");
    const floorHeight = parseInt(floorHeightInPx.slice(0, floorHeightInPx.length - 2));
    let liftsCount, floorsCount;
    const liftsAvailabilitiy = new Map();
    const liftAt = new Map();
    const floorLiftMap = new Map();
    const pendingCalls = [];

    document.querySelector("button#submit").addEventListener("click", (event) => {
        event.preventDefault();

        const floorsInput = document.querySelector("#floors-input");
        const liftsInput = document.querySelector("#lifts-input");
        floorsCount = floorsInput.value;
        liftsCount = liftsInput.value;

        if (floorsCount <= 0 || floorsCount > 100 || liftsCount <= 0 || liftsCount > 10) {
            alert("Invalid input! Try again.");
            return;
        }

        document.querySelector("#input-box").style.display = "none";
        document.querySelector("#floors-count").textContent = `Floors count - ${floorsCount}`;
        document.querySelector("#lifts-count").textContent = `Lifts count - ${liftsCount}`;

        renderFloors(floorsCount);
        renderLifts(liftsCount);

        // Event delegation for lift buttons
        document.querySelector("#floors-container").addEventListener("click", (event) => {
            if (event.target.classList.contains("lift-control")) {
                handleLiftCall(event);
            }
        });
    });

    document.getElementById('submit').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the form from submitting
        document.body.classList.add('no-background'); // Add class to disable background image
    });
    

    function handleLiftCall(event) {
        console.log("Lift button clicked"); // Debug log
        const calledFloor = event.target.closest(".floor");
        const floorId = calledFloor.id;
        if (floorLiftMap.get(floorId) != null) {
            const mappedLiftId = floorLiftMap.get(floorId);
            if (liftsAvailabilitiy.get(mappedLiftId)) {
                liftsAvailabilitiy.set(mappedLiftId, false);
                openAndCloseDoors(floorId, mappedLiftId);
            }
            return;
        }
        for (let liftNumber = 1; liftNumber <= liftsCount; liftNumber++) {
            const liftId = `lift-${liftNumber}`;
            if (liftsAvailabilitiy.get(liftId)) {
                moveLift(floorId, liftId);
                return;
            }
        }
        pendingCalls.push(floorId);
    }

    function moveLift(floorId, liftId) {
        if (floorLiftMap.get(floorId) != null) {
            const mappedLiftId = floorLiftMap.get(floorId);
            if (liftsAvailabilitiy.get(mappedLiftId)) {
                liftsAvailabilitiy.set(mappedLiftId, false);
                openAndCloseDoors(floorId, mappedLiftId);
            }
            return;
        }

        liftsAvailabilitiy.set(liftId, false);
        floorLiftMap.set(floorId, liftId);
        floorLiftMap.forEach((value, key) => {
            if (key !== floorId && value === liftId) {
                floorLiftMap.set(key, null);
            }
        });

        const floor = document.querySelector(`#${floorId}`);
        const lift = document.querySelector(`#${liftId}`);
        const floorNumber = parseInt(floorId.split('-')[1]);
        const prevFloor = liftAt.get(liftId);
        const diff = Math.abs(prevFloor - floorNumber);
        const transitionDuration = diff * 2;

        lift.style.transform = `translateY(-${floorNumber * floorHeight}px)`;
        lift.style.transition = `all ${transitionDuration}s`;
        setTimeout(() => {
            openAndCloseDoors(floorId, liftId);
        }, transitionDuration * 1000);

        liftAt.set(liftId, floorNumber);
    }

    function openAndCloseDoors(floorId, liftId) {
        const lift = document.querySelector(`#${liftId}`);
        const leftDoor = lift.querySelector(".left-door");
        const rightDoor = lift.querySelector(".right-door");
        leftDoor.classList.add("left-move");
        rightDoor.classList.add("right-move");
        setTimeout(() => {
            leftDoor.classList.remove("left-move");
            rightDoor.classList.remove("right-move");
            setTimeout(() => {
                liftsAvailabilitiy.set(liftId, true);
                if (pendingCalls.length > 0) {
                    const floorIdFromRemainingCalls = pendingCalls.shift();
                    moveLift(floorIdFromRemainingCalls, liftId);
                }
            }, 2500);
        }, 2500);
    }

    function renderFloors(totalFloors) {
        const floorsContainer = document.querySelector("#floors-container");
        for (let floorNumber = totalFloors; floorNumber > 0; floorNumber--) {
            const currentFloor = document.createElement("section");
            currentFloor.className = "floor";
            currentFloor.id = `floor-${floorNumber}`;
            currentFloor.innerHTML = `
                <section class="floor-details">
                    <button class="lift-control up">UP</button>
                    <p class="floor-number">Floor-${floorNumber}</p> 
                    <button class="lift-control down">DOWN</button>
                </section>`;
            floorsContainer.appendChild(currentFloor);
            floorLiftMap.set(`floor-${floorNumber}`, null);
        }
        const groundFloor = document.createElement("section");
        groundFloor.className = "floor";
        groundFloor.id = `floor-0`;
        groundFloor.innerHTML = `
            <section class="floor-details">
                <button class="lift-control up">UP</button>
                <p class="floor-number">Floor-0</p>
            </section>`;
        floorsContainer.appendChild(groundFloor);
        floorLiftMap.set("floor-0", null);
        floorsContainer.style.visibility = "visible";
        floorsContainer.style.border = `2px solid var(--primary-color)`;
    }

    function renderLifts(totalLifts) {
        const groundFloor = document.querySelector("#floors-container>#floor-0");
        for (let liftNumber = 1; liftNumber <= totalLifts; liftNumber++) {
            const currentLift = document.createElement("section");
            currentLift.className = "lift";
            currentLift.id = `lift-${liftNumber}`;
            currentLift.innerHTML = `
            <section class="door left-door"></section>
            <section class="door right-door"></section>`;
            liftsAvailabilitiy.set(`lift-${liftNumber}`, true);
            liftAt.set(`lift-${liftNumber}`, 0);
            groundFloor.appendChild(currentLift);
        }
    }
});
