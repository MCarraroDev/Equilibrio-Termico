let corpo1, corpo2;
let t = 0;
let sliders = {};
let isPaused = false;
let isEquilibriumReached = false; // Nuova variabile per rilevare l'equilibrio

function setup() {
    const canvas = createCanvas(800, 300);
    canvas.parent('canvas-container');
    
    // Inizializza corpi
    corpo1 = { massa: 100, caloreSpec: 1, temp: 90 };
    corpo2 = { massa: 150, caloreSpec: 0.5, temp: 20 };
    
    // Crea slider
    createSliderPanel();
}

function draw() {
    background(26);
    
    // Disegna corpi attaccati
    drawCorpi();
    
    // Simula solo se non in pausa e non in equilibrio
    if (!isPaused && !isEquilibriumReached) {
        simulateHeatTransfer();
        t += 0.1; // Incrementa il timer
        
        // Controlla se l'equilibrio è stato raggiunto
        checkEquilibrium();
    }
    
    displayInfo();
}



function createSliderPanel() {
    const params = [
        { id: 'm1', label: 'Massa Corpo 1 (g)', min: 10, max: 500, value: 100, step: 1 },
        { id: 'c1', label: 'Calore Spec. 1 (cal/g°C)', min: 0.1, max: 2, value: 1, step: 0.1 },
        { id: 't1', label: 'Temp. Iniziale 1 (°C)', min: 0, max: 100, value: 90, step: 1 },
        { id: 'm2', label: 'Massa Corpo 2 (g)', min: 10, max: 500, value: 150, step: 1 },
        { id: 'c2', label: 'Calore Spec. 2 (cal/g°C)', min: 0.1, max: 2, value: 0.5, step: 0.1 },
        { id: 't2', label: 'Temp. Iniziale 2 (°C)', min: 0, max: 100, value: 20, step: 1 },
        { id: 'k', label: 'Velocità Scambio (k)', min: 0.001, max: 0.1, value: 0.01, step: 0.001 }
    ];

    params.forEach((param, index) => {
        const col = select(index < 3 ? '#col1' : index < 6 ? '#col2' : '#col3');
        const div = createDiv().addClass('slider-item').parent(col);
        
        createElement('label', param.label).parent(div);
        const slider = createSlider(param.min, param.max, param.value, param.step)
            .parent(div)
            .addClass('slider');
        
        const valueDisplay = createSpan(param.value).parent(div).style('color', '#ff6b6b');
        
        // Aggiorna valori in tempo reale
        slider.input(() => {
            valueDisplay.html(slider.value().toFixed(2));
            updateParameter(param.id, slider.value());
        });
        
        sliders[param.id] = { slider, valueDisplay };
    });
}

function updateParameter(id, value) {
    switch(id) {
        case 'm1': corpo1.massa = value; break;
        case 'c1': corpo1.caloreSpec = value; break;
        case 't1': corpo1.temp = value; break;
        case 'm2': corpo2.massa = value; break;
        case 'c2': corpo2.caloreSpec = value; break;
        case 't2': corpo2.temp = value; break;
        case 'k': window.k = value; break;
    }
}

function drawCorpi() {
    noStroke();
    
    // Corpo 1 (sinistra)
    let color1 = getTemperatureColor(corpo1.temp);
    fill(color1);
    rect(200, 100, 200, 100, 10, 0, 0, 10);
    
    // Corpo 2 (destra, attaccato)
    let color2 = getTemperatureColor(corpo2.temp);
    fill(color2);
    rect(400, 100, 200, 100, 0, 10, 10, 0);
}

function getTemperatureColor(temp) {
    // Mappa la temperatura da 0-100°C a colore (blu → rosso)
    let r = map(temp, 0, 100, 0, 255);
    let b = map(temp, 0, 100, 255, 0);
    return color(r, 0, b);
}

function simulateHeatTransfer() {
    const k = window.k || 0.01;
    let deltaT = corpo1.temp - corpo2.temp;
    let Q = k * deltaT;
    
    // Calcola trasferimento energetico
    corpo1.temp -= Q / (corpo1.massa * corpo1.caloreSpec);
    corpo2.temp += Q / (corpo2.massa * corpo2.caloreSpec);
    
    // Limita temperatura per stabilità
    corpo1.temp = constrain(corpo1.temp, 0, 100);
    corpo2.temp = constrain(corpo2.temp, 0, 100);
}


function togglePause() {
    isPaused = !isPaused;
    document.querySelector('button:first-child').textContent = 
        isPaused ? '▶ Riprendi' : '⏸ Pausa';
}

function checkEquilibrium() {
    const tolerance = 0.1; // Tolleranza per l'equilibrio (0.1°C)
    if (abs(corpo1.temp - corpo2.temp) < tolerance) {
        isEquilibriumReached = true; // Ferma il timer
    }
}

function displayInfo() {
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text(`⏱ Tempo: ${t.toFixed(1)} s`, 20, 30);
    text(`🌡 Temperatura Corpo 1: ${corpo1.temp.toFixed(1)} °C`, 20, 60);
    text(`🌡 Temperatura Corpo 2: ${corpo2.temp.toFixed(1)} °C`, 20, 90);
    
    // Mostra messaggio di equilibrio
    if (isEquilibriumReached) {
        textSize(20);
        textAlign(CENTER);
        fill(0, 255, 0);
        text('Equilibrio Termico Raggiunto!', width / 2, height - 20);
    }
}

function resetSimulation() {
    corpo1.temp = sliders.t1.slider.value();
    corpo2.temp = sliders.t2.slider.value();
    t = 0;
    isEquilibriumReached = false; // Ripristina lo stato di equilibrio
}