document.addEventListener("DOMContentLoaded", function () {
    const telefonInput = document.querySelector('input[name="telefon"]');
    const ismInput = document.querySelector('input[name="ism"]');
    const lokatsiyaInput = document.querySelector('input[name="lokatsiya"]');

    telefonInput.addEventListener("input", async function () {
        const telefon = telefonInput.value.trim();
        if (telefon.length >= 9) { // Kamida 9 ta belgi kiritilganda so‘rov yuboriladi
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
