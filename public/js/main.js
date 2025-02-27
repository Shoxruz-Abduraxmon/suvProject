// document.addEventListener("DOMContentLoaded", function () {
//     const editButtons = document.querySelectorAll(".edit-order");
//     const editForm = document.getElementById("editForm");
//     const orderForm = document.getElementById("orderForm");
//     const deleteOrder = document.getElementById("deleteOrder");

//     let selectedOrderId = null;

//     // "O‘zgartirish" tugmachasi bosilganda
//     editButtons.forEach(button => {
//         button.addEventListener("click", async function () {
//             selectedOrderId = this.getAttribute("data-id");

//             try {
//                 const response = await fetch(`/get-order?id=${selectedOrderId}`);
//                 const data = await response.json();

//                 if (data.order) {
//                     document.getElementById("orderId").value = data.order._id;
//                     document.getElementById("ism").value = data.order.ism;
//                     document.getElementById("miqdor").value = data.order.miqdor;
//                     document.getElementById("lokatsiya").value = data.order.lokatsiya;
//                     document.getElementById("kuryer").value = data.order.kuryer;

//                     editForm.style.display = "block";
//                 }
//             } catch (error) {
//                 console.error("Xatolik:", error);
//             }
//         });
//     });

//     // Buyurtmani saqlash
//     orderForm.addEventListener("submit", async function (e) {
//         e.preventDefault();

//         const updatedOrder = {
//             ism: document.getElementById("ism").value,
//             miqdor: document.getElementById("miqdor").value,
//             lokatsiya: document.getElementById("lokatsiya").value,
//             kuryer: document.getElementById("kuryer").value
//         };

//         try {
//             await fetch(`/update-order/${selectedOrderId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(updatedOrder)
//             });

//             alert("Buyurtma yangilandi!");
//             location.reload();
//         } catch (error) {
//             console.error("Buyurtmani yangilashda xatolik:", error);
//         }
//     });

//     // Buyurtmani o‘chirish
//     deleteOrder.addEventListener("click", async function () {
//         if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
//             try {
//                 await fetch(`/delete-order/${selectedOrderId}`, {
//                     method: "DELETE"
//                 });

//                 alert("Buyurtma o‘chirildi!");
//                 location.reload();
//             } catch (error) {
//                 console.error("Buyurtmani o‘chirishda xatolik:", error);
//             }
//         }
//     });
// });
