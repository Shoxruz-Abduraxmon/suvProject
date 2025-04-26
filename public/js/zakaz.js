document.addEventListener("DOMContentLoaded", function () {
    const telefonInput = document.querySelector('input[name="telefon"]');
    const ismInput = document.querySelector('input[name="ism"]');
    const lokatsiyaInput = document.querySelector('input[name="lokatsiya"]');

    telefonInput.addEventListener("input", async function () {
        const telefon = telefonInput.value.trim();
        if (telefon.length >= 9) { 
            try {
                const response = await fetch(`/get-order?telefon=${telefon}`);
                const data = await response.json();

                if (data.order) {
                    ismInput.value = data.order.ism || '';
                    lokatsiyaInput.value = data.order.lokatsiya || '';
                } else {
                    ismInput.value = '';
                    lokatsiyaInput.value = '';
                }
            } catch (error) {
                console.error('Ma’lumot olishda xatolik:', error);
            }
        }
    });
});



function filterClients(days) {
    let count = 0;
    document.querySelectorAll(".client-row").forEach(row => {
        row.style.display = "none";
    });

    if (days === 10) {
        document.querySelectorAll(".inactive-10").forEach(row => {
            row.style.display = "";
            count++;
        });
        document.getElementById("filteredCount").innerText = `10+ kun ishlamagan mijozlar: ${count} ta`;
    } else if (days === 20) {
        document.querySelectorAll(".inactive-20").forEach(row => {
            row.style.display = "";
            count++;
        });
        document.getElementById("filteredCount").innerText = `20+ kun ishlamagan mijozlar: ${count} ta`;
    }
}

function resetFilter() {
    document.querySelectorAll(".client-row").forEach(row => {
        row.style.display = "";
    });
    document.getElementById("filteredCount").innerText = "Barcha mijozlar";
}