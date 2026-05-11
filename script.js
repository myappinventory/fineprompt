// Your exact Google Sheets CSV link:
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxhjVFiCnYAgvJKfyTCiLzLU56erqxeRfNNJRvNc5Vb83QJHtaDkMPWD7rX_CdgmYKZwb7fcinDb46/pub?gid=0&single=true&output=csv";

const gallery = document.getElementById('gallery');
const toast = document.getElementById('toast');

function showToast() {
    toast.className = "copy-toast show-toast";
    setTimeout(() => { toast.className = toast.className.replace("show-toast", ""); }, 3000);
}

// A robust CSV parser that handles line breaks INSIDE your quotes
function parseCSV(text) {
    let rows = [];
    let row = [];
    let currentString = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            currentString += '"'; 
            i++; 
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            row.push(currentString);
            currentString = '';
        } else if (char === '\n' && !insideQuotes) {
            row.push(currentString);
            rows.push(row);
            row = [];
            currentString = '';
        } else {
            currentString += char;
        }
    }
    if (currentString !== '' || row.length > 0) {
        row.push(currentString);
        rows.push(row);
    }
    return rows;
}

async function fetchPrompts() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        
        const rows = parseCSV(data);
        
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length >= 2) {
                let imageName = rows[i][0].trim();
                let promptText = rows[i][1].trim();
                
                if (!imageName) continue; 
                
                if (!imageName.includes('.')) {
                    imageName += '.jpg';
                }
                
                let finalImageUrl = `images/${imageName}`;
                createCard(finalImageUrl, promptText);
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function createCard(imageUrl, promptText) {
    const card = document.createElement('div');
    card.className = "glass-card flex flex-col h-full"; 
    
    card.innerHTML = `
        <div class="relative w-full aspect-[2/3] overflow-hidden rounded-t-2xl shrink-0">
            <img src="${imageUrl}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Generated AI Image" onerror="this.src='https://via.placeholder.com/400x600?text=Image+Not+Found'">
        </div>
        
        <div class="p-5 flex flex-col flex-grow h-60"> 
            <div class="text-xs text-gray-400 font-light leading-relaxed flex-grow mb-4 overflow-y-auto pr-2 custom-scrollbar prompt-container"></div>
            
            <button class="copy-btn shrink-0 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-cyan-500 hover:text-black transition-colors duration-300 py-2.5 rounded-xl text-white text-sm font-medium tracking-wide border border-white/5 hover:border-transparent mt-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Prompt
            </button>
        </div>
    `;

    const textContainer = card.querySelector('.prompt-container');
    textContainer.innerText = promptText;

    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(promptText).then(() => {
            showToast();
        });
    });

    gallery.appendChild(card);
}

fetchPrompts();