function checkStockAlert() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock");
  var data = sheet.getDataRange().getValues();

  var message = "⚠️ STOK RENDAH:\n\n";
  var alert = false;

  for (var i = 1; i < data.length; i++) {

    var bahan = data[i][0];        // Column A
    var stok_awal = data[i][1];    // Column B
    var digunakan = data[i][2];    // Column C
    var baki = data[i][3];         // Column D
    var minimum = data[i][4];      // Column E
    // auto kira baki kalau kosong
    if (!baki) {
      baki = stok_awal - digunakan;
      sheet.getRange(i + 1, 4).setValue(baki);
    }

    // check stok rendah
    if (baki <= minimum) {
      message += "🔴 " + bahan + "\n";
      message += "Baki: " + baki + " | Min: " + minimum + "\n\n";

      // highlight merah
      sheet.getRange(i + 1, 4).setBackground("#ff4d4d");

      alert = true;
    } else {
      // reset warna kalau ok
      sheet.getRange(i + 1, 4).setBackground("#ffffff");
    }
  }

  // hantar telegram kalau ada alert
  if (alert) {
    sendTelegram(message);
  }
}
function splitMaterialLabel(label) {
  var raw = String(label || "").trim();
  if (!raw) {
    return { material: "", size: "" };
  }

  var markers = [" | ", " - ", " / ", " :: "];
  for (var j = 0; j < markers.length; j++) {
    var marker = markers[j];
    var idx = raw.indexOf(marker);
    if (idx > -1) {
      return {
        material: raw.slice(0, idx).trim(),
        size: raw.slice(idx + marker.length).trim()
      };
    }
  }

  return { material: raw, size: "" };
}

// ======================
// doGet
// ======================
function doGet(e) {
  if (e.parameter.action === "getMaterials") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock");
    const data = sheet.getDataRange().getValues();

    var items = [];
    var seen = {};

    for (var i = 1; i < data.length; i++) {
      var materialName = String(data[i][0] || "").trim();
      if (!materialName) continue;

      var key = materialName.toLowerCase();
      if (!seen[key]) {
        items.push(materialName);
        seen[key] = true;
      }
    }

    return ContentService.createTextOutput(JSON.stringify(items.sort()))
             .setMimeType(ContentService.MimeType.JSON);
  }

  if (e.parameter.action === "getSizesByMaterial") {
    var material = (e.parameter.material || "").trim();
    if (!material) {
      return ContentService.createTextOutput(JSON.stringify([]))
               .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock");
    const data = sheet.getDataRange().getValues();
    var sizes = [];
    var seen = {};

    for (var i = 1; i < data.length; i++) {
      var rowMaterial = String(data[i][0] || "").trim();
      var rowSize = String(data[i][5] || "").trim();

      if (rowMaterial.toLowerCase() === material.toLowerCase() && rowSize) {
        var key = rowSize.toLowerCase();
        if (!seen[key]) {
          sizes.push(rowSize);
          seen[key] = true;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(sizes))
             .setMimeType(ContentService.MimeType.JSON);
  }

  if (e.parameter.action === "getBalanceByMaterial") {
    var material = (e.parameter.material || "").trim();
    var targetSize = (e.parameter.saiz || "").trim();

    if (!material) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Material tidak dinyatakan" }))
               .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock");
    const data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      var rowMaterial = String(data[i][0] || "").trim();
      var rowSize = String(data[i][5] || "").trim();
      var sameName = rowMaterial.toLowerCase() === material.toLowerCase();
      var sameSize = !targetSize || rowSize.toLowerCase() === targetSize.toLowerCase();

      if (sameName && sameSize) {
        // Lajur E ialah "minimum", bukan unit; sheet Stock tiada lajur unit.
        return ContentService.createTextOutput(JSON.stringify({
          material: rowMaterial,
          baki: data[i][3],
          minimum: data[i][4],
          saiz: rowSize
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Material tidak dijumpai" }))
             .setMimeType(ContentService.MimeType.JSON);
  }

  if (e.parameter.action === "getUsageHistory") {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MaterialUsage");
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
             .setMimeType(ContentService.MimeType.JSON);
  }

  var history = [];

  for (var i = 1; i < data.length; i++) {
    history.push({
      timestamp : data[i][0] ? new Date(data[i][0]).toLocaleString('ms-MY') : "",
      nama      : data[i][1],
      material  : data[i][2],
      kuantiti  : data[i][3],
      unit      : data[i][4],
      tujuan    : data[i][5]
    });
  }

  // Terbalik supaya paling baru di atas
  history.reverse();

  return ContentService.createTextOutput(JSON.stringify(history))
           .setMimeType(ContentService.MimeType.JSON);
}

  // Senarai stok penuh untuk halaman Restok & Senarai Stock
  // Sheet Stock: A bahan | B stok awal | C digunakan | D baki | E minimum | F saiz
  if (e.parameter.action === "getStock") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock");
    const data = sheet.getDataRange().getValues();
    var stock = [];

    for (var i = 1; i < data.length; i++) {
      var materialName = String(data[i][0] || "").trim();
      if (!materialName) continue;

      stock.push({
        material: materialName,
        saiz: String(data[i][5] || "").trim(),
        baki: data[i][3],
        minimum: data[i][4]
      });
    }

    return ContentService.createTextOutput(JSON.stringify(stock))
             .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: "Action tidak dikenali" }))
           .setMimeType(ContentService.MimeType.JSON);
}

// ======================
// doPost - VERSI DIPERBAIKI
// ======================
function doPost(e) {
  try {
    var type = e.parameter.type || "";

    // ==================== TELEGRAM (mesej manual dari web) ====================
    if (type === "telegram") {
      var text = (e.parameter.message || "").trim();
      if (!text) {
        return ContentService.createTextOutput("Error: Mesej kosong");
      }

      var result = sendTelegram(text, "HTML");
      return ContentService.createTextOutput(
        result.ok ? "Telegram Success" : "Error: " + (result.description || "Mesej tidak dihantar")
      );
    }

    // ==================== RESTOCK ====================
    if (type === "restock") {
      var material = (e.parameter.material || "").trim();
      var kuantiti = Number(e.parameter.kuantiti) || 0;
      var targetSize = (e.parameter.saiz || "").trim();

      if (!material || kuantiti <= 0) {
        return ContentService.createTextOutput("Error: Data restock tidak lengkap");
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var stockSheet = ss.getSheetByName("Stock");
      var restockSheet = ss.getSheetByName("Restock");

      var materialInfo = splitMaterialLabel(material);
      var materialName = materialInfo.material || material;
      var data = stockSheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        var rowMaterial = String(data[i][0] || "").trim();
        var rowSize = String(data[i][5] || "").trim();
        var sameName = rowMaterial.toLowerCase() === materialName.toLowerCase();
        var sameSize = !targetSize || !rowSize || rowSize.toLowerCase() === targetSize.toLowerCase();

        if (sameName && sameSize) {
          var stokAwalBaru = Number(data[i][1]) + kuantiti;
          var bakiBaru     = Number(data[i][3]) + kuantiti;

          stockSheet.getRange(i + 1, 2).setValue(stokAwalBaru);
          stockSheet.getRange(i + 1, 4).setValue(bakiBaru);

          restockSheet.appendRow([new Date(), materialName, kuantiti, targetSize || rowSize]);
          sendTelegramRestock(materialName + (targetSize ? " (" + targetSize + ")" : ""), kuantiti);

          return ContentService.createTextOutput("Restock Success");
        }
      }
      return ContentService.createTextOutput("Error: Material tidak dijumpai");
    }

    // ==================== MATERIAL USAGE ====================
    var nama    = (e.parameter.nama || "").trim();
    var tujuan  = (e.parameter.tujuan || "").trim();
    var itemsJson = e.parameter.items;

    if (!nama) return ContentService.createTextOutput("Error: Nama peminjam diperlukan");
    if (!itemsJson) return ContentService.createTextOutput("Error: Tiada barang dipilih");

    var items = JSON.parse(itemsJson);

    if (!Array.isArray(items) || items.length === 0) {
      return ContentService.createTextOutput("Error: Tiada barang");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stockSheet = ss.getSheetByName("Stock");
    var usageSheet = ss.getSheetByName("MaterialUsage");

    if (!stockSheet || !usageSheet) {
      return ContentService.createTextOutput("Error: Sheet Stock atau MaterialUsage tidak dijumpai");
    }

    var stockData = stockSheet.getDataRange().getValues();
    var timestamp = new Date();

    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      var material = (item.material || "").trim();
      var kuantiti = Number(item.kuantiti) || 0;
      var unit     = (item.unit || "").trim();
      var itemSize = String(item.saiz || "").trim();
      var materialInfo = splitMaterialLabel(material);
      var materialName = materialInfo.material || material;
      var targetSize = itemSize || materialInfo.size || "";

      if (!material || kuantiti <= 0) {
        return ContentService.createTextOutput("Error: Data tidak lengkap untuk " + material);
      }

      var found = false;

      for (var i = 1; i < stockData.length; i++) {
        var rowMaterial = String(stockData[i][0] || "").trim();
        var rowSize = String(stockData[i][5] || "").trim();
        var sameName = rowMaterial.toLowerCase() === materialName.toLowerCase();
        var sameSize = !targetSize || (rowSize && rowSize.toLowerCase() === targetSize.toLowerCase());

        if (sameName && sameSize) {

          var stokAwal     = Number(stockData[i][1]) || 0;
          var stokDigunakan = Number(stockData[i][2]) || 0;
          var baki         = Number(stockData[i][3]) || 0;

          if (baki <= 0) {
            sendTelegramOutOfStock(materialName + (targetSize ? " (" + targetSize + ")" : ""));
            return ContentService.createTextOutput(`❌ STOK TELAH HABIS!\nMaterial: ${materialName}${targetSize ? " | " + targetSize : ""}`);
          }

          if (kuantiti > baki) {
            sendTelegramAlert(materialName + (targetSize ? " (" + targetSize + ")" : ""), baki);
            return ContentService.createTextOutput(
              `❌ STOK TIDAK CUKUP!\nMaterial: ${materialName}${targetSize ? " | " + targetSize : ""}\nBaki: ${baki}\nDiminta: ${kuantiti}`
            );
          }

          stokDigunakan += kuantiti;
          baki = stokAwal - stokDigunakan;

          stockSheet.getRange(i + 1, 3).setValue(stokDigunakan);
          stockSheet.getRange(i + 1, 4).setValue(baki);

          usageSheet.appendRow([timestamp, nama, materialName, kuantiti, unit, tujuan]);

          if (baki <= 10 && baki > 0) {
            sendTelegramAlert(materialName + (targetSize ? " (" + targetSize + ")" : ""), baki);
          }

          found = true;
          break;
        }
      }

      if (!found) {
        return ContentService.createTextOutput(`Error: Material "${materialName}${targetSize ? " | " + targetSize : ""}" tidak dijumpai`);
      }
    }

    // Hantar SATU notifikasi Telegram untuk semua barang
    sendTelegramUsageMulti(nama, tujuan, items);

    return ContentService.createTextOutput(`Berjaya! ${items.length} barang telah direkodkan.`);
    
  } catch (err) {
    console.log("doPost Error: " + err.message);   // Untuk debug
    return ContentService.createTextOutput("Error: " + err.message);
  }
}

// ======================
// TELEGRAM FUNCTIONS - WAJIB ADA
// ======================
// Token & chat ID disimpan dalam Script Properties (Project Settings > Script properties):
//   TELEGRAM_TOKEN   = token bot dari @BotFather
//   TELEGRAM_CHAT_ID = chat ID penerima
// Jangan tulis token terus dalam kod.
function sendTelegram(text, parseMode) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("TELEGRAM_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    console.log("Telegram belum dikonfigurasi: set TELEGRAM_TOKEN dan TELEGRAM_CHAT_ID dalam Script Properties");
    return { ok: false, description: "Telegram belum dikonfigurasi" };
  }

  var payload = { chat_id: chatId, text: text };
  if (parseMode) payload.parse_mode = parseMode;

  try {
    var response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    return JSON.parse(response.getContentText());
  } catch (err) {
    console.log("Telegram error: " + err.message);
    return { ok: false, description: err.message };
  }
}

function sendTelegramUsage(nama, material, kuantiti, unit, tujuan) {
  var msg = "📦 Material Dipinjam\n" +
            "👤 Nama: " + nama + "\n" +
            "📦 Material: " + material + "\n" +
            "🔢 Kuantiti: " + kuantiti + 
            (unit ? "unit " + unit : "") + "\n" +   // Tambah unit di sini
            "📍 Tujuan: " + tujuan;

  try {
    sendTelegram(msg);
  } catch(err) {
    Logger.log("Telegram usage error: " + err);
  }
}

function sendTelegramAlert(material, baki) {
  var msg = "⚠️ STOCK RENDAH\nMaterial: " + material + "\nBaki Tinggal: " + baki;

  try {
    sendTelegram(msg);
  } catch(err) {
    Logger.log("Telegram alert error: " + err);
  }
}

function sendTelegramOutOfStock(material) {
  var msg = "❌ STOCK HABIS\nMaterial: " + material;

  try {
    sendTelegram(msg);
  } catch(err) {
    Logger.log("Telegram out-of-stock error: " + err);
  }
}

function sendTelegramRestock(material, kuantiti) {
  var msg = "🔄 RESTOCK BARANG\nMaterial: " + material + "\nKuantiti Tambah: " + kuantiti;

  try {
    sendTelegram(msg);
  } catch(err) {
    Logger.log("Telegram restock error: " + err);
  }
}
// ======================
// Dapatkan senarai material untuk autocomplete
// ======================
function getMaterialList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stockSheet = ss.getSheetByName("Stock");
    
    if (!stockSheet) return ["Error: Sheet Stock tidak dijumpai"];
    
    var data = stockSheet.getDataRange().getValues();
    var materials = [];
    
    for (var i = 1; i < data.length; i++) {
      var mat = String(data[i][0]).trim();
      if (mat) materials.push(mat);
    }
    
    return materials.sort();
  } catch (err) {
    console.log("Error getMaterialList: " + err.message);
    return ["Ralat memuat senarai"];
  }
}

// ======================
// TELEGRAM USAGE MULTI (dengan Unit)
// ======================
function sendTelegramUsageMulti(nama, tujuan, items) {
  var msg = "📦 **Material Dipinjam (Multi)**\n" +
            "👤 Nama: " + nama + "\n" +
            "📍 Tujuan: " + tujuan + "\n\n" +
            "📋 Senarai Barang:\n";

  items.forEach(function(item) {
    var unitText = item.unit ? " " + item.unit : "";
    msg += "• " + item.material + " → " + item.kuantiti + unitText + "\n";
  });

  msg += "\nJumlah barang: " + items.length + "\n⏰ " + new Date().toLocaleString('ms-MY');

  try {
    sendTelegram(msg);
    console.log("Telegram Multi Usage berjaya");
  } catch(err) {
    console.log("Telegram multi usage error: " + err.message);
  }
}
