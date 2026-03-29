let inventoryData = JSON.parse(localStorage.getItem("app_inventory")) || [];
let deleteTargetIndex = null;

const tableBody = document.getElementById("tableBody");
const itemForm = document.getElementById("itemForm");
const errorMsg = document.getElementById("error-msg");
const deleteModal = document.getElementById("deleteModal");

function saveToLocalStorage() {
  localStorage.setItem("app_inventory", JSON.stringify(inventoryData));
}

function render() {
  tableBody.innerHTML = "";

  if (inventoryData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#6b7280;">Belum ada data barang.</td></tr>`;
    return;
  }

  inventoryData.forEach((item, index) => {
    const totalTersedia = item.stok - item.defect - item.hilang;
    const isCritical = totalTersedia <= 0;

    const tr = document.createElement("tr");
    if (isCritical) tr.classList.add("critical-stock");

    tr.innerHTML = `
            <td>${item.nama}</td>
            <td><input type="number" min="0" value="${item.stok}" onchange="updateItem(${index}, 'stok', this.value)"></td>
            <td><input type="number" min="0" value="${item.defect}" onchange="updateItem(${index}, 'defect', this.value)"></td>
            <td><input type="number" min="0" value="${item.hilang}" onchange="updateItem(${index}, 'hilang', this.value)"></td>
            <td class="total-col">${totalTersedia}</td>
            <td><button class="btn-danger" onclick="promptDelete(${index})">Hapus</button></td>
        `;
    tableBody.appendChild(tr);
  });
}

itemForm.addEventListener("submit", function (e) {
  e.preventDefault();
  errorMsg.style.display = "none";

  const nama = document.getElementById("nama").value.trim();
  const stok = parseInt(document.getElementById("stok").value) || 0;
  const defect = parseInt(document.getElementById("defect").value) || 0;
  const hilang = parseInt(document.getElementById("hilang").value) || 0;

  if (stok < 0 || defect < 0 || hilang < 0) {
    showError("Nilai Stok, Defect, dan Hilang tidak boleh negatif.");
    return;
  }

  if (!nama) {
    showError("Nama barang harus diisi.");
    return;
  }

  inventoryData.push({ nama, stok, defect, hilang });
  saveToLocalStorage();
  render();
  itemForm.reset();
});

window.updateItem = function (index, field, newValue) {
  const parsedValue = parseInt(newValue) || 0;

  if (parsedValue < 0) {
    showError(`Nilai ${field} tidak boleh negatif. Perubahan dibatalkan.`);
    render();
    return;
  }

  inventoryData[index][field] = parsedValue;
  errorMsg.style.display = "none";
  saveToLocalStorage();
  render();
};

window.promptDelete = function (index) {
  deleteTargetIndex = index;
  document.getElementById("deleteItemName").innerText =
    inventoryData[index].nama;
  deleteModal.classList.add("active");
};

window.executeDelete = function () {
  if (deleteTargetIndex !== null) {
    inventoryData.splice(deleteTargetIndex, 1);
    saveToLocalStorage();
    render();
    closeModal();
  }
};

window.closeModal = function () {
  deleteModal.classList.remove("active");
  deleteTargetIndex = null;
};

function showError(message) {
  errorMsg.innerText = message;
  errorMsg.style.display = "block";
}

render();
