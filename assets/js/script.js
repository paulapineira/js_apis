// API de donde se obtienen los datos
const apiUrl = 'https://mindicador.cl/api';

// Array con las monedas que se utilizaran para traer solo los datos necesarios
const currencies = ['uf', 'dolar', 'euro'];

const ctx = document.getElementById('myChart');
let myChart;

// Manejo de errores
const handleError = (error) => {
    document.querySelector('h1').style.display = 'none';
    document.querySelector('.card').style.display = 'none';
    document.querySelector('.error').style.display = 'flex';
    document.querySelector('.errorMessage').textContent = 'Lo siento, hubo un error';
    console.error(error);
};

// Generar opciones para seleccionar moneda
const paintCurrencies = (currencies) => {
    const selectCurrencies = document.querySelector('#currencies');
    const html = currencies.reduce((acc, currency) => {
        return acc + `<option value="${currency.codigo}" id="${currency.codigo}">${currency.codigo}</option>`;
    }, '<option disabled selected>Seleccione moneda</option>');
    selectCurrencies.innerHTML = html;
};

// Obtención datos de la API
const getCurrencies = async () => {
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        const currenciesList = currencies.map(currency => ({
            codigo: currency.charAt(0).toUpperCase() + currency.slice(1),
            valor: data[currency].valor
        }));
        paintCurrencies(currenciesList);
        return data;
    } catch (error) {
        handleError(error);
    }
};

//Simbolos de la moneda
const currencySymbols = {
    dolar: "USD",
    euro: "€"
};
const getSymbolCurrency = (actualCurrency) => {
    return currencySymbols[actualCurrency] || "";
};


// Configuración de gráfico

const confChart = (data) => {
    const typeOfChart = "line";
    data.serie.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const last10Days = data.serie.slice(-10);
    const days = last10Days.map(info => info.fecha.slice(0, 10));
    const title = data.codigo.toUpperCase();
    const values = last10Days.map(info => info.valor);
    const chartTitle = `${title} - Historial últimos 10 días`;

    return {
        type: typeOfChart,
        data: {
            labels: days,
            datasets: [{
                label: chartTitle,
                borderWidth: 2,
                borderColor: 'red',
                backgroundColor: 'red',
                data: values
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        drawOnChartArea: true,
                        color: '#E2E3E5',
                        borderColor: '#E2E3E5'
                    },
                    ticks: {
                        color: '#4a4a4a'
                    },
                    border: {
                        color: '#4a4a4a'
                    }
                },
                y: {
                    grid: {
                        drawOnChartArea: true,
                        color: '#E2E3E5'
                    },
                    ticks: {
                        color: '#4a4a4a'
                    },
                    border: {
                        color: '#4a4a4a'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'black'
                    }
                }
            }
        }
    };
};

const showModal = () => {
    const modal = document.querySelector('#myModal');
    modal.style.display = 'block';
    modal.querySelector('#OK').addEventListener('click', () => modal.style.display = 'none');
};


//Calcular valor de moneda
const calcMoneyExchange = async () => {
    const clpCantidad = document.querySelector('#clpCantidad').value;
    const selectedIndex = document.querySelector('#currencies').selectedIndex;
    
    if (!clpCantidad || selectedIndex === 0) {
        showModal();
    } else {
        const actualCurrency = document.querySelector('#currencies').selectedOptions[0].value.toLowerCase();
        const currencySymbol = getSymbolCurrency(actualCurrency);
        
        try {
            document.querySelector('#answer').style.display = 'none';
            document.querySelector('#valueOfDay').style.display = 'none';
            document.querySelector('.animatedLoader').style.display = 'inline-block';
            
            const res = await fetch(`${apiUrl}/${actualCurrency}`);
            const data = await res.json();
            const actualValueCurrency = Number(data.serie[0].valor);
            const change = clpCantidad / actualValueCurrency;
            
            setTimeout(() => {
                document.querySelector('.animatedLoader').style.display = 'none';
                document.querySelector('#answer').style.display = 'inline-block';
                document.querySelector('#valueOfDay').style.display = 'block';
                document.querySelector('#answer').innerText = `Resultado ${currencySymbol} ${change.toFixed(2)}`;
                document.querySelector('#valueOfDay').innerText = `Valor del día: $${actualValueCurrency.toFixed(2)}`;
                
                const chartConfig = confChart(data);
                if (myChart) {
                    myChart.destroy();
                }
                myChart = new Chart(ctx, chartConfig);
                document.querySelector(".chart").style.display = "flex";
            }, 1000);
        } catch (error) {
            handleError(error);
        }
    }
};

getCurrencies();
const buttonCalc = document.querySelector('#buscar');
buttonCalc.addEventListener('click', calcMoneyExchange);
