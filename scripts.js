const windows = {
    'internet': 'Internet Explorer',
    'documents': 'My Documents',
    'recycle': 'Recycle Bin',
    'computer': 'My Computer'
};

let isDragging = false;
let currentWindow = null;
let offsetX, offsetY;
let draggedElement = null;

function startDragging(e, window) {
    isDragging = true;
    currentWindow = window;
    offsetX = e.clientX - window.getBoundingClientRect().left;
    offsetY = e.clientY - window.getBoundingClientRect().top;
    setActiveWindow(window.id.replace('Window', ''));
}

function stopDragging() {
    isDragging = false;
    currentWindow = null;
}

function drag(e) {
    if (isDragging && currentWindow) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // Ensure the window stays within the viewport
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight;
        
        currentWindow.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
        currentWindow.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    }
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDragging);

function handleClick(elementId, isClose = false) {
    playClickSound();
    if (isClose) {
        closeElement(elementId);
        // Check if we're closing the dreams image
        if (elementId === 'imageModal' && document.getElementById('modalImage').src.includes('dairy.jpg')) {
            setTimeout(() => {
                updateDreamsCloseModalText();
                openElement('dreamsCloseModal');
            }, 100);
        }
    } else {
        openElement(elementId);
    }
    
    // Special handling for DreamsAboutYou.txt
    if (elementId === 'dreamsTextModal') {
        openImageModal('images/dairy.jpg');
    }

    // Special handling for textModal
    if (elementId === 'textModal') {
        updateTextModalContent();
    }
}

function updateDreamsCloseModalText() {
    const dreamsTextInRecycle = document.getElementById('recycleBinContents').contains(document.getElementById('dreamsText'));
    if (dreamsTextInRecycle) {
        document.querySelector('#dreamsCloseModal .modal-content p').textContent = 'They were very cute, but they definitely were not about me...';
    } else {
        document.querySelector('#dreamsCloseModal .modal-content p').innerHTML = 'Puah, you should put this in <strong>Recycle</strong> bin IYKWIM (¬`‸´¬)';
    }
}

function updateTextModalContent() {
    const documentsContents = document.getElementById('documentsContents');
    const inaiPictureInDocuments = documentsContents.contains(document.getElementById('inaiPicture'));
    const inaiTextInDocuments = documentsContents.contains(document.getElementById('inaiText'));
    const guitarTabInDocuments = documentsContents.contains(document.getElementById('guitarTab'));

    if (inaiTextInDocuments && !inaiPictureInDocuments && guitarTabInDocuments) {
        document.querySelector('#textModal .modal-content p').textContent = 'I wish you could play it for me';
    } else if (inaiPictureInDocuments && inaiTextInDocuments) {
        document.querySelector('#textModal .modal-content p').textContent = 'Do you want to keep me among your things? How sweet...';
    } else {
        document.querySelector('#textModal .modal-content p').textContent = 'So you threw me here? How cruel...';
    }
}

function playClickSound() {
    const clickSound = document.getElementById('clickSound');
    clickSound.currentTime = 0; // Rewind to the start
    clickSound.play();
}

function openElement(elementId) {
    const element = document.getElementById(elementId + 'Window') || document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
        if (element.classList.contains('window')) {
            centerWindow(element);
            addTaskbarItem(elementId);
            setActiveWindow(elementId);
        } else if (element.classList.contains('modal')) {
            centerModal(element);
            document.body.classList.add('modal-open');
            if (elementId === 'textModal') {
                element.style.zIndex = 2000; // Ensure the z-index is higher than the windows
            }
        }
    }
}

function closeElement(elementId) {
    const element = document.getElementById(elementId + 'Window') || document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
        if (element.classList.contains('window')) {
            removeTaskbarItem(elementId);
        } else if (element.classList.contains('modal')) {
            document.body.classList.remove('modal-open');
        }
        // Play click sound when closing any element, including modals
        playClickSound();
    }
}

function centerWindow(windowElement) {
    const windowWidth = windowElement.offsetWidth;
    const windowHeight = windowElement.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const left = Math.max(0, (screenWidth - windowWidth) / 2);
    const top = Math.max(0, (screenHeight - windowHeight) / 2);
    
    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
}

function centerModal(modal) {
    const modalContent = modal.querySelector('.modal-content');
    const windowRect = modal.getBoundingClientRect();
    
    modal.style.left = windowRect.left + 'px';
    modal.style.top = windowRect.top + 'px';
    modal.style.width = windowRect.width + 'px';
    modal.style.height = windowRect.height + 'px';

    const contentRect = modalContent.getBoundingClientRect();
    modalContent.style.marginTop = ((windowRect.height - contentRect.height) / 2) + 'px';
}

function addTaskbarItem(windowName) {
    const taskbarItems = document.getElementById('taskbarItems');
    if (!document.getElementById('taskbar-' + windowName)) {
        const item = document.createElement('div');
        item.id = 'taskbar-' + windowName;
        item.className = 'taskbar-item';
        item.textContent = windows[windowName];
        item.onclick = () => toggleWindow(windowName);
        taskbarItems.appendChild(item);
    }
}

function removeTaskbarItem(windowName) {
    const item = document.getElementById('taskbar-' + windowName);
    if (item) {
        item.remove();
    }
}

function toggleWindow(windowName) {
    const windowElement = document.getElementById(windowName + 'Window');
    if (windowElement.style.display === 'none') {
        windowElement.style.display = 'block';
        setActiveWindow(windowName);
    } else {
        setActiveWindow(windowName);
    }
}

function setActiveWindow(windowName) {
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => win.style.zIndex = 1);
    const activeWindow = document.getElementById(windowName + 'Window');
    activeWindow.style.zIndex = 2;

    const taskbarItems = document.querySelectorAll('.taskbar-item');
    taskbarItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.getElementById('taskbar-' + windowName);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function toggleHeart(element) {
    element.classList.toggle('active');
}

function sendQuestion() {
    playClickSound(); // Add this line to play the click sound
    const questionInput = document.getElementById('questionInput');
    const disclaimerCheckbox = document.getElementById('disclaimerCheckbox');
    const question = questionInput.value.trim();

    if (question === '') {
        alert("Don't be shy, enter a question.");
        return;
    }

    if (!disclaimerCheckbox.checked) {
        alert('Are you trying to lie to me? Check the box!');
        return;
    }

    // Check for links in the question
    if (question.match(/https?:\/\/[^\s]+/) || question.includes('www.')) {
        alert('For security reasons, questions containing links cannot be sent.');
        return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('question', question);

    // Send AJAX request
    fetch('https://formspree.io/f/mblrbqjz', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            // Show success message
            alert('Your question has been sent to your dear Inai Eri!');
            // Clear input fields
            questionInput.value = '';
            disclaimerCheckbox.checked = false;
            updateSendButton();
            closeElement('questionModal');
        } else {
            // Show error message
            alert('Oops! There was a problem sending your question. Please try again.');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Oops! There was a problem sending your question. Please try again.');
    });
}

function updateSendButton() {
    const question = document.getElementById('questionInput').value;
    const disclaimerCheckbox = document.getElementById('disclaimerCheckbox');
    const sendButton = document.querySelector('.send-button');

    sendButton.disabled = !(question.trim() !== '' && disclaimerCheckbox.checked);
}

// Add event listeners to update the send button state
document.getElementById('questionInput').addEventListener('input', updateSendButton);
document.getElementById('disclaimerCheckbox').addEventListener('change', updateSendButton);

// Close the modal if clicked outside of it
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            closeElement(modal.id);
        }
    });
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = "block";
    modalImg.src = imageSrc;
    modalImg.style.maxWidth = "90%";
    modalImg.style.maxHeight = "90%";
    document.body.classList.add('modal-open');
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = "none";
    document.body.classList.remove('modal-open');
    
    // Check if we're closing the dreams image
    if (document.getElementById('modalImage').src.includes('dairy.jpg')) {
        setTimeout(() => {
            openElement('dreamsCloseModal');
        }, 100);
    }
}

// Close the image modal if clicked outside of the image
window.onclick = function(event) {
    var modal = document.getElementById('imageModal');
    if (event.target == modal) {
        closeImageModal();
    }
}

// Modify the openWindow function to remove the recycle bin state reset
function openWindow(windowName) {
    const windowElement = document.getElementById(windowName + 'Window');
    windowElement.style.display = 'block';
    
    // Center the window on the screen
    const windowWidth = windowElement.offsetWidth;
    const windowHeight = windowElement.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const left = Math.max(0, (screenWidth - windowWidth) / 2);
    const top = Math.max(0, (screenHeight - windowHeight) / 2);
    
    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
    
    addTaskbarItem(windowName);
    setActiveWindow(windowName);
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const date = now.toLocaleDateString();
    const clockElement = document.getElementById('clock');
    clockElement.innerHTML = `
        <img src="images/Microsoft Windows 3 Clock.png" alt="Clock" class="clock-icon">
        <span class="clock-time">${time}</span>
        <span class="clock-separator"></span>
        <span class="clock-date">${date}</span>
    `;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to display the time immediately
updateClock();

document.addEventListener('DOMContentLoaded', updateClock);

function emptyRecycleBin() {
    const recycleBinContents = document.getElementById('recycleBinContents');
    const recycleBinSound = new Audio('sounds/Windows 98 Recycle Sound Effect (HD).mp3');
    
    recycleBinSound.play();
    
    const dreamsText = document.getElementById('dreamsText');
    const guitarTab = document.getElementById('guitarTab');
    const inaiPicture = document.getElementById('inaiPicture');
    const inaiText = document.getElementById('inaiText');
    
    const onlyDreamsTextInRecycle = recycleBinContents.children.length === 1 && recycleBinContents.contains(dreamsText);
    const onlyGuitarTabInRecycle = recycleBinContents.children.length === 1 && recycleBinContents.contains(guitarTab);
    const wasDreamsTextLastItem = recycleBinContents.children.length === 0 && recycleBinContents.dataset.lastItem === 'dreamsText';
    const wasGuitarTabLastItem = recycleBinContents.children.length === 0 && recycleBinContents.dataset.lastItem === 'guitarTab';
    const allItemsInRecycle = recycleBinContents.contains(guitarTab) && recycleBinContents.contains(inaiPicture) && recycleBinContents.contains(inaiText) && !recycleBinContents.contains(dreamsText);

    if (onlyDreamsTextInRecycle) {
        recycleBinContents.innerHTML = '';
        recycleBinContents.dataset.lastItem = 'dreamsText';
        recycleBinSound.onended = function() {
            alert("Perfect~ this way you won't hurt anyone anymore.");
        };
    } else if (onlyGuitarTabInRecycle) {
        recycleBinContents.innerHTML = '';
        recycleBinContents.dataset.lastItem = 'guitarTab';
        recycleBinSound.onended = function() {
            alert("I would like to be able to encourage you in things you love, one last time...");
        };
    } else if (wasDreamsTextLastItem) {
        // Recycle bin is empty, but the last item was dreamsText
        recycleBinSound.onended = function() {
            alert("You won't get them back.");
        };
    } else if (wasGuitarTabLastItem) {
        // Recycle bin is empty, but the last item was guitarTab
        recycleBinSound.onended = function() {
            alert("I would like to be able to encourage you in things you love, one last time...");
        };
    } else if (allItemsInRecycle) {
        recycleBinContents.innerHTML = '';
        recycleBinContents.dataset.lastItem = '';
        recycleBinSound.onended = function() {
            alert("You should not throw away what you love.");
        };
    } else if (recycleBinContents.children.length === 0) {
        // Recycle bin is already empty
        recycleBinSound.onended = function() {
            alert('Calm down... I have already disappeared, both from your life and from your computer.');
        };
    } else {
        // Recycle bin has contents, proceed with emptying
        recycleBinContents.innerHTML = '';
        recycleBinContents.dataset.lastItem = '';
        recycleBinSound.onended = function() {
            alert('Deep down, I wonder if the all good things you told me were true.');
        };
    }
}

// Add this function to set up event listeners
function setupQuestionModal() {
    const sendButton = document.getElementById('sendButton');
    const questionInput = document.getElementById('questionInput');
    const disclaimerCheckbox = document.getElementById('disclaimerCheckbox');

    sendButton.addEventListener('click', sendQuestion);

    function updateSendButton() {
        sendButton.disabled = !(questionInput.value.trim() !== '' && disclaimerCheckbox.checked);
    }

    questionInput.addEventListener('input', updateSendButton);
    disclaimerCheckbox.addEventListener('change', updateSendButton);
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', setupQuestionModal);

function handleFileClick(imageSrc) {
    playClickSound();
    openImageModal(imageSrc);
}

function playClickSound() {
    const clickSound = document.getElementById('clickSound');
    clickSound.currentTime = 0; // Rewind to the start
    clickSound.play();
}

function handleDragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    if (draggedElement) {
        const targetContainer = event.target.closest('.window-content');
        if (targetContainer) {
            targetContainer.appendChild(draggedElement);
            draggedElement = null;
        }
    }
}